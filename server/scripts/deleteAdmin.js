const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const deleteAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin user
    const result = await User.deleteOne({ email: 'admin@palmrunllc.com' });
    
    if (result.deletedCount > 0) {
      console.log('Admin user deleted successfully');
    } else {
      console.log('No admin user found to delete');
    }

  } catch (error) {
    console.error('Error deleting admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

deleteAdmin();
