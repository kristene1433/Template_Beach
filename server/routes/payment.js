const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();
const webhookRouter = express.Router();

// Stripe webhook handler for payment completion - MUST use raw body
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        // Create payment record from session metadata
        const payment = new Payment({
          userId: session.metadata.userId,
          stripePaymentIntentId: session.payment_intent,
          stripeCustomerId: session.customer,
          amount: Math.round(parseFloat(session.metadata.amount) * 100), // Convert to cents
          currency: 'usd',
          paymentType: session.metadata.paymentType,
          description: `${session.metadata.paymentType} payment`,
          status: 'succeeded',
          paidAt: new Date(),
          metadata: {
            propertyAddress: session.metadata.propertyAddress,
            checkoutSessionId: session.id
          }
        });

        // Get payment intent details for additional info
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        const charge = paymentIntent.charges?.data?.[0];
        if (charge?.payment_method_details?.card) {
          const card = charge.payment_method_details.card;
          payment.cardLast4 = card.last4;
          payment.cardBrand = card.brand;
        }

        // Get receipt URL from charge if available
        payment.receiptUrl = payment.receiptUrl || charge?.receipt_url || null;

        await payment.save();
        console.log(`Payment ${payment._id} created and marked as successful`);
      } catch (error) {
        console.error('Error processing webhook:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      
      try {
        const payment = await Payment.findOne({ 
          stripePaymentIntentId: paymentIntent.id 
        });

        if (payment) {
          payment.status = 'failed';
          payment.failedAt = new Date();
          payment.error = {
            code: paymentIntent.last_payment_error?.code || 'payment_failed',
            message: paymentIntent.last_payment_error?.message || 'Payment failed'
          };
          await payment.save();
          console.log(`Payment ${payment._id} marked as failed`);
        }
      } catch (error) {
        console.error('Error processing failed payment webhook:', error);
      }
      break;

    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      try {
        let payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
        if (!payment) {
          payment = new Payment({
            userId: pi.metadata?.userId,
            stripePaymentIntentId: pi.id,
            stripeCustomerId: pi.customer,
            amount: pi.amount,
            currency: pi.currency || 'usd',
            paymentType: pi.metadata?.paymentType || 'deposit',
            description: `${pi.metadata?.paymentType || 'deposit'} payment`,
            status: 'succeeded',
            paidAt: new Date(),
            metadata: {
              propertyAddress: pi.metadata?.propertyAddress,
              checkoutSessionId: pi.metadata?.checkoutSessionId
            }
          });
        } else {
          payment.status = 'succeeded';
          payment.paidAt = new Date();
        }
        const charge = pi.charges?.data?.[0];
        payment.receiptUrl = charge?.receipt_url || payment.receiptUrl;
        if (charge?.payment_method_details?.card) {
          payment.cardBrand = charge.payment_method_details.card.brand;
          payment.cardLast4 = charge.payment_method_details.card.last4;
        }
        await payment.save();
      } catch (err) {
        console.error('payment_intent.succeeded handling error:', err);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

// Mount webhook with raw body parser on dedicated router
webhookRouter.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Create Stripe Checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { amount, paymentType = 'deposit', description, successUrl, cancelUrl } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get user information
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        metadata: {
          userId: user._id.toString(),
          propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
        }
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: paymentType === 'deposit' ? 'Security Deposit' : 'Rent Payment',
              description: description || `${paymentType} payment for ${user.firstName} ${user.lastName}`,
              metadata: {
                paymentType,
                userId: user._id.toString()
              }
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: user._id.toString(),
        paymentType,
        amount: amount.toString(),
        propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
      },
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: {
          userId: user._id.toString(),
          paymentType,
          propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
        }
      }
    });

    // Don't create payment record here - it will be created when webhook fires
    // The session metadata contains all the information we need

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ error: 'Server error creating checkout session' });
  }
});

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ 
      stripePaymentIntentId: paymentIntentId,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      payment.status = 'succeeded';
      payment.paidAt = new Date();
      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      
      if (paymentIntent.charges.data[0]?.payment_method_details?.card) {
        const card = paymentIntent.charges.data[0].payment_method_details.card;
        payment.cardLast4 = card.last4;
        payment.cardBrand = card.brand;
      }

      await payment.save();

      res.json({
        message: 'Payment confirmed successfully',
        payment,
        receiptUrl: payment.receiptUrl
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.error = {
        code: 'payment_method_required',
        message: 'Payment method is required'
      };
      await payment.save();

      res.status(400).json({
        error: 'Payment method is required',
        payment
      });
    } else {
      res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Server error confirming payment' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Payment history fetch error:', error);
    res.status(500).json({ error: 'Server error fetching payment history' });
  }
});

// Get payment details by Checkout Session ID
router.get('/by-session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    let payment = await Payment.findOne({
      userId: req.user._id,
      'metadata.checkoutSessionId': sessionId
    });

    // If the webhook hasn't written the payment yet, pull details directly from Stripe
    if (!payment) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) return res.status(404).json({ error: 'Stripe session not found' });

        const pi = session.payment_intent
          ? await stripe.paymentIntents.retrieve(session.payment_intent)
          : null;

        const amount = session.amount_total || (pi ? pi.amount : undefined);
        const receiptUrl = pi?.charges?.data?.[0]?.receipt_url || null;
        const card = pi?.charges?.data?.[0]?.payment_method_details?.card;

        return res.json({
          payment: {
            amount: amount ?? 0,
            currency: 'usd',
            paymentType: session?.metadata?.paymentType || 'deposit',
            description: `${session?.metadata?.paymentType || 'deposit'} payment`,
            status: pi?.status === 'succeeded' ? 'succeeded' : 'processing',
            paidAt: pi?.status === 'succeeded' ? new Date() : null,
            createdAt: new Date(),
            stripePaymentIntentId: pi?.id || session?.payment_intent || sessionId,
            cardBrand: card?.brand,
            cardLast4: card?.last4
          },
          receiptUrl
        });
      } catch (e) {
        console.error('Stripe lookup for by-session failed:', e);
        return res.status(404).json({ error: 'Payment not found for session' });
      }
    }

    return res.json({ payment, receiptUrl: payment.receiptUrl || null });
  } catch (error) {
    console.error('Payment by-session fetch error:', error);
    res.status(500).json({ error: 'Server error fetching payment details' });
  }
});

// Get payment by ID
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ error: 'Server error fetching payment' });
  }
});

// Cancel payment
router.post('/:paymentId/cancel', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be canceled' });
    }

    // Cancel payment intent in Stripe
    try {
      await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
    } catch (stripeError) {
      console.error('Stripe cancel error:', stripeError);
    }

    // Update payment status
    payment.status = 'canceled';
    await payment.save();

    res.json({
      message: 'Payment canceled successfully',
      payment
    });
  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ error: 'Server error canceling payment' });
  }
});

// Create payment intent for deposit
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, paymentType = 'deposit', description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get user information
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        metadata: {
          userId: user._id.toString(),
          propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
        }
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customer.id,
      description: description || `${paymentType} payment for ${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString(),
        paymentType,
        propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in database
    const payment = new Payment({
      userId: user._id,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      amount: Math.round(amount * 100), // Store in cents
      currency: 'usd',
      paymentType,
      description: description || `${paymentType} payment`,
      status: 'pending',
      metadata: {
        propertyAddress: user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : ''
      }
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Server error creating payment intent' });
  }
});

// Admin: Get all payments
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const payments = await Payment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Admin payments fetch error:', error);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

// Get payment history for a specific tenant (Admin only)
router.get('/admin/history/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Admin tenant payment history fetch error:', error);
    res.status(500).json({ error: 'Server error fetching tenant payment history' });
  }
});

module.exports = { router, webhookRouter };
