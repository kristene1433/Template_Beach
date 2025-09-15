const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateUserRole = async (email, newRole) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update the user's role
    user.role = newRole;
    await user.save();

    console.log(`User ${email} role updated to ${newRole} successfully!`);
    console.log(`User details:`);
    console.log(`- Name: ${user.firstName} ${user.lastName}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Get email and role from command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: node updateUserRole.js <email> <role>');
  console.log('Example: node updateUserRole.js admin@palmrunllc.com admin');
  process.exit(1);
}

updateUserRole(email, role);