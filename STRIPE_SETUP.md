# Stripe Integration Setup Guide

This guide will help you set up Stripe Checkout for payment processing in your Palm Run LLC application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and npm installed
3. MongoDB database running

## Step 1: Get Your Stripe API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env` in your project root
2. Add your Stripe keys:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Client URL (where your React app runs)
CLIENT_URL=http://localhost:3000
```

## Step 3: Set Up Stripe Webhooks

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/payment/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Step 4: Test the Integration

1. Start your server: `npm run server`
2. Start your client: `npm run client`
3. Navigate to the Payment page
4. Try making a test payment with Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

## Step 5: Go Live (Production)

1. Switch to live mode in your Stripe Dashboard
2. Update your environment variables with live keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Update your webhook endpoint URL to your production domain
4. Test with real cards

## Features

### Payment Types
- **Security Deposit**: Fixed $500 payment
- **Custom Payment**: User-defined amount
- **Rent Payment**: Monthly rent payments

### Security Features
- Webhook signature verification
- Customer creation and management
- Secure payment processing
- Receipt generation

### User Experience
- Seamless Stripe Checkout
- Success and cancel pages
- Payment history tracking
- Receipt downloads

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check your webhook endpoint URL
   - Verify the webhook secret
   - Ensure your server is accessible from the internet

2. **Payment not completing**
   - Check Stripe Dashboard for errors
   - Verify your API keys are correct
   - Check server logs for errors

3. **CORS issues**
   - Verify your `CLIENT_URL` environment variable
   - Check CORS configuration in server

### Testing

- Use Stripe's test mode for development
- Test with various card scenarios
- Monitor webhook events in Stripe Dashboard
- Check payment status in your database

## Support

If you encounter issues:
1. Check Stripe Dashboard for payment status
2. Review server logs for errors
3. Verify environment variables
4. Test webhook connectivity

## Security Notes

- Never commit your `.env` file to version control
- Keep your secret keys secure
- Use HTTPS in production
- Regularly rotate your API keys
- Monitor for suspicious activity

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Test Cards](https://stripe.com/docs/testing#cards)
