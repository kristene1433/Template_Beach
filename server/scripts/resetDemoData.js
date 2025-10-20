const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require('../models/Payment');

const resetDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-property-template');
    console.log('Connected to MongoDB');

    // Clear ALL existing data
    await User.deleteMany({});
    await Application.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared all existing data');

    // Create demo users with correct passwords
    const demoUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'demo@example.com',
        password: 'demo123', // Let the model hash this
        phone: '555-0123',
        role: 'tenant',
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
        password: 'demo123', // Let the model hash this
        phone: '555-0124',
        role: 'tenant',
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
        password: 'admin123', // Let the model hash this
        phone: '555-0100',
        role: 'admin',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log('Created demo users');

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
          rentAmount: 1200,
          landlordName: 'Demo Landlord',
          landlordPhone: '555-0199'
        },
        employment: {
          employer: 'Demo Company',
          position: 'Software Developer',
          income: 60000,
          startDate: new Date('2020-01-01'),
          supervisorName: 'Jane Manager',
          supervisorPhone: '555-0198'
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Sister',
          phone: '555-0125',
          email: 'jane.doe@example.com'
        },
        references: [
          {
            name: 'Bob Wilson',
            relationship: 'Friend',
            phone: '555-0126',
            email: 'bob.wilson@example.com'
          }
        ],
        pets: [],
        vehicles: [
          {
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
            licensePlate: 'DEMO123',
            color: 'Silver'
          }
        ],
        additionalInfo: 'This is a demo application for template purposes.',
        status: 'approved',
        submittedAt: new Date(Date.now() - 86400000), // 1 day ago
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
        leaseGeneratedBy: createdUsers[2]._id // Admin user
      },
      {
        userId: createdUsers[1]._id,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-0124',
        address: {
          street: '456 Sample Ave',
          city: 'Sample Town',
          state: 'FL',
          zipCode: '33101'
        },
        requestedStartDate: '2024-03-01',
        requestedEndDate: '2024-08-31',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'demo2@example.com',
          phone: '555-0124',
          dateOfBirth: new Date('1988-03-22'),
          ssn: '987-65-4321'
        },
        currentAddress: {
          street: '456 Sample Ave',
          city: 'Sample Town',
          state: 'FL',
          zipCode: '33101',
          rentAmount: 1400,
          landlordName: 'Sample Landlord',
          landlordPhone: '555-0197'
        },
        employment: {
          employer: 'Sample Corp',
          position: 'Marketing Manager',
          income: 55000,
          startDate: new Date('2019-06-01'),
          supervisorName: 'Mike Director',
          supervisorPhone: '555-0196'
        },
        emergencyContact: {
          name: 'John Smith',
          relationship: 'Brother',
          phone: '555-0127',
          email: 'john.smith@example.com'
        },
        references: [
          {
            name: 'Sarah Johnson',
            relationship: 'Colleague',
            phone: '555-0128',
            email: 'sarah.johnson@example.com'
          }
        ],
        pets: [
          {
            type: 'Dog',
            breed: 'Golden Retriever',
            name: 'Buddy',
            age: 3,
            weight: 65
          }
        ],
        vehicles: [],
        additionalInfo: 'Another demo application with different data.',
        status: 'pending',
        submittedAt: new Date(Date.now() - 172800000), // 2 days ago
        applicationNumber: 'APP-2024-002'
      }
    ];

    const createdApplications = await Application.insertMany(demoApplications);
    console.log('Created demo applications');

    // Create demo payments
    const demoPayments = [
      {
        userId: createdUsers[0]._id,
        applicationId: createdApplications[0]._id,
        amount: 50000, // $500 in cents
        creditCardFee: 1500, // $15 in cents (3%)
        totalAmount: 51500, // $515 in cents
        currency: 'usd',
        paymentType: 'deposit',
        status: 'succeeded',
        description: 'Security Deposit - Demo Payment',
        stripePaymentIntentId: 'pi_demo_123456789',
        stripeCustomerId: 'cus_demo_123456789',
        receiptUrl: '#',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        metadata: {
          demo: true,
          propertyId: 'demo_property_1'
        }
      },
      {
        userId: createdUsers[0]._id,
        applicationId: createdApplications[0]._id,
        amount: 120000, // $1200 in cents
        creditCardFee: 3600, // $36 in cents (3%)
        totalAmount: 123600, // $1236 in cents
        currency: 'usd',
        paymentType: 'rent',
        status: 'succeeded',
        description: 'Monthly Rent - Demo Payment',
        stripePaymentIntentId: 'pi_demo_987654321',
        stripeCustomerId: 'cus_demo_123456789',
        receiptUrl: '#',
        createdAt: new Date(Date.now() - 2592000000), // 30 days ago
        metadata: {
          demo: true,
          propertyId: 'demo_property_1'
        }
      },
      {
        userId: createdUsers[1]._id,
        applicationId: createdApplications[1]._id,
        amount: 50000, // $500 in cents
        creditCardFee: 1500, // $15 in cents (3%)
        totalAmount: 51500, // $515 in cents
        currency: 'usd',
        paymentType: 'deposit',
        status: 'pending',
        description: 'Security Deposit - Demo Payment (Pending)',
        stripePaymentIntentId: 'pi_demo_555666777',
        stripeCustomerId: 'cus_demo_987654321',
        receiptUrl: '#',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        metadata: {
          demo: true,
          propertyId: 'demo_property_2'
        }
      }
    ];

    await Payment.insertMany(demoPayments);
    console.log('Created demo payments');

    console.log('\n🎉 Demo data reset successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Tenant 1: demo@example.com / demo123');
    console.log('Tenant 2: demo2@example.com / demo123');
    console.log('Admin: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting demo data:', error);
    process.exit(1);
  }
};

resetDemoData();
