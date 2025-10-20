# Vercel Deployment Configuration

## Environment Variables for Vercel

Set these in your Vercel dashboard under Settings > Environment Variables:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rental-property-template?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-use-only
DEMO_MODE=true
CLIENT_URL=https://your-app-name.vercel.app
```

### Optional Variables (for email functionality):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAILJS_SERVICE_ID=service_your_service_id
EMAILJS_CONTACT_TEMPLATE_ID=template_your_contact_template_id
EMAILJS_LEASE_TEMPLATE_ID=template_your_lease_template_id
EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_your_password_reset_template_id
EMAILJS_PUBLIC_KEY=user_your_public_key
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Whitelist Vercel's IP addresses (0.0.0.0/0 for development)
5. Get your connection string and update MONGODB_URI

## Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Important Notes

- Keep DEMO_MODE=true for template demonstrations
- Generate a strong JWT_SECRET for production
- Update CLIENT_URL after deployment
- Test all demo functionality after deployment
