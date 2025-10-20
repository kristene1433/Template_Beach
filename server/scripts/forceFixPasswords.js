const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const forceFixPasswords = async () => {
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
      console.log(`Force fixing password for: ${user.email}`);
      
      // Hash the password manually
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(user.email === 'admin@example.com' ? 'admin123' : 'demo123', salt);
      
      // Update the password directly in the database
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`✅ Password force fixed for: ${user.email}`);
    }

    console.log('\n🎉 All demo passwords have been force fixed!');
    console.log('\nDemo Login Credentials:');
    console.log('Tenant 1: demo@example.com / demo123');
    console.log('Tenant 2: demo2@example.com / demo123');
    console.log('Admin: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error force fixing demo passwords:', error);
    process.exit(1);
  }
};

forceFixPasswords();

