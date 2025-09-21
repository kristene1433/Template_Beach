# EmailJS Password Reset Template

## Template Setup Instructions

1. Go to your EmailJS dashboard
2. Navigate to **Email Templates**
3. Click **Create New Template**
4. Use the template content below

---

## Template Content

### Template Name
```
Password Reset Request
```

### Template ID
```
password_reset_request
```
*(Note: Use this ID in your environment variable `REACT_APP_EMAILJS_PASSWORD_RESET_TEMPLATE_ID`)*

### Subject Line
```
🔐 Reset Your Password - Palm Run LLC
```

### Template Content (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - {{company_name}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .reset-title {
            font-size: 24px;
            color: #0ea5e9;
            margin-bottom: 20px;
            text-align: center;
        }
        .reset-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .reset-button {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .reset-button:hover {
            background: #0284c7;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .property-info {
            background: #e3f2fd;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .user-info {
            background: #e8f5e8;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{company_name}}</div>
            <div class="subtitle">Password Reset Request</div>
        </div>
        
        <div class="content">
            <h2 class="reset-title">🔐 Reset Your Password</h2>
            
            <p>Hello {{user_name}},</p>
            
            <p>We received a request to reset your password for your {{company_name}} account.</p>
            
            <div class="user-info">
                <p><strong>Account Email:</strong> {{user_email}}</p>
                <p><strong>Request Date:</strong> {{sent_date}}</p>
            </div>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{reset_url}}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                    <li>If you continue to have problems, contact us directly</li>
                </ul>
            </div>
            
            <div class="property-info">
                <h3>🏖️ About {{company_name}}</h3>
                <p>We manage beautiful beachfront properties in Indian Shores, Florida. If you have any questions about your account or this password reset, please contact us.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ea5e9; background: #f8f9fa; padding: 10px; border-radius: 5px;">{{reset_url}}</p>
            
            <p style="margin-top: 30px;">
                <strong>Need Help?</strong><br>
                If you didn't request this password reset or need assistance, please contact us at:<br>
                <a href="mailto:palmrunbeachcondo@gmail.com" style="color: #0ea5e9;">palmrunbeachcondo@gmail.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>{{company_name}}</strong></p>
            <p>{{property_address}}</p>
            <p>Email: palmrunbeachcondo@gmail.com</p>
            <p>This email was sent on {{sent_date}}</p>
        </div>
    </div>
</body>
</html>
```

### Template Content (Plain Text Version)
```
PASSWORD RESET REQUEST
Palm Run LLC

Hello {{user_name}},

We received a request to reset your password for your {{company_name}} account.

ACCOUNT INFORMATION:
Account Email: {{user_email}}
Request Date: {{sent_date}}

To reset your password, click the link below:
{{reset_url}}

IMPORTANT SECURITY INFORMATION:
- This link will expire in 1 hour for security reasons
- If you didn't request this password reset, please ignore this email
- Never share this link with anyone
- If you continue to have problems, contact us directly

ABOUT PALM RUN LLC:
We manage beautiful beachfront properties in Indian Shores, Florida. 
If you have any questions about your account or this password reset, please contact us.

NEED HELP?
If you didn't request this password reset or need assistance, please contact us at:
palmrunbeachcondo@gmail.com

---
Palm Run LLC
18650 Gulf Blvd Unit 207, Indian Shores, FL 33785
Email: palmrunbeachcondo@gmail.com
This email was sent on {{sent_date}}
```

---

## EmailJS Configuration

### Email Settings Configuration:

#### **"To Email" Field:**
```
{{user_email}}
```

#### **"From Name" Field:**
```
Palm Run LLC
```

#### **"From Email" Field:**
- ✅ **Check "Use Default Email Address"** (leave checked)

#### **"Reply To" Field:**
```
palmrunbeachcondo@gmail.com
```

#### **"Bcc" Field:**
```
(leave empty)
```

#### **"Cc" Field:**
```
(leave empty)
```

---

## Template Variables Used

Make sure these variables are available in your EmailJS template:

- `{{company_name}}` - Company name (Palm Run LLC)
- `{{user_name}}` - User's full name
- `{{user_email}}` - User's email address
- `{{reset_url}}` - Password reset link with token
- `{{sent_date}}` - Timestamp when email was sent
- `{{property_address}}` - Property address

---

## Environment Variable

After creating the template, update your environment variable:

```env
REACT_APP_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_your_actual_template_id
```

*(Replace `template_your_actual_template_id` with the actual template ID from EmailJS)*

---

## Testing

Once the template is created and your environment variable is updated:

1. Test the password reset flow on your website
2. Check that emails are received at the user's email address
3. Verify the reset link works correctly
4. Test the email formatting in different email clients

---

## Key Features

- **Professional design** with Palm Run LLC branding
- **Security warnings** about link expiration and safety
- **Fallback link** if button doesn't work
- **Contact information** for support
- **Responsive design** that works in all email clients
- **Clear user information** showing account details
- **Company branding** consistent with your other templates

---

## Notes

- The template uses the same blue color scheme as your existing password reset template
- All security warnings are prominently displayed
- The reset link is provided both as a button and as plain text
- Contact information is included for user support
- The template is fully responsive and email-client compatible
