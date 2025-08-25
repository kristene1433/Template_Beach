# 🚀 Heroku Deployment Guide for Palm Run LLC

This guide will walk you through deploying your Palm Run LLC rental property management application to Heroku.

## 📋 Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git Repository**: Your code should be committed to Git
4. **MongoDB Atlas**: Set up a cloud MongoDB database

## 🔧 Setup Steps

### 1. Install Heroku CLI
```bash
# Windows (using installer)
# Download and run the installer from Heroku website

# Or using npm
npm install -g heroku
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
# Create a new Heroku app
heroku create palm-run-llc-app

# Or use a specific name
heroku create your-app-name-here
```

### 4. Set Environment Variables
```bash
# Set MongoDB URI (replace with your actual MongoDB Atlas connection string)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/palm-run-llc?retryWrites=true&w=majority"

# Set Node environment
heroku config:set NODE_ENV=production

# Set JWT secret
heroku config:set JWT_SECRET="your-super-secret-jwt-key-here"

# Set Stripe keys (if using Stripe)
heroku config:set STRIPE_SECRET_KEY="sk_test_..."
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_..."

# Set client URL for CORS
heroku config:set CLIENT_URL="https://your-app-name.herokuapp.com"

# Set any other environment variables from your .env file
```

### 5. Add MongoDB Add-on (Alternative to MongoDB Atlas)
```bash
# Add MongoDB add-on to Heroku
heroku addons:create mongolab:sandbox

# This will automatically set MONGODB_URI
```

### 6. Deploy to Heroku
```bash
# Add all files to Git
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment"

# Push to Heroku
git push heroku master

# Or if you're on main branch
git push heroku main
```

### 7. Open Your App
```bash
heroku open
```

## 🔍 Troubleshooting

### Build Failures
```bash
# Check build logs
heroku logs --tail

# Check app status
heroku ps

# Restart the app
heroku restart
```

### Database Connection Issues
```bash
# Check environment variables
heroku config

# Test database connection
heroku run node -e "console.log(process.env.MONGODB_URI)"
```

### Common Issues

1. **Build Timeout**: Heroku has a 30-minute build timeout
2. **Memory Issues**: Ensure your app doesn't exceed Heroku's memory limits
3. **Port Binding**: Heroku sets PORT environment variable automatically
4. **CORS Issues**: Make sure CLIENT_URL is set correctly

## 📱 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NODE_ENV` | Environment (production) | ✅ |
| `JWT_SECRET` | Secret for JWT tokens | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ❌ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |

## 🚀 Post-Deployment

### 1. Create Admin User
```bash
# Run admin creation script
heroku run npm run create-admin
```

### 2. Monitor Your App
```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Monitor performance
heroku addons:open scout
```

### 3. Set Up Custom Domain (Optional)
```bash
# Add custom domain
heroku domains:add yourdomain.com

# Configure DNS records as instructed
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **HTTPS**: Heroku provides SSL certificates automatically
3. **Rate Limiting**: Already configured in your app
4. **Helmet**: Security headers are enabled
5. **CORS**: Configured for production

## 📊 Monitoring & Maintenance

### Regular Tasks
- Monitor Heroku logs for errors
- Check MongoDB Atlas performance
- Update dependencies regularly
- Monitor Stripe webhook delivery (if applicable)

### Scaling (When Needed)
```bash
# Scale to multiple dynos
heroku ps:scale web=2

# Check current dyno usage
heroku ps
```

## 🆘 Support

- **Heroku Support**: [help.heroku.com](https://help.heroku.com)
- **Heroku Dev Center**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## ✅ Deployment Checklist

- [ ] Heroku CLI installed and logged in
- [ ] Heroku app created
- [ ] Environment variables set
- [ ] MongoDB connection configured
- [ ] Code committed to Git
- [ ] App deployed successfully
- [ ] Admin user created
- [ ] App tested in production
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

**Happy Deploying! 🎉**

Your Palm Run LLC application will be live on the web and accessible to tenants and property managers worldwide.
