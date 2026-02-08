# SMTP Email Configuration for Railway

## Overview

Your Django app is now configured to send emails via SMTP on Railway. The configuration supports multiple email providers and uses **Port 587** (TLS) which works on Railway's free tier.

---

## Quick Setup Guide

### Option 1: Gmail SMTP (Easiest for Testing)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter name: "ACM CUI Web"
4. Click **Generate**
5. Copy the 16-character password

#### Step 3: Set Environment Variables on Railway

Go to your Railway project → Variables → Add these:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Limits:** 500 emails/day (free)

---

### Option 2: SendGrid (Recommended for Production)

#### Step 1: Sign Up
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free account (no credit card needed)
3. Verify your email

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click **Create API Key**
3. Name: "ACM CUI Railway"
4. Permission: **Full Access**
5. Copy the API key (starts with `SG.`)

#### Step 3: Verify Sender Identity
1. Go to Settings → Sender Authentication
2. Click **Verify a Single Sender**
3. Fill in your details
4. Verify the email they send you

#### Step 4: Set Environment Variables on Railway

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=your-verified-email@domain.com
```

**Limits:** 100 emails/day (free)

---

### Option 3: Resend (Modern & Developer-Friendly)

#### Step 1: Sign Up
1. Go to [Resend](https://resend.com/)
2. Sign up (no credit card needed)

#### Step 2: Get API Key
1. Go to API Keys
2. Click **Create API Key**
3. Name: "ACM CUI Production"
4. Copy the API key (starts with `re_`)

#### Step 3: Add Domain (or use onboarding@resend.dev for testing)
- For testing: Use `onboarding@resend.dev` as sender
- For production: Add your domain

#### Step 4: Set Environment Variables on Railway

```bash
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=your-resend-api-key
DEFAULT_FROM_EMAIL=onboarding@resend.dev
```

**Limits:** 3,000 emails/month (free)

---

## Local Development Setup

Create a `.env` file in your backend directory:

```bash
# .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Note:** If you don't set these variables locally, emails will print to console (for debugging).

---

## Testing Email Configuration

### Method 1: Django Shell

```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email from ACM CUI',
    'This is a test email to verify SMTP configuration.',
    'your-email@gmail.com',
    ['recipient@example.com'],
    fail_silently=False,
)
```

If successful, you'll see: `1` (number of emails sent)

### Method 2: Test OTP Endpoint

Use your frontend or Postman to trigger the OTP sending functionality.

---

## Troubleshooting

### Error: "SMTPAuthenticationError"
- **Gmail**: Make sure you're using App Password, not regular password
- **SendGrid/Resend**: Verify API key is correct

### Error: "Connection refused" or "Timeout"
- Check `EMAIL_PORT` is set to `587` (not 25 or 465)
- Verify `EMAIL_USE_TLS` is `True`

### Error: "Sender address rejected"
- **Gmail**: Use the same email as `EMAIL_HOST_USER`
- **SendGrid**: Use verified sender email
- **Resend**: Use `onboarding@resend.dev` or verified domain

### Emails not sending on Railway
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Make sure you redeployed after adding variables

---

## Environment Variables Summary

Required variables for Railway:

| Variable | Example | Description |
|----------|---------|-------------|
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP server address |
| `EMAIL_PORT` | `587` | SMTP port (use 587 for TLS) |
| `EMAIL_USE_TLS` | `True` | Enable TLS encryption |
| `EMAIL_HOST_USER` | `your-email@gmail.com` | SMTP username |
| `EMAIL_HOST_PASSWORD` | `app-password-here` | SMTP password/API key |
| `DEFAULT_FROM_EMAIL` | `your-email@gmail.com` | Default sender email |

---

## Deployment Checklist

- [ ] Choose email provider (Gmail/SendGrid/Resend)
- [ ] Generate API key or App Password
- [ ] Set environment variables on Railway
- [ ] Redeploy your Railway app
- [ ] Test email sending
- [ ] Monitor Railway logs for any errors

---

## Recommended Setup

**For Testing/Development:**
- Use Gmail with App Password

**For Production:**
- Use SendGrid or Resend
- Set up proper domain authentication
- Monitor email delivery rates

---

## Need Help?

If emails still don't work:
1. Check Railway logs: `railway logs`
2. Verify environment variables are set
3. Test locally first with the same credentials
4. Check email provider's dashboard for delivery status

---

**Current Configuration Status:**
✅ SMTP backend configured
✅ Port 587 (Railway-compatible)
✅ TLS encryption enabled
✅ Environment variable support
✅ Development fallback (console backend)
