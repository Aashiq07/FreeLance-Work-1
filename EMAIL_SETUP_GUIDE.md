# Email Notification System - Complete Setup Guide

## Overview
This guide documents the email notification system implemented for the contact form. When users submit the contact form on your website, an email is automatically sent to `raredrop007@gmail.com` with their submission details.

## Architecture

### Components
1. **Contact Form** (`components/contact.tsx`) - User-facing form with validation
2. **Server Action** (`app/actions/contact.ts`) - Handles form submission, database storage, and email sending
3. **Database** (Supabase) - Stores all contact submissions in the `contact_submissions` table
4. **Email Service** (Resend) - Sends email notifications
5. **Database Initialization** (`lib/init-db.ts`) - Automatically creates the database table on startup
6. **Health Check** (`app/api/health`) - Verifies all systems are operational

## Setup Requirements

### Environment Variables
Ensure these are set in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### How to Get These Variables

**Supabase:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the URL and keys

**Resend:**
1. Go to https://resend.com/api-keys
2. Generate or copy your API key

## How It Works

### Step-by-Step Flow

1. **User Fills Form**
   - Name, email, phone, business type, and message

2. **Form Submission**
   - Client-side validation
   - Form data sent to server action `submitContact`

3. **Server Processing**
   - Creates Supabase service client with full permissions
   - Stores submission in `contact_submissions` table
   - Creates Resend client
   - Sends formatted email with all details

4. **Success/Error Response**
   - Returns success message to user
   - Logs errors for debugging (visible in Vercel logs)

### Database Schema

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY (auto-generated),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP (auto-set to now),
  updated_at TIMESTAMP (auto-set to now)
);
```

## Production Safety Features

### 1. Automatic Database Initialization
- On app startup, the system checks if `contact_submissions` table exists
- If missing, logs instructions to create it
- Prevents errors from missing tables

### 2. Resilient Resend Client
- API key is loaded at request time (not module initialization)
- Prevents build-time failures due to missing env vars
- Better error handling with detailed logging

### 3. Error Handling
- Database errors don't block email sending
- Email errors are properly reported to user
- All errors are logged for debugging

### 4. Health Check Endpoint
- Check system status: `GET /api/health`
- Returns:
  - `supabase: true/false` - Database connection
  - `resend: true/false` - Email service
  - `database: true/false` - Table exists

### 5. Proper Row Level Security
- Anonymous users can insert submissions
- Service role can read all submissions
- Prevents unauthorized data access

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Fill contact form and submit
# Check terminal logs for success
```

### Health Check Test
```bash
curl http://localhost:3000/api/health
# Should return all true
```

### Production Testing
1. Deploy to Vercel
2. Visit your custom domain
3. Fill and submit contact form
4. Check Resend dashboard for email
5. Check Supabase for data storage

## Troubleshooting

### Issue: "Something went wrong. Please try again."

**Solution 1: Check Environment Variables**
- Go to Vercel Project Settings → Environment Variables
- Verify all 4 variables are set correctly
- Redeploy after changes

**Solution 2: Check Health Endpoint**
```bash
curl https://yourdomain.com/api/health
```
- If not all `true`, check Vercel logs

**Solution 3: Check Vercel Logs**
- Go to Vercel dashboard
- Select your project
- Check "Deployments" → recent deployment → "Logs"
- Look for `[v0]` error messages

### Issue: Email Not Received

**Check:**
1. Email address in code is `raredrop007@gmail.com` (verify in `app/actions/contact.ts`)
2. Check Resend dashboard for delivery status
3. Verify RESEND_API_KEY is correct
4. Check spam folder

### Issue: Data Not Saved to Database

**Check:**
1. SUPABASE_SERVICE_ROLE_KEY is set (not just ANON_KEY)
2. Database table exists in Supabase
3. Check Supabase logs for permission errors

## Files Modified/Created

### New Files
- `/lib/init-db.ts` - Database initialization
- `/app/api/health/route.ts` - Health check endpoint
- `/supabase/migrations/001_create_contact_submissions.sql` - Migration script
- `/scripts/migrate.js` - Migration runner

### Modified Files
- `/app/actions/contact.ts` - Added Resend integration
- `/components/contact.tsx` - Updated component
- `/components/whatsapp-button.tsx` - Updated to use react-icons
- `/lib/supabase/server.ts` - Added service role client
- `/app/layout.tsx` - Added database initialization

## Email Format

Users will receive a professional HTML email with:
- Sender's name, email, phone, and business type
- Full message content
- Reply-to set to sender's email
- Professional styling

## Future Improvements

1. **Email Confirmation** - Send confirmation email to user
2. **Email Templates** - Create branded email templates
3. **Submission Notifications** - Real-time notifications in dashboard
4. **Analytics** - Track submission metrics
5. **Automation** - Auto-replies or webhook integrations

## Support

For issues:
1. Check Vercel project logs
2. Verify all environment variables
3. Test health endpoint
4. Check Supabase and Resend dashboards
