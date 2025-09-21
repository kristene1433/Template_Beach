# EmailJS Contact Template

## Template Setup Instructions

1. Go to your EmailJS dashboard
2. Navigate to **Email Templates**
3. Click **Create New Template**
4. Use the template content below

---

## Template Content

### Template Name
```
Contact Form Submission
```

### Template ID
```
contact_form_submission
```
*(Note: Use this ID in your environment variable `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID`)*

### Subject Line
```
New Contact Message from {{from_name}}
```

### Template Content (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <!-- Header -->
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Palm Run LLC Website</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <!-- Contact Details -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
                <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Contact Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; color: #6b7280;">{{from_name}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                        <td style="padding: 8px 0; color: #6b7280;">
                            <a href="mailto:{{from_email}}" style="color: #2563eb; text-decoration: none;">{{from_email}}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
                        <td style="padding: 8px 0; color: #6b7280;">{{phone}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                        <td style="padding: 8px 0; color: #6b7280;">{{subject}}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Message Content -->
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Message</h2>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #10b981;">
                    <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">{{message}}</p>
                </div>
            </div>
            
            <!-- Footer Info -->
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; text-align: center;">
                <p style="margin: 0; color: #065f46; font-size: 14px;">
                    <strong>Sent via:</strong> Palm Run LLC Website Contact Form<br>
                    <strong>Date:</strong> {{sent_date}}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2024 Palm Run LLC - Beachfront Rental Property</p>
        </div>
    </div>
</body>
</html>
```

### Template Content (Plain Text Version)
```
NEW CONTACT MESSAGE
Palm Run LLC Website

CONTACT DETAILS:
Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Subject: {{subject}}

MESSAGE:
{{message}}

---
Sent via: Palm Run LLC Website Contact Form
Date: {{sent_date}}

© 2024 Palm Run LLC - Beachfront Rental Property
```

---

## Template Variables Used

Make sure these variables are available in your EmailJS template:

- `{{from_name}}` - Contact form name field
- `{{from_email}}` - Contact form email field  
- `{{phone}}` - Contact form phone field
- `{{subject}}` - Contact form subject field
- `{{message}}` - Contact form message field
- `{{sent_date}}` - Timestamp when email was sent
- `{{to_email}}` - Your admin email (palmrunbeachcondo@gmail.com)

---

## Environment Variable

After creating the template, update your environment variable:

```env
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_your_actual_template_id
```

*(Replace `template_your_actual_template_id` with the actual template ID from EmailJS)*

---

## Testing

Once the template is created and your environment variable is updated:

1. Test the contact form on your website
2. Check that emails are received at palmrunbeachcondo@gmail.com
3. Verify the email formatting looks correct
4. Test reply functionality (should reply to the user's email)

---

## Notes

- The template is designed to be professional and branded for Palm Run LLC
- It includes proper HTML styling for email clients
- The email will be sent TO your admin email, not to the tenant
- You can reply directly to the user's email address
- The template includes all contact form fields in an organized layout
