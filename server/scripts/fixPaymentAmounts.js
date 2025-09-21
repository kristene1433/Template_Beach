const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const Payment = require('../models/Payment');

async function fixPaymentAmounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palm-run-llc', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all payments with amount = 0
    const paymentsWithZeroAmount = await Payment.find({ amount: 0 });
    console.log(`Found ${paymentsWithZeroAmount.length} payments with amount = 0`);

    for (const payment of paymentsWithZeroAmount) {
      try {
        console.log(`\nProcessing payment ${payment._id} with Stripe ID: ${payment.stripePaymentIntentId}`);
        
        // Get payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        console.log(`Stripe payment intent amount: ${paymentIntent.amount} cents`);
        
        // Update the payment with correct amount
        payment.amount = paymentIntent.amount;
        payment.totalAmount = paymentIntent.amount;
        
        // Try to get credit card fee from metadata if available
        if (paymentIntent.metadata?.creditCardFee) {
          payment.creditCardFee = Math.round(parseFloat(paymentIntent.metadata.creditCardFee) * 100);
        }
        
        await payment.save();
        console.log(`✅ Updated payment ${payment._id}: amount = ${payment.amount} cents ($${(payment.amount / 100).toFixed(2)})`);
        
      } catch (error) {
        console.error(`❌ Failed to update payment ${payment._id}:`, error.message);
      }
    }

    console.log('\n✅ Payment amount fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing payment amounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixPaymentAmounts();
