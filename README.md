# Rental Property Management Template

A modern, full-stack web application template for managing rental properties, tenant applications, and payments. Built with React, Node.js, MongoDB, and demo payment integration. Perfect for demonstrations and as a starting point for property management applications.

## 🏠 Features

### For Tenants
- **User Registration & Authentication**: Secure email/password-based accounts
- **Rental Application System**: Comprehensive online application forms
- **Payment Portal**: Demo payment system for deposits and rent payments
- **Lease Management**: Auto-generated lease agreements from application data
- **User Dashboard**: Real-time status updates and account management
- **Document Management**: Upload and manage required documents

### For Property Managers
- **Admin Dashboard**: Review and manage tenant applications
- **Payment Tracking**: Monitor all payment transactions
- **Application Review**: Approve/reject applications with notes
- **Tenant Management**: View tenant information and status

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Demo Payment System** for demonstration purposes
- **bcryptjs** for password hashing
- **Helmet** for security headers

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form management
- **Lucide React** for icons

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation and sanitization
- Demo payment processing

## 🎯 Demo Mode

This template includes a **Demo Mode** that allows you to:

- **Test all features** without real payment processing
- **Pre-populated demo data** including sample applications and payments
- **Demo login credentials** for easy testing
- **Mock payment flow** that simulates real payment processing

### Demo Login Credentials
- **Tenant**: `demo@example.com` / `demo123`
- **Admin**: `admin@example.com` / `admin123`

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or cloud service)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rental-property-template
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rental-property-template

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Demo Mode
DEMO_MODE=true

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup
Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Create Demo Data
```bash
# Create demo users, applications, and payments
npm run create-demo-data
```

### 6. Run the Application

#### Development Mode
```bash
# Run both backend and frontend concurrently
npm run dev

# Or run them separately:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 📱 Application Structure

### Backend Structure
```
server/
├── index.js              # Main server file
├── models/               # Database models
│   ├── User.js          # User/tenant model
│   ├── Application.js   # Rental application model
│   └── Payment.js       # Payment transaction model
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── application.js   # Application management
│   ├── payment.js       # Payment processing
│   └── lease.js         # Lease agreement routes
└── middleware/           # Custom middleware
    └── auth.js          # JWT authentication
```

### Frontend Structure
```
client/src/
├── components/           # Reusable components
│   ├── Navbar.js        # Navigation component
│   └── Footer.js        # Footer component
├── contexts/             # React contexts
│   ├── AuthContext.js   # Authentication state
│   └── StripeContext.js # Stripe configuration
├── pages/                # Page components
│   ├── Home.js          # Landing page
│   ├── Login.js         # Login page
│   ├── Register.js      # Registration page
│   ├── Dashboard.js     # User dashboard
│   ├── Application.js   # Rental application
│   ├── Payment.js       # Payment portal
│   ├── Lease.js         # Lease management
│   └── Profile.js       # User profile
└── App.js               # Main application component
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Applications
- `GET /api/application` - Get user's application
- `POST /api/application` - Create new application
- `PUT /api/application` - Update application
- `POST /api/application/submit` - Submit application
- `GET /api/application/status` - Get application status

### Payments
- `POST /api/payment/create-payment-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/history` - Get payment history
- `GET /api/payment/:id` - Get specific payment

### Lease
- `POST /api/lease/generate` - Generate lease agreement
- `GET /api/lease/preview` - Preview lease agreement
- `POST /api/lease/sign` - Sign lease agreement
- `GET /api/lease/status` - Get lease status

## 💳 Demo Payment System

The application includes a demo payment system for demonstration purposes:

- **Deposit Payments**: Configurable security deposit amounts
- **Rent Payments**: Monthly rental payments
- **Demo Processing**: Simulated payment handling (no real money)
- **Payment History**: Complete transaction records
- **Receipt Generation**: Demo receipt creation

## 🎨 Customization

### Styling
- Modify `client/src/index.css` for global styles
- Update `client/tailwind.config.js` for theme customization
- Use Tailwind CSS utility classes for component styling

### Branding
- Update company information in components
- Modify color scheme in Tailwind config
- Replace logo and branding assets

### Features
- Add new form fields to application forms
- Extend demo payment options
- Implement additional admin features

## 🚀 Deployment

### Backend Deployment
1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Deploy to your preferred hosting service (Heroku, AWS, DigitalOcean, etc.)
4. Set up SSL certificates for HTTPS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure your domain and SSL

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
DEMO_MODE=false
CLIENT_URL=https://yourdomain.com
```

## 🔒 Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt with salt rounds of 12
- Rate limiting prevents abuse
- CORS is configured for security
- Input validation on all forms
- Demo payment processing (no real money involved)

## 📊 Database Schema

### User Model
- Basic information (name, email, phone)
- Address details
- Rental information
- Application and lease status

### Application Model
- Personal information
- Employment details
- Current address
- References and emergency contacts
- Pet and vehicle information
- Document uploads

### Payment Model
- Demo payment integration details
- Payment amounts and types
- Transaction status
- Receipt information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@yourcompany.com
- Phone: (555) 123-4567
- Business Hours: Monday-Friday 9AM-6PM

## 🔄 Updates & Maintenance

- Regularly update dependencies for security patches
- Monitor payment system changes
- Keep MongoDB updated
- Review and update security measures

## 📈 Future Enhancements

- Mobile app development
- Advanced reporting and analytics
- Maintenance request system
- Tenant communication portal
- Property listing management
- Multi-property support
- Advanced admin features

---

**Rental Property Management Template** - Professional Property Management Solutions
