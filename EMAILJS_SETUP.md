# 📧 EmailJS Setup Guide for Palm Run LLC

This guide will help you set up EmailJS to handle contact form emails and notifications for your business email `palmrunbeachcondo@gmail.com`.

## 📦 Prerequisites

**Important:** Before proceeding, you need to install the EmailJS package. Run this command in your client directory:

```bash
cd client
npm install @emailjs/browser
```

## 🚀 Step 1: Create EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for a free account** (allows 200 emails/month)
3. **Verify your email address**

## 🔧 Step 2: Set Up Email Service

### Option A: Gmail Service (Recommended)
1. **In EmailJS Dashboard, go to "Email Services"**
2. **Click "Add New Service"**
3. **Select "Gmail"**
4. **Connect your Gmail account** (`palmrunbeachcondo@gmail.com`)
5. **Authorize EmailJS to send emails**
6. **Note your Service ID** (e.g., `service_abc123`)

### Option B: Custom SMTP Service
1. **Select "Custom SMTP"**
2. **Use Gmail SMTP settings:**
   - **SMTP Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **Username:** `palmrunbeachcondo@gmail.com`
   - **Password:** Use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)
   - **Security:** `STARTTLS`

## 📝 Step 3: Create Email Templates

### Template 1: Contact Form Template
1. **Go to "Email Templates"**
2. **Click "Create New Template"**
3. **Name:** `contact_form_template`
4. **Subject:** `New Contact Message from {{from_name}}`
5. **Content:**
```html
<h2>New Contact Message</h2>
<p><strong>From:</strong> {{from_name}} ({{from_email}})</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Subject:</strong> {{subject}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
<hr>
<p><em>Sent via Palm Run LLC website contact form</em></p>
```

### Template 2: Application Notification Template
1. **Name:** `application_notification_template`
2. **Subject:** `New Rental Application: {{applicant_name}}`
3. **Content:**
```html
<h2>New Rental Application Received</h2>
<p><strong>Applicant:</strong> {{applicant_name}}</p>
<p><strong>Email:</strong> {{applicant_email}}</p>
<p><strong>Phone:</strong> {{applicant_phone}}</p>
<p><strong>Status:</strong> {{application_status}}</p>
<p><strong>Property:</strong> {{property_address}}</p>
<hr>
<p><em>Application submitted via Palm Run LLC website</em></p>
```

### Template 3: Lease Notification Template
1. **Name:** `lease_notification_template`
2. **Subject:** `Lease Generated: {{tenant_name}}`
3. **Content:**
```html
<h2>Lease Agreement Generated</h2>
<p><strong>Tenant:</strong> {{tenant_name}}</p>
<p><strong>Lease Period:</strong> {{lease_start_date}} to {{lease_end_date}}</p>
<p><strong>Monthly Rent:</strong> ${{rental_amount}}</p>
<p><strong>Security Deposit:</strong> ${{deposit_amount}}</p>
<p><strong>Property:</strong> {{property_address}}</p>
<hr>
<p><em>Lease generated via Palm Run LLC admin dashboard</em></p>
```

## 🔑 Step 4: Get Your Credentials

1. **Go to "Account" → "API Keys"**
2. **Copy your Public Key** (starts with `user_`)
3. **Note your Service ID** from Step 2
4. **Note your Template IDs** from Step 3

## ⚙️ Step 5: Update Configuration

### **Option A: Environment Variables (Recommended)**

1. **Create a `.env` file in your `client` directory:**
```bash
cd client
cp env.example .env
```

2. **Edit the `.env` file with your actual credentials:**
```bash
REACT_APP_EMAILJS_SERVICE_ID=service_your_actual_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=template_your_actual_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=user_your_actual_public_key
```

3. **Restart your development server** after making changes to `.env`

### **Option B: Direct Configuration (Not Recommended for Production)**

If you prefer to hardcode values temporarily, update `client/src/utils/emailjs.js`:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_your_actual_service_id',
  TEMPLATE_ID: 'template_your_actual_template_id',
  PUBLIC_KEY: 'user_your_actual_public_key',
};
```

**⚠️ Security Warning:** Never commit hardcoded credentials to Git!

## 📱 Step 6: Test the Integration

1. **Deploy your changes**
2. **Go to the Contact page** (`/contact`)
3. **Fill out and submit the contact form**
4. **Check your Gmail** (`palmrunbeachcondo@gmail.com`) for the test email

## 🔒 Step 7: Security Considerations

### **Environment Variables Best Practices**

1. **Never commit `.env` files to Git:**
   - Add `.env` to your `.gitignore` file
   - Only commit `.env.example` templates
   - Use different credentials for development vs production

2. **React Environment Variables:**
   - All client-side variables must start with `REACT_APP_`
   - These are embedded in your build (safe for client-side)
   - Server-side variables don't need the `REACT_APP_` prefix

3. **Production Deployment:**
   - Set environment variables in your hosting platform (Heroku, Vercel, etc.)
   - Never expose production credentials in client-side code
   - Use platform-specific environment variable management

### **Gmail App Password (Recommended)**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EmailJS SMTP settings

### Rate Limiting
- **Free plan:** 200 emails/month
- **Paid plans:** Higher limits available
- **Monitor usage** in EmailJS dashboard

## 🚨 Troubleshooting

### Common Issues:

1. **"Service not found" error:**
   - Check Service ID spelling
   - Ensure service is properly connected

2. **"Template not found" error:**
   - Check Template ID spelling
   - Ensure template is published

3. **"Authentication failed" error:**
   - Check Gmail credentials
   - Use App Password instead of regular password
   - Ensure 2FA is enabled

4. **Emails not sending:**
   - Check browser console for errors
   - Verify EmailJS initialization
   - Check EmailJS dashboard for delivery status

## 📊 Monitoring

1. **EmailJS Dashboard:**
   - Monitor email delivery
   - Check usage statistics
   - View error logs

2. **Gmail:**
   - Check spam folder
   - Monitor sent items
   - Set up filters for automated emails

## 🔄 Next Steps

After setup:
1. **Test all email types** (contact, application, lease)
2. **Customize email templates** to match your brand
3. **Set up email filters** in Gmail
4. **Monitor delivery rates** and user feedback

## 📞 Support

- **EmailJS Support:** [support@emailjs.com](mailto:support@emailjs.com)
- **Documentation:** [EmailJS Docs](https://www.emailjs.com/docs/)
- **Community:** [EmailJS Community](https://community.emailjs.com/)

---

**Note:** Keep your EmailJS credentials secure and never commit them to public repositories. Consider using environment variables for production deployments.
