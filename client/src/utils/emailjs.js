import emailjs from '@emailjs/browser';

// EmailJS configuration from environment variables
export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  CONTACT_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID,
  LEASE_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_LEASE_TEMPLATE_ID,
  PAYMENT_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_PAYMENT_TEMPLATE_ID,
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

// Debug: Log configuration on load
console.log('🔧 EmailJS Configuration loaded:', {
  SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID ? 'Set' : 'Missing',
  CONTACT_TEMPLATE_ID: EMAILJS_CONFIG.CONTACT_TEMPLATE_ID ? 'Set' : 'Missing',
  LEASE_TEMPLATE_ID: EMAILJS_CONFIG.LEASE_TEMPLATE_ID ? 'Set' : 'Missing',
  PAYMENT_TEMPLATE_ID: EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID ? 'Set' : 'Missing',
  PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? 'Set' : 'Missing'
});

// Validate configuration
export const validateEmailJSConfig = () => {
  console.log('EmailJS Config Check:', {
    SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
    CONTACT_TEMPLATE_ID: EMAILJS_CONFIG.CONTACT_TEMPLATE_ID,
    LEASE_TEMPLATE_ID: EMAILJS_CONFIG.LEASE_TEMPLATE_ID,
    PAYMENT_TEMPLATE_ID: EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID,
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
        lease_content: leaseData.leaseContent || 'Lease content not available',
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

// Send payment receipt/confirmation
export const sendPaymentReceiptEmail = async (data) => {
  console.log('🔍 EmailJS Debug - Attempting to send payment receipt email');
  console.log('📧 EmailJS Config:', {
    SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
    PAYMENT_TEMPLATE_ID: EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID,
    PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? 'Set' : 'Missing'
  });
  console.log('📨 Email Data:', data);
  
  // Only require service, payment template and public key for this call
  if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
    console.error('❌ Payment receipt email skipped: EmailJS payment template not configured');
    console.error('Missing:', {
      SERVICE_ID: !EMAILJS_CONFIG.SERVICE_ID,
      PAYMENT_TEMPLATE_ID: !EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID,
      PUBLIC_KEY: !EMAILJS_CONFIG.PUBLIC_KEY
    });
    return { success: false, error: 'EmailJS not fully configured for payment receipts' };
  }

  try {
    console.log('📤 Sending email via EmailJS...');
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.PAYMENT_TEMPLATE_ID,
      {
        email: data.toEmail,
        amount: data.amount,            // formatted string like $500.00
        payment_type: data.paymentType, // e.g., Security Deposit
        date: data.date,                // formatted date
        transaction_id: data.transactionId || '-',
        receipt_url: data.receiptUrl || '',
        card_brand: data.cardBrand || '',
        card_last4: data.cardLast4 || '',
        sent_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    console.log('✅ Email sent successfully!', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ EmailJS payment receipt error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    });
    return { success: false, error: error.message };
  }
};
