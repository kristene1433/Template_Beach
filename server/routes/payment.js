const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

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

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'succeeded';
      payment.paidAt = new Date();
      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      
      if (paymentIntent.charges.data[0]?.payment_method_details?.card) {
        const card = paymentIntent.charges.data[0].payment_method_details.card;
        payment.cardLast4 = card.last4;
        payment.cardBrand = card.brand;
      }

      await payment.save();
    }
  } catch (error) {
    console.error('Payment success handling error:', error);
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.error = {
        code: paymentIntent.last_payment_error?.code,
        message: paymentIntent.last_payment_error?.message
      };

      await payment.save();
    }
  } catch (error) {
    console.error('Payment failure handling error:', error);
  }
}

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

module.exports = router;
