const mongoose = require('mongoose');
require('dotenv').config();

const Application = require('../models/Application');

async function updateApplicationNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all applications without application numbers
    const applicationsWithoutNumbers = await Application.find({
      applicationNumber: { $exists: false }
    }).sort({ createdAt: 1 }); // Sort by creation date to maintain order

    console.log(`Found ${applicationsWithoutNumbers.length} applications without numbers`);

    if (applicationsWithoutNumbers.length === 0) {
      console.log('All applications already have numbers');
      return;
    }

    // Get the highest existing application number
    const lastApp = await Application.findOne(
      { applicationNumber: { $exists: true, $ne: null } },
      { applicationNumber: 1 },
      { sort: { applicationNumber: -1 } }
    );

    let nextNumber = 1;
    if (lastApp && lastApp.applicationNumber) {
      const lastNum = parseInt(lastApp.applicationNumber.replace('APP-', ''));
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    console.log(`Starting application numbering from: ${nextNumber}`);

    // Update each application with a number
    for (let i = 0; i < applicationsWithoutNumbers.length; i++) {
      const app = applicationsWithoutNumbers[i];
      const appNumber = `APP-${(nextNumber + i).toString().padStart(4, '0')}`;
      
      await Application.findByIdAndUpdate(app._id, {
        applicationNumber: appNumber
      });

      console.log(`Updated ${app.firstName} ${app.lastName} with number: ${appNumber}`);
    }

    console.log(`Successfully updated ${applicationsWithoutNumbers.length} applications with numbers`);
    
  } catch (error) {
    console.error('Error updating application numbers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateApplicationNumbers();
