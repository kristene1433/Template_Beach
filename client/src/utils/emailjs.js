import emailjs from '@emailjs/browser';

// EmailJS configuration from environment variables
export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  CONTACT_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID,
  LEASE_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_LEASE_TEMPLATE_ID,
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

// Validate configuration
export const validateEmailJSConfig = () => {
  console.log('EmailJS Config Check:', {
    SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
    CONTACT_TEMPLATE_ID: EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
    LEASE_TEMPLATE_ID: EMAILJS_CONFIG.LEASE_TEMPLATE_ID,
    PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? 'Set' : 'Missing'
  });
  
  if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.CONTACT_TEMPLATE_ID || 
      !EMAILJS_CONFIG.LEASE_TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
    console.error('EmailJS configuration missing. Please check your environment variables.');
    return false;
  }
  return true;
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (!validateEmailJSConfig()) {
    console.error('Cannot initialize EmailJS - configuration incomplete');
    return false;
  }
  
  try {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
};

// Send contact form email
export const sendContactEmail = async (formData) => {
  if (!validateEmailJSConfig()) {
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
      {
        to_email: 'palmrunbeachcondo@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        phone: formData.phone || 'Not provided',
        sent_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    return { success: true, data: response };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
};

// Send lease generation notification
export const sendLeaseNotification = async (leaseData) => {
  if (!validateEmailJSConfig()) {
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.LEASE_TEMPLATE_ID,
      {
        to_email: leaseData.tenantEmail || 'palmrunbeachcondo@gmail.com',
        tenant_name: `${leaseData.firstName} ${leaseData.lastName}`,
        lease_start_date: leaseData.leaseStartDate,
        lease_end_date: leaseData.leaseEndDate,
        rental_amount: leaseData.rentalAmount,
        deposit_amount: leaseData.depositAmount,
        property_address: '18650 Gulf Blvd Unit 207, Indian Shores, FL 33785',
        sent_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    return { success: true, data: response };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
};
