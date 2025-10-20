import React, { createContext, useContext, useState } from 'react';

const DemoPaymentContext = createContext();

export const useDemoPayment = () => {
  const context = useContext(DemoPaymentContext);
  if (!context) {
    throw new Error('useDemoPayment must be used within a DemoPaymentProvider');
  }
  return context;
};

export const DemoPaymentProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoPayments, setDemoPayments] = useState([
    {
      id: 'demo_1',
      amount: 50000, // $500 in cents
      status: 'succeeded',
      description: 'Security Deposit - Demo Payment',
      paymentType: 'deposit',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      stripePaymentIntentId: 'pi_demo_123456789',
      receiptUrl: '#'
    },
    {
      id: 'demo_2', 
      amount: 120000, // $1200 in cents
      status: 'succeeded',
      description: 'Monthly Rent - Demo Payment',
      paymentType: 'rent',
      createdAt: new Date(Date.now() - 2592000000), // 30 days ago
      stripePaymentIntentId: 'pi_demo_987654321',
      receiptUrl: '#'
    }
  ]);

  const createDemoPayment = (paymentData) => {
    const newPayment = {
      id: `demo_${Date.now()}`,
      amount: Math.round(paymentData.amount * 100), // Convert to cents
      status: 'succeeded',
      description: paymentData.description,
      paymentType: paymentData.paymentType,
      createdAt: new Date(),
      stripePaymentIntentId: `pi_demo_${Math.random().toString(36).substr(2, 9)}`,
      receiptUrl: '#'
    };
    
    setDemoPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const value = {
    isDemoMode,
    setIsDemoMode,
    demoPayments,
    createDemoPayment,
    isPaymentAvailable: true, // Always available in demo mode
  };

  return (
    <DemoPaymentContext.Provider value={value}>
      {children}
    </DemoPaymentContext.Provider>
  );
};
