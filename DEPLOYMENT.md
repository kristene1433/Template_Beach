# 🚀 Vercel Deployment Guide

## Quick Start

### 1. Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)

### 2. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0)
5. Get your connection string

### 3. Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy!

## Environment Variables

Set these in your Vercel dashboard:

### Required:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rental-property-template?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-use-only
DEMO_MODE=true
CLIENT_URL=https://your-app-name.vercel.app
```

### Optional (for email features):
```
EMAILJS_SERVICE_ID=service_your_service_id
EMAILJS_CONTACT_TEMPLATE_ID=template_your_contact_template_id
EMAILJS_LEASE_TEMPLATE_ID=template_your_lease_template_id
EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_your_password_reset_template_id
EMAILJS_PUBLIC_KEY=user_your_public_key
```

## Post-Deployment Setup

### Option 1: API Setup (Recommended)
After deployment, make a POST request to:
```
https://your-app-name.vercel.app/api/setup/setup-demo
```

### Option 2: Manual Setup
1. Connect to your MongoDB Atlas cluster
2. Run the setup script locally:
   ```bash
   npm run setup-production
   ```

## Testing Your Deployment

1. Visit your deployed URL
2. Test demo login:
   - **Tenant**: `demo@example.com` / `demo123`
   - **Admin**: `admin@example.com` / `admin123`
3. Verify all features work:
   - ✅ User registration/login
   - ✅ Application submission
   - ✅ Admin approval (auto-generates lease)
   - ✅ Demo payments
   - ✅ Lease viewing/signing

## Demo Credentials

- **Tenant 1**: `demo@example.com` / `demo123` (has approved application with lease)
- **Tenant 2**: `demo2@example.com` / `demo123` (has pending application)
- **Admin**: `admin@example.com` / `admin123`

## Troubleshooting

### Build Issues
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

### Database Issues
- Verify MongoDB URI is correct
- Check network access settings in MongoDB Atlas
- Ensure database user has proper permissions

### Demo Data Issues
- Run setup script after deployment
- Check API endpoints are working
- Verify environment variables are set

## Security Notes

- Keep `DEMO_MODE=true` for template demonstrations
- Use strong JWT_SECRET in production
- MongoDB Atlas provides built-in security
- Vercel handles HTTPS automatically

## Support

- Check Vercel deployment logs
- Verify MongoDB Atlas connection
- Test API endpoints individually
- Use browser developer tools for debugging

## Cost

- **Vercel**: Free tier available
- **MongoDB Atlas**: Free tier available (512MB storage)
- **Total**: $0/month for basic usage

Your template will be live at: `https://your-app-name.vercel.app`
