const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
require('dotenv').config();

const testLease = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-property-template');
    console.log('Connected to MongoDB');

    // Find demo user
    const user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      console.log('❌ Demo user not found!');
      process.exit(1);
    }

    // Find demo application
    const application = await Application.findOne({ userId: user._id });
    if (!application) {
      console.log('❌ Demo application not found!');
      process.exit(1);
    }

    console.log('✅ Demo application found:');
    console.log('- Application ID:', application._id);
    console.log('- Status:', application.status);
    console.log('- Lease Generated:', application.leaseGenerated);
    console.log('- Has Lease Content:', !!application.leaseContent);
    console.log('- Lease Content Length:', application.leaseContent?.length || 0);

    if (application.leaseContent) {
      console.log('\n📄 Lease Content Preview:');
      console.log(application.leaseContent.substring(0, 200) + '...');
    }

    if (application.status === 'approved' && application.leaseGenerated && application.leaseContent) {
      console.log('\n🎉 Lease functionality is working perfectly!');
      console.log('✅ Demo user can access their generated lease');
    } else {
      console.log('\n⚠️  Lease functionality needs verification');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing lease:', error);
    process.exit(1);
  }
};

testLease();

