# Portfolio System Setup Checklist

Complete this checklist to get your portfolio management system running.

## Firebase Setup

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Create new project or select existing one
- [ ] Enable **Authentication** → Email/Password sign-in method
- [ ] Enable **Firestore Database**
- [ ] Enable **Cloud Storage**
- [ ] Go to **Project Settings** (gear icon)
- [ ] Copy web app config (API Key, Auth Domain, Project ID, etc.)

## Local Environment

- [ ] Clone/download the project
- [ ] Navigate to `app` folder: `cd app`
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```
- [ ] Paste Firebase credentials into `.env.local`
- [ ] Install dependencies: `npm install` or `pnpm install`

## Admin Users

In Firebase Console → Authentication:

- [ ] Click **Add User**
- [ ] Email: `empiredigitalsworldwide@gmail.com`
- [ ] Set password
- [ ] Click **Add User** again
- [ ] Email: `letstalk2mishael@gmail.com`
- [ ] Set password

## Firestore Collections

Your collections auto-create when you add first project, or manually create:

- [ ] Create collection: `webDevelopment`
- [ ] Create collection: `brandDesign`
- [ ] Create collection: `aiAutomation`

## Firestore Security Rules

In Firestore Database → Rules:

- [ ] Copy rules from `FIRESTORE_SETUP.md`
- [ ] Paste into rules editor
- [ ] Click **Publish**

## Storage Security Rules

In Cloud Storage → Rules:

- [ ] Copy rules from `FIRESTORE_SETUP.md`
- [ ] Paste into rules editor
- [ ] Click **Publish**

## Test Locally

- [ ] Run dev server: `npm run dev`
- [ ] Visit `http://localhost:5173`
- [ ] Verify home page loads
- [ ] Click **Admin** link in navbar
- [ ] Login with email from Step 3
- [ ] Verify Admin Dashboard loads
- [ ] Try adding a test project
- [ ] Upload test image
- [ ] Verify project appears on public site
- [ ] Verify image shows in gallery

## Firestore Data Verification

In Firebase Console → Firestore Database:

- [ ] Check `webDevelopment` collection has your test project
- [ ] Check `brandDesign` collection (add a brand project)
- [ ] Check `aiAutomation` collection (add an AI project)
- [ ] Verify `imageUrl` fields point to Storage

## Storage Verification

In Firebase Console → Cloud Storage:

- [ ] Verify `webDevelopment/` folder has images
- [ ] Verify `brandDesign/` folder has images
- [ ] Verify `aiAutomation/` folder has images
- [ ] Images should be accessible (public read enabled)

## Production Deployment

When ready to deploy:

- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel/Netlify
- [ ] Add environment variables to deployment platform:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- [ ] Deploy to production
- [ ] Test admin login on live site
- [ ] Test adding projects on live site
- [ ] Verify images load correctly

## Common Issues & Fixes

If something doesn't work:

- [ ] Check `.env.local` has all Firebase credentials
- [ ] Verify Firestore rules are published (status shows green)
- [ ] Verify Storage rules are published
- [ ] Verify admin users exist in Firebase Auth
- [ ] Check browser console (F12) for error messages
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Check Firestore collections exist
- [ ] Verify Firebase Storage has images

## Quick Reference

**Admin Login:** http://localhost:5173/admin

**Authorized Emails:**
- empiredigitalsworldwide@gmail.com
- letstalk2mishael@gmail.com

**Portfolio URLs:**
- Web Development: http://localhost:5173/#web-development
- Brand Design: http://localhost:5173/#brand-design
- AI Automation: http://localhost:5173/#ai-automation

**File Limits:**
- Max file size: 5MB
- Formats: JPG, PNG, WebP

**Subcategories:**

Web Development:
- Church Website
- Banking & Investment
- Real Estate Agent
- Company Management
- School Management
- Broker Site
- E-Commerce
- Courier Service
- Other Businesses

Brand Design:
- Church Branding
- Flyers
- Birthday Flyers
- Logo
- Other Visuals

## Documentation

Read these for more details:

- `IMPLEMENTATION_GUIDE.md` - Complete setup and features guide
- `FIRESTORE_SETUP.md` - Firestore schema and rules
- `.env.example` - Environment variables

## You're All Set!

Once this checklist is complete:

1. Your portfolio site is live at `/`
2. Admin dashboard is secure at `/admin`
3. Projects auto-sync in real-time
4. Images upload to Firebase Storage
5. Everything is production-ready!

Start adding projects and watch them appear instantly! 🚀
