const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palm-run-llc');
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('No admin users found');
    } else {
      console.log('Admin users found:');
      admins.forEach(admin => {
        console.log(`- Email: ${admin.email}`);
        console.log(`- Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`- Active: ${admin.isActive}`);
        console.log(`- Created: ${admin.createdAt}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkAdmin();
