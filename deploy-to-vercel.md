# Deploy Rental Property Template to Vercel

## 🚀 Quick Deployment Guide

### Step 1: Prepare Your Code
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster
4. Create a database user with read/write permissions
5. Whitelist all IP addresses (0.0.0.0/0)
6. Get your connection string

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings

### Step 4: Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rental-property-template?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-use-only
DEMO_MODE=true
CLIENT_URL=https://your-app-name.vercel.app
```

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Test your live application

## 🔧 Post-Deployment Setup

### Initialize Demo Data
After deployment, you'll need to set up demo data. You can do this by:

1. **Option 1: Use the API endpoints**
   - Make API calls to create demo data
   - Use tools like Postman or curl

2. **Option 2: Create a setup endpoint**
   - Add a temporary setup route for initial data creation

### Test Demo Functionality
1. Visit your deployed URL
2. Test login with demo credentials:
   - `demo@example.com` / `demo123`
   - `admin@example.com` / `admin123`
3. Verify all features work correctly

## 📋 Deployment Checklist

- [ ] Code committed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Demo data initialized
- [ ] All demo features tested
- [ ] Demo credentials working
- [ ] Lease functionality working
- [ ] Payment demo working

## 🎯 Demo URL Structure

Your deployed template will be available at:
- **Main App**: `https://your-app-name.vercel.app`
- **API**: `https://your-app-name.vercel.app/api`
- **Health Check**: `https://your-app-name.vercel.app/api/health`

## 🔒 Security Notes

- Keep `DEMO_MODE=true` for template demonstrations
- Use strong JWT_SECRET in production
- MongoDB Atlas provides built-in security
- Vercel handles HTTPS automatically

## 🆘 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify MongoDB URI and network access
3. **Environment Variables**: Ensure all required vars are set
4. **Demo Data**: Run initialization scripts after deployment

### Support:
- Check Vercel deployment logs
- Verify MongoDB Atlas connection
- Test API endpoints individually
