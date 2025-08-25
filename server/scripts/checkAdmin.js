const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@palmrunllc.com' });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('First Name:', adminUser.firstName);
      console.log('Last Name:', adminUser.lastName);
      console.log('Created At:', adminUser.createdAt);
      console.log('Full user object:', JSON.stringify(adminUser, null, 2));
    } else {
      console.log('No admin user found');
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkAdmin();
