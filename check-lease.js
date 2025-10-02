const mongoose = require('mongoose');
const Application = require('./server/models/Application');

mongoose.connect('mongodb://localhost:27017/palmrun', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const app = await Application.findById('68dd75c58cdcc2265ce49e25');
    console.log('Current lease data:', JSON.stringify(app.signedLeaseFile, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
