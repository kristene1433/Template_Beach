const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
require('dotenv').config();

const setupProduction = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if demo data already exists
    const existingUsers = await User.countDocuments({ email: { $in: ['demo@example.com', 'admin@example.com'] } });
    
    if (existingUsers > 0) {
      console.log('Demo data already exists. Skipping setup.');
      process.exit(0);
    }

    console.log('Setting up demo data for production...');

    // Create demo users
    const demoUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'demo@example.com',
        password: await bcrypt.hash('demo123', 12),
        phone: '555-0123',
        role: 'tenant',
        isActive: true,
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'CA',
          zipCode: '90210'
        }
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'demo2@example.com',
        password: await bcrypt.hash('demo123', 12),
        phone: '555-0124',
        role: 'tenant',
        isActive: true,
        address: {
          street: '456 Sample Ave',
          city: 'Sample Town',
          state: 'FL',
          zipCode: '33101'
        }
      },
      {
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 12),
        phone: '555-0100',
        role: 'admin',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log('✅ Created demo users');

    // Create demo applications
    const demoApplications = [
      {
        userId: createdUsers[0]._id,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0123',
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'CA',
          zipCode: '90210'
        },
        requestedStartDate: '2024-02-01',
        requestedEndDate: '2024-07-31',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'demo@example.com',
          phone: '555-0123',
          dateOfBirth: new Date('1990-05-15'),
          ssn: '123-45-6789'
        },
        currentAddress: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'CA',
          zipCode: '90210',
          moveInDate: new Date('2020-01-01'),
          landlordName: 'Previous Landlord',
          landlordPhone: '555-0987',
          reasonForLeaving: 'Relocation'
        },
        employment: {
          employerName: 'Demo Corp',
          occupation: 'Software Engineer',
          startDate: new Date('2018-03-01'),
          monthlyIncome: 7000,
          employerPhone: '555-1111'
        },
        references: [{
          name: 'Reference One',
          phone: '555-2222',
          relationship: 'Friend'
        }],
        emergencyContacts: [{
          name: 'Emergency Contact',
          phone: '555-3333',
          relationship: 'Family'
        }],
        pets: [{
          type: 'Dog',
          breed: 'Labrador',
          weight: 60
        }],
        vehicles: [{
          make: 'Toyota',
          model: 'Camry',
          year: 2018,
          licensePlate: 'DEMO123'
        }],
        additionalInfo: 'This is a demo application for template purposes.',
        status: 'approved',
        submittedAt: new Date(Date.now() - 86400000),
        applicationNumber: 'APP-2024-001',
        leaseGenerated: true,
        leaseContent: `LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()} between:

LANDLORD: Property Management Template Demo
TENANT: John Doe

PROPERTY ADDRESS:
123 Demo Street, Demo City, CA 90210

LEASE TERMS:
1. LEASE TERM: From 2024-02-01 to 2024-07-31
2. RENT: $2500 per month, due on the 1st of each month
3. SECURITY DEPOSIT: $500
4. OCCUPANTS: John Doe

TENANT RESPONSIBILITIES:
- Pay rent on time
- Maintain the property in good condition
- Follow all community rules and regulations
- Give 30 days notice before moving out

LANDLORD RESPONSIBILITIES:
- Maintain structural integrity of the property
- Provide necessary repairs
- Respect tenant privacy with proper notice

SPECIAL TERMS:
- This is a DEMO lease agreement for template demonstration purposes
- No actual legal obligations are created by this document
- For demonstration and presentation purposes only

SIGNATURES:
Landlord: _________________________ Date: _________
Tenant: _________________________ Date: _________

This agreement is for DEMONSTRATION PURPOSES ONLY.
Generated automatically when application was approved by admin.

Property Management Template - Demo Mode`,
        leaseGeneratedAt: new Date(Date.now() - 86400000),
        leaseGeneratedBy: createdUsers[2]._id
      }
    ];

    const createdApplications = await Application.insertMany(demoApplications);
    console.log('✅ Created demo applications');

    // Create demo payments
    const demoPayments = [
      {
        userId: createdUsers[0]._id,
        applicationId: createdApplications[0]._id,
        amount: 50000,
        creditCardFee: 1500,
        totalAmount: 51500,
        currency: 'usd',
        paymentType: 'deposit',
        status: 'succeeded',
        description: 'Security Deposit - Demo Payment',
        stripePaymentIntentId: 'pi_demo_123456789',
        stripeCustomerId: 'cus_demo_123456789',
        receiptUrl: '#',
        createdAt: new Date(Date.now() - 86400000),
        metadata: {
          demo: true,
          propertyId: 'demo_property_1'
        }
      }
    ];

    await Payment.insertMany(demoPayments);
    console.log('✅ Created demo payments');

    console.log('\n🎉 Production setup completed successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Tenant: demo@example.com / demo123');
    console.log('Admin: admin@example.com / admin123');

  } catch (error) {
    console.error('Error setting up production:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

setupProduction();
