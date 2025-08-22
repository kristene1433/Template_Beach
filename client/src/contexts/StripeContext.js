import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // In production, this would come from environment variables
        // For now, we'll use a placeholder that should be replaced
        const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';
        
        if (publishableKey && publishableKey !== 'pk_test_your_stripe_publishable_key_here') {
          const stripe = await loadStripe(publishableKey);
          setStripePromise(stripe);
        } else {
          console.warn('Stripe publishable key not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your environment variables.');
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  const value = {
    stripePromise,
    loading,
    isStripeAvailable: !!stripePromise,
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};
