// Debug EmailJS Configuration
import { EMAILJS_CONFIG } from './emailjs';

export const debugEmailJSConfig = () => {
  console.log('🔧 EmailJS Configuration Debug:');
  console.log('=====================================');
  
  const config = {
    SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
    CONTACT_TEMPLATE_ID: EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
    LEASE_TEMPLATE_ID: EMAILJS_CONFIG.LEASE_TEMPLATE_ID,
    PAYMENT_TEMPLATE_ID: EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID,
    PASSWORD_RESET_TEMPLATE_ID: EMAILJS_CONFIG.PASSWORD_RESET_TEMPLATE_ID,
    PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY
  };

  console.table(config);

  // Check which templates are configured
  const missingTemplates = [];
  if (!EMAILJS_CONFIG.SERVICE_ID) missingTemplates.push('SERVICE_ID');
  if (!EMAILJS_CONFIG.PUBLIC_KEY) missingTemplates.push('PUBLIC_KEY');
  if (!EMAILJS_CONFIG.CONTACT_TEMPLATE_ID) missingTemplates.push('CONTACT_TEMPLATE_ID');
  if (!EMAILJS_CONFIG.LEASE_TEMPLATE_ID) missingTemplates.push('LEASE_TEMPLATE_ID');
  if (!EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID) missingTemplates.push('PAYMENT_TEMPLATE_ID');
  if (!EMAILJS_CONFIG.PASSWORD_RESET_TEMPLATE_ID) missingTemplates.push('PASSWORD_RESET_TEMPLATE_ID');

  if (missingTemplates.length > 0) {
    console.warn('⚠️ Missing EmailJS Configuration:');
    missingTemplates.forEach(template => {
      console.warn(`   - ${template}`);
    });
  } else {
    console.log('✅ All EmailJS configurations are present');
  }

  // Check environment variables
  console.log('\n🌍 Environment Variables:');
  console.log('REACT_APP_EMAILJS_SERVICE_ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID ? 'Set' : 'Missing');
  console.log('REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID ? 'Set' : 'Missing');
  console.log('REACT_APP_EMAILJS_LEASE_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_LEASE_TEMPLATE_ID ? 'Set' : 'Missing');
  console.log('REACT_APP_EMAILJS_PAYMENT_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_PAYMENT_TEMPLATE_ID ? 'Set' : 'Missing');
  console.log('REACT_APP_EMAILJS_PASSWORD_RESET_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_PASSWORD_RESET_TEMPLATE_ID ? 'Set' : 'Missing');
  console.log('REACT_APP_EMAILJS_PUBLIC_KEY:', process.env.REACT_APP_EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing');

  return {
    isConfigured: missingTemplates.length === 0,
    missingTemplates,
    config
  };
};

// Test password reset email configuration
export const testPasswordResetConfig = () => {
  console.log('🧪 Testing Password Reset Email Configuration:');
  console.log('==============================================');
  
  const passwordResetConfig = {
    SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
    PASSWORD_RESET_TEMPLATE_ID: EMAILJS_CONFIG.PASSWORD_RESET_TEMPLATE_ID,
    PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY
  };

  const isPasswordResetConfigured = passwordResetConfig.SERVICE_ID && 
                                   passwordResetConfig.PASSWORD_RESET_TEMPLATE_ID && 
                                   passwordResetConfig.PUBLIC_KEY;

  console.log('Password Reset Email Configuration:');
  console.table(passwordResetConfig);
  
  if (isPasswordResetConfigured) {
    console.log('✅ Password reset email is properly configured');
  } else {
    console.error('❌ Password reset email is NOT configured');
    console.log('Missing:');
    if (!passwordResetConfig.SERVICE_ID) console.log('   - SERVICE_ID');
    if (!passwordResetConfig.PASSWORD_RESET_TEMPLATE_ID) console.log('   - PASSWORD_RESET_TEMPLATE_ID');
    if (!passwordResetConfig.PUBLIC_KEY) console.log('   - PUBLIC_KEY');
  }

  return isPasswordResetConfigured;
};

