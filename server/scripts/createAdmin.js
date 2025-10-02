const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@palmrunllc.com' });
    if (existingAdmin) {
      console.log('Admin user already exists. Resetting password...');
      existingAdmin.password = 'admin123'; // This will be hashed by the pre-save hook
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('Admin password reset successfully!');
      process.exit(0);
    }

    // Create admin user (password will be hashed by the model's pre-save hook)
    const adminUser = new User({
      email: 'admin@palmrunllc.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Please check your database for admin credentials.');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
