const mongoose = require('mongoose');
const Application = require('../models/Application');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palmrunllc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixSubmittedAt() {
  try {
    console.log('Starting to fix submittedAt fields...');
    
    // Find applications without submittedAt field
    const applicationsWithoutSubmittedAt = await Application.find({
      $or: [
        { submittedAt: { $exists: false } },
        { submittedAt: null }
      ]
    });
    
    console.log(`Found ${applicationsWithoutSubmittedAt.length} applications without submittedAt field`);
    
    if (applicationsWithoutSubmittedAt.length === 0) {
      console.log('All applications already have submittedAt field set');
      return;
    }
    
    // Fix each application
    for (const app of applicationsWithoutSubmittedAt) {
      console.log(`Fixing application ${app._id} for ${app.firstName} ${app.lastName}`);
      
      // Set submittedAt to createdAt if available, otherwise to current date
      const submittedAt = app.createdAt || new Date();
      
      await Application.findByIdAndUpdate(app._id, {
        submittedAt: submittedAt
      });
      
      console.log(`Fixed application ${app._id}: set submittedAt to ${submittedAt}`);
    }
    
    console.log('Successfully fixed all applications');
    
  } catch (error) {
    console.error('Error fixing submittedAt fields:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
fixSubmittedAt();
