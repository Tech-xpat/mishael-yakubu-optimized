# Email Marketing - Quick Start

## 5-Minute Setup

### 1. Create Resend Account
- Go to https://resend.com
- Sign up with your email
- Copy your API key from API Keys section

### 2. Add Environment Variable
Create `.env.local` in `/app`:
```env
VITE_RESEND_API_KEY=your_key_here
```

### 3. Create Firestore Collection
- Firebase Console → Firestore Database
- Create collection named: `subscribers`
- Done!

### 4. Test It
- Run: `npm run dev`
- Find the newsletter form in the footer
- Enter an email to subscribe
- Check admin dashboard to manage

## Using Email Marketing

### Newsletter Signup
- Located in footer on every page
- Collects name and email
- Sends automatic welcome email
- Takes 30 seconds to set up

### Send Emails from Admin
1. Go to `/admin` → "Email Marketing"
2. Choose a tab:
   - **Subscribers** - View all signups
   - **Newsletter** - Send custom emails
   - **Announcements** - Announce new projects

### Send Newsletter
```
Admin Dashboard → Email Marketing → Newsletter Tab
1. Enter subject (e.g., "December Updates")
2. Enter content (HTML supported)
3. Click "Send to X Subscribers"
```

### Announce New Project
```
Admin Dashboard → Email Marketing → Announcements Tab
1. Enter project name (e.g., "New E-Commerce Site")
2. Select category (Web/Brand/AI)
3. Click "Send Announcement"
```

## Files Created

```
/app/src/
  ├── lib/
  │   └── emailService.ts          (Email functions)
  ├── components/
  │   ├── NewsletterSignup.tsx      (Footer signup form)
  │   └── admin/
  │       └── AdminEmailMarketing.tsx (Email admin panel)
  └── sections/
      └── Footer.tsx                (Updated with newsletter)

/app/.env.example                   (Updated with Resend key)
```

## Environment Variables Needed

```env
VITE_RESEND_API_KEY=<your_resend_api_key>
```

Get from: https://resend.com → API Keys

## Features

✅ Newsletter signup form in footer
✅ Automatic welcome emails
✅ Send custom newsletters
✅ Announce new projects
✅ Manage all subscribers
✅ View subscriber stats
✅ Delete/unsubscribe users
✅ Real-time updates

## Firestore Schema

```
subscribers/
├── id: (auto-generated)
├── email: "user@example.com"
├── name: "User Name"
├── subscribedAt: timestamp
├── status: "active" or "unsubscribed"
├── receivedWelcome: true/false
└── lastEmailSent: timestamp
```

## What Happens

1. **User subscribes** in footer → Welcome email sent automatically
2. **You send newsletter** from admin → All subscribers receive it
3. **You announce project** → Email goes to all subscribers with project details

## Email Endpoints

All emails are sent from: `noreply@empiredigitalsworldwide.com`

### Email Types:
- Welcome Email - On new subscription
- Newsletter - Custom content you write
- Project Announcement - Auto-formatted project update

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Emails not sending" | Check `.env.local` has correct API key |
| "Subscribers not showing" | Make sure Firestore collection is named `subscribers` |
| "No signup form visible" | Check Footer.tsx component is imported in App.tsx |
| "Email in spam" | Add your domain to Resend verified senders |

## Dashboard URLs

- **Admin Login:** `/admin`
- **Admin Dashboard:** `/admin/dashboard`
- **Portfolio:** `/` (homepage)

## Next: Verify It Works

1. Add `.env.local` with API key
2. Run `npm run dev`
3. Scroll to footer
4. Enter an email in newsletter form
5. Should see "Thank you for subscribing!"
6. Go to `/admin/dashboard` → "Email Marketing"
7. Should see the new subscriber listed

## Advanced Options

Once set up, you can:
- Send HTML-formatted newsletters
- Target specific subscriber groups
- Track email performance
- Schedule announcement campaigns
- Create custom email templates

See `EMAIL_AUTOMATION_SETUP.md` for advanced setup.

---

**Status:** Ready to use once API key is added!
Need help? See `EMAIL_AUTOMATION_SETUP.md`
