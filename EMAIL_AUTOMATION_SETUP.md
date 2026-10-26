# Email Automation Setup Guide

This guide will help you set up the complete email marketing system with Resend integration.

## What's Included

The email automation system includes:
- **Newsletter Signup Form** - Located in the footer, collects subscriber emails
- **Welcome Emails** - Automatically sent to new subscribers
- **Email Management Dashboard** - Manage subscribers from the admin panel
- **Newsletter Campaigns** - Send custom newsletters to all subscribers
- **Project Announcements** - Notify subscribers of new portfolio projects
- **Subscriber Tracking** - Monitor email performance and subscriber status

## Prerequisites

1. Firebase project already set up (with users configured)
2. Resend account (https://resend.com) - sign up for free

## Step-by-Step Setup

### 1. Create a Resend Account

1. Go to https://resend.com
2. Click "Sign Up" and create your account
3. Verify your email address
4. You'll be taken to the dashboard

### 2. Get Your Resend API Key

1. From the Resend dashboard, look for "API Keys" in the left sidebar
2. Click "Create API Key"
3. Name it something like "Portfolio Site"
4. Copy the generated API key (it will look like `re_XXXxxxx...`)

### 3. Configure Environment Variables

1. Navigate to your app folder: `/app`
2. Create a `.env.local` file (copy from `.env.example` if it exists):

```env
VITE_RESEND_API_KEY=your_api_key_here
```

3. Paste your Resend API key in place of `your_api_key_here`
4. Save the file

### 4. Set Up Firebase Collections

The system uses Firestore to store subscriber data. You need to create the `subscribers` collection:

**In Firebase Console:**

1. Go to https://console.firebase.google.com/
2. Select your project (mishael-port-folio)
3. Click "Firestore Database" in the left sidebar
4. Click "Create Database"
5. Choose "Start in production mode"
6. Click "Create"
7. Once created, click "Create collection"
8. Name it: `subscribers`
9. Click "Next"
10. Skip adding the first document (click "Save" without filling fields)
11. Click "Done"

The collection will auto-create when the first subscriber signs up.

### 5. Install Dependencies

```bash
npm install
```

This will install Resend and other required packages.

### 6. Run Your Application

```bash
npm run dev
```

## Features

### Newsletter Signup Form

The newsletter signup form appears in the footer and:
- Collects subscriber name and email
- Validates email format
- Sends a welcome email automatically
- Shows success/error messages
- Prevents duplicate subscriptions

**Location:** Footer section (visible on all pages)

### Admin Email Management

Access the email management panel from the admin dashboard:

1. Go to `/admin` and login with your email
2. Click the "Email Marketing" tab

#### Subscribers Tab
- View all active subscribers
- See subscription date
- Check if welcome email was sent
- Delete subscribers if needed
- Real-time refresh

#### Newsletter Tab
- Write and send custom newsletters
- Use HTML for formatting
- Target all subscribers at once
- Track who received it

#### Announcements Tab
- Announce new portfolio projects
- Choose project category
- Automatically formatted email
- Sent to all subscribers

### Automatic Email Flows

#### Welcome Email
- **Triggered:** When someone subscribes
- **Content:** Welcome message + link to portfolio
- **Sent from:** noreply@empiredigitalsworldwide.com

#### Project Announcement
- **Triggered:** When you announce from admin dashboard
- **Content:** Project details + portfolio link
- **Sent from:** noreply@empiredigitalsworldwide.com

#### Newsletter Campaign
- **Triggered:** When you send from admin dashboard
- **Content:** Custom HTML content
- **Sent from:** noreply@empiredigitalsworldwide.com

## Email Templates

The system includes pre-designed templates for:

1. **Welcome Email** - Introduces subscribers to your services
2. **Project Announcement** - Highlights new portfolio projects
3. **Newsletter** - Custom content for marketing campaigns

All templates are responsive and work on all devices.

## Sending Marketing Emails

### Manually Send Newsletter

1. Login to admin dashboard
2. Go to "Email Marketing" → "Newsletter"
3. Enter subject and content
4. Click "Send to X Subscribers"

### Auto-Announce New Projects

When you add a new project to a portfolio section:

1. Go to admin dashboard
2. Add your project (name, images, etc.)
3. Switch to "Email Marketing" → "Announcements"
4. Enter the project name
5. Select the category
6. Click "Send Announcement"

This sends a professional email to all subscribers about your new work.

## Database Structure

### Subscribers Collection

Each subscriber document contains:

```json
{
  "id": "document_id",
  "email": "user@example.com",
  "name": "User Name",
  "subscribedAt": "2025-02-21T10:30:00Z",
  "status": "active",
  "receivedWelcome": true,
  "lastEmailSent": "2025-02-21T10:30:15Z"
}
```

### Field Descriptions

- **email** - Subscriber's email address (unique)
- **name** - Subscriber's name
- **subscribedAt** - When they signed up
- **status** - "active" or "unsubscribed"
- **receivedWelcome** - Whether welcome email was sent
- **lastEmailSent** - Timestamp of last email sent to them

## Troubleshooting

### "Email already subscribed"
- The email is already in your subscriber list
- Go to admin dashboard to manage

### Emails not sending
1. Check that VITE_RESEND_API_KEY is set in `.env.local`
2. Verify Resend API key is valid (copy from resend.com again if needed)
3. Check browser console for error messages
4. Ensure Firestore subscribers collection exists

### Welcome email not sent
- Check your Resend account for delivery status
- Look in spam/promotions folder
- Verify the email in Firestore shows `receivedWelcome: true`

### Subscribers not showing up
1. Make sure Firestore collection is named exactly "subscribers"
2. Check that Firebase Realtime Database Rules allow reads/writes
3. Verify Firebase credentials are correct

## Firebase Firestore Rules

For production, update your Firestore security rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to subscribers (for authentication verification)
    match /subscribers/{document=**} {
      allow read: if true;
      allow create: if request.resource.data.email is string;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Advanced: Custom Email Templates

To customize email templates, edit `/app/src/lib/emailService.ts`:

```typescript
welcome: (name: string, portfolioUrl: string) => `
  // Your custom HTML here
`
```

## API Reference

### emailService.ts Functions

#### `addSubscriber(email: string, name?: string)`
Adds a new subscriber and sends welcome email.

#### `getSubscribers()`
Returns array of all active subscribers.

#### `sendNewsletter(subject: string, content: string)`
Sends custom newsletter to all subscribers.

#### `sendProjectAnnouncement(projectName: string, category: string)`
Sends project announcement to all subscribers.

#### `unsubscribeEmail(email: string)`
Marks subscriber as unsubscribed (doesn't delete, just updates status).

#### `deleteSubscriber(email: string)`
Permanently deletes a subscriber.

## Best Practices

1. **Email Frequency** - Don't send more than 1-2 emails per week
2. **Personalization** - Use subscriber names in emails
3. **Timing** - Schedule announcements for business hours (9am-5pm)
4. **Quality** - Always review email content before sending
5. **Tracking** - Check admin dashboard to see subscriber engagement

## Security Notes

- Never share your Resend API key
- Keep `.env.local` out of version control
- Only authorized admins can send emails from dashboard
- Subscriber emails are stored securely in Firestore
- Use HTTPS for all email-related communications

## Support

For issues with Resend:
- Visit https://resend.com/docs
- Check their support page: https://resend.com/support

For Firebase issues:
- Visit https://firebase.google.com/docs
- Check Firebase console for error messages

## Next Steps

1. Set up your Resend account and get API key
2. Create `.env.local` with your API key
3. Create Firestore subscribers collection
4. Test the newsletter signup in the footer
5. Go to admin dashboard → Email Marketing to test sending

That's it! Your email automation is ready to use.
