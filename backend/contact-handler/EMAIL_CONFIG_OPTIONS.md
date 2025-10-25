# Email Configuration Options for Contact Handler

Since Gmail app passwords aren't working for you, here are several alternative email configurations:

## Option 1: Outlook/Hotmail (RECOMMENDED - Easiest Setup)

**Steps:**
1. Create a Microsoft account at outlook.com (if you don't have one)
2. Update your `.env` file with:
   ```
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-email@outlook.com
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   EMAIL_PASSWORD=your-regular-password
   CONTACT_EMAIL=your-email@outlook.com
   ```

**Pros:** Uses regular password, no app passwords needed
**Cons:** None really

## Option 2: Yahoo Mail

**Steps:**
1. Go to Yahoo Mail settings → Security → Generate app password
2. Update your `.env` file with:
   ```
   EMAIL_SERVICE=yahoo
   EMAIL_USER=your-email@yahoo.com
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   EMAIL_PASSWORD=your-app-password-from-yahoo
   CONTACT_EMAIL=your-email@yahoo.com
   ```

## Option 3: Custom SMTP Provider (e.g., SendGrid, Mailgun)

**For SendGrid:**
```
EMAIL_SERVICE=custom
EMAIL_USER=apikey
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_PASSWORD=your-sendgrid-api-key
CONTACT_EMAIL=your-verified-sender-email
```

**For Mailgun:**
```
EMAIL_SERVICE=custom
EMAIL_USER=your-mailgun-smtp-username
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
EMAIL_PASSWORD=your-mailgun-smtp-password
CONTACT_EMAIL=your-verified-domain-email
```

## Option 4: ProtonMail Bridge (Advanced)

If you use ProtonMail, you can install ProtonMail Bridge:
```
EMAIL_SERVICE=custom
EMAIL_USER=your-email@protonmail.com
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
EMAIL_PASSWORD=your-bridge-password
CONTACT_EMAIL=your-email@protonmail.com
```

## Testing Your Configuration

After updating your `.env` file:

1. Restart the contact handler service:
   ```bash
   cd backend/contact-handler
   npm start
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3002/health
   ```

3. Test sending an email through your contact form or using a tool like Postman

## Recommended: Start with Outlook

I've already configured your `.env` file for Outlook. Just:
1. Replace `your-email@outlook.com` with your actual Outlook email
2. Replace `your-email-password` with your actual Outlook password
3. Update `CONTACT_EMAIL` to the same email address

This should work immediately without any special setup!