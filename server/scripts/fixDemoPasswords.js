const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const fixDemoPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-property-template');
    console.log('Connected to MongoDB');

    // Find demo users
    const demoUsers = await User.find({ 
      email: { $in: ['demo@example.com', 'demo2@example.com', 'admin@example.com'] } 
    });

    console.log(`Found ${demoUsers.length} demo users`);

    for (const user of demoUsers) {
      console.log(`Fixing password for: ${user.email}`);
      
      // Set the password directly (this will trigger the pre-save hook to hash it)
      if (user.email === 'admin@example.com') {
        user.password = 'admin123';
      } else {
        user.password = 'demo123';
      }
      
      // Save the user (this will hash the password via the pre-save hook)
      await user.save();
      console.log(`✅ Password fixed for: ${user.email}`);
    }

    console.log('\n🎉 All demo passwords have been fixed!');
    console.log('\nDemo Login Credentials:');
    console.log('Tenant 1: demo@example.com / demo123');
    console.log('Tenant 2: demo2@example.com / demo123');
    console.log('Admin: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error fixing demo passwords:', error);
    process.exit(1);
  }
};

fixDemoPasswords();

