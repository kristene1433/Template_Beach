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
    
    // Find all applications
    const allApplications = await Application.find({});
    console.log(`Total applications found: ${allApplications.length}`);
    
    // Find applications without submittedAt or with invalid submittedAt
    const applicationsToFix = await Application.find({
      $or: [
        { submittedAt: { $exists: false } },
        { submittedAt: null },
        { submittedAt: { $type: "invalid" } }
      ]
    });
    
    console.log(`Applications that need fixing: ${applicationsToFix.length}`);
    
    if (applicationsToFix.length === 0) {
      console.log('All applications already have valid submittedAt field');
      return;
    }
    
    // Fix each application
    for (const app of applicationsToFix) {
      console.log(`\nFixing application ${app._id} for ${app.firstName} ${app.lastName}`);
      
      // Use createdAt if available, otherwise use current date
      const submittedAt = app.createdAt || new Date();
      
      console.log(`  - Current submittedAt: ${app.submittedAt}`);
      console.log(`  - Using createdAt: ${app.createdAt}`);
      console.log(`  - Setting submittedAt to: ${submittedAt}`);
      
      // Update the application
      await Application.findByIdAndUpdate(app._id, {
        submittedAt: submittedAt
      });
      
      console.log(`  ✓ Fixed application ${app._id}`);
    }
    
    // Verify the fix
    const remainingIssues = await Application.find({
      $or: [
        { submittedAt: { $exists: false } },
        { submittedAt: null },
        { submittedAt: { $type: "invalid" } }
      ]
    });
    
    if (remainingIssues.length === 0) {
      console.log('\n✅ Successfully fixed all applications!');
    } else {
      console.log(`\n⚠️  Warning: ${remainingIssues.length} applications still have issues`);
    }
    
    // Show some sample data to verify
    const sampleApps = await Application.find({}).limit(3);
    console.log('\nSample applications after fix:');
    sampleApps.forEach(app => {
      console.log(`  - ${app.firstName} ${app.lastName}: submittedAt = ${app.submittedAt}, createdAt = ${app.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error fixing submittedAt fields:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the fix
fixSubmittedAt();
