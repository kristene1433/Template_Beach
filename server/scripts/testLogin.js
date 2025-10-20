const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-property-template');
    console.log('Connected to MongoDB');

    // Find the demo user
    const user = await User.findOne({ email: 'demo@example.com' });
    
    if (!user) {
      console.log('❌ Demo user not found!');
      process.exit(1);
    }

    console.log('✅ Demo user found:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.firstName, user.lastName);
    console.log('- Role:', user.role);
    console.log('- Active:', user.isActive);
    console.log('- Password hash length:', user.password.length);
    console.log('- Password hash starts with:', user.password.substring(0, 10) + '...');

    // Test password comparison
    const isPasswordValid = await user.comparePassword('demo123');
    console.log('- Password "demo123" is valid:', isPasswordValid);

    if (isPasswordValid) {
      console.log('\n🎉 Login should work!');
    } else {
      console.log('\n❌ Password comparison failed!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();

