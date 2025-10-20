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
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Demo admin user already exists. Resetting password...');
      existingAdmin.password = 'admin123'; // This will be hashed by the pre-save hook
      existingAdmin.isActive = true;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Demo admin password reset successfully!');
      console.log('Demo Admin Credentials: admin@example.com / admin123');
      process.exit(0);
    }

    // Create demo admin user (password will be hashed by the model's pre-save hook)
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      phone: '555-0100'
    });

    await adminUser.save();
    console.log('Demo admin user created successfully!');
    console.log('Demo Admin Credentials: admin@example.com / admin123');
    console.log('This is for demonstration purposes only.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
