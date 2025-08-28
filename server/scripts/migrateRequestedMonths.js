const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palmrunllc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Application = require('../models/Application');

const migrateRequestedMonths = async () => {
  try {
    console.log('Starting migration of requestedMonths to requestedStartDate/requestedEndDate...');
    
    // Find all applications that still have requestedMonths
    const applications = await Application.find({ 
      requestedMonths: { $exists: true, $ne: null } 
    });
    
    console.log(`Found ${applications.length} applications to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const app of applications) {
      try {
        if (app.requestedMonths && app.requestedMonths.trim()) {
          // Parse the month string (e.g., "January 2025")
          const monthYear = app.requestedMonths.trim();
          const [month, year] = monthYear.split(' ');
          
          if (month && year) {
            // Create a start date (first day of the month)
            const startDate = new Date(`${month} 1, ${year}`);
            
            // Create an end date (last day of the month)
            const endDate = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
            
            // Format dates as YYYY-MM-DD strings
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Update the application
            await Application.updateOne(
              { _id: app._id },
              { 
                $set: { 
                  requestedStartDate: startDateStr,
                  requestedEndDate: endDateStr
                },
                $unset: { requestedMonths: 1 }
              }
            );
            
            console.log(`Migrated application ${app._id}: ${app.requestedMonths} -> ${startDateStr} to ${endDateStr}`);
            migratedCount++;
          } else {
            console.log(`Skipped application ${app._id}: Invalid month format: ${app.requestedMonths}`);
            skippedCount++;
          }
        } else {
          // Set default dates if requestedMonths is empty
          const defaultStartDate = new Date();
          const defaultEndDate = new Date(defaultStartDate.getFullYear() + 1, defaultStartDate.getMonth(), defaultStartDate.getDate());
          
          const startDateStr = defaultStartDate.toISOString().split('T')[0];
          const endDateStr = defaultEndDate.toISOString().split('T')[0];
          
          await Application.updateOne(
            { _id: app._id },
            { 
              $set: { 
                requestedStartDate: startDateStr,
                requestedEndDate: endDateStr
              },
              $unset: { requestedMonths: 1 }
            }
          );
          
          console.log(`Set default dates for application ${app._id}: ${startDateStr} to ${endDateStr}`);
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrating application ${app._id}:`, error);
        skippedCount++;
      }
    }
    
    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${migratedCount} applications`);
    console.log(`Skipped: ${skippedCount} applications`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateRequestedMonths();
