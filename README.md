# Portfolio Management System

A complete portfolio website with admin dashboard for managing three portfolio directories: Web Development, Brand Design, and AI Automation.

## Features

✨ **Three Portfolio Directories**
- Web Development (9 subcategories)
- Brand Design (5 subcategories)  
- AI Automation

🔐 **Protected Admin Dashboard**
- Email-based authentication
- Authorized admins only
- Manage all portfolio types

📸 **Image Management**
- Drag-drop uploads
- Firebase Storage integration
- 5MB max file size
- Auto-optimization

🔄 **Real-time Synchronization**
- Firestore database
- Instant updates
- Live project gallery

🎨 **Modern UI**
- Responsive design
- Image gallery with lightbox
- Smooth animations
- Dark theme

## Quick Start

### 1. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable: Authentication, Firestore Database, Cloud Storage
4. Get your web app credentials

### 2. Configure Environment

```bash
cd app
cp .env.example .env.local
# Paste your Firebase credentials into .env.local
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### 4. Access Admin Dashboard

- Go to `http://localhost:5173/admin`
- Login with authorized email:
  - empiredigitalsworldwide@gmail.com
  - letstalk2mishael@gmail.com

(Create these emails in Firebase Authentication first)

## What Was Built

### Public Site
- Main portfolio website with 3 new sections
- Web Development projects with 9 categories
- Brand Design projects with 5 categories
- AI Automation projects
- Real-time gallery updates

### Admin Dashboard
- Protected admin login
- Add/delete projects
- Image uploads with drag-drop
- Real-time project management
- Instant publication

### Backend
- Firebase authentication
- Firestore real-time database
- Cloud Storage for images
- Security rules configured

## File Structure

```
├── app/                          # Main application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── contexts/             # Auth context
│   │   ├── pages/                # Admin pages
│   │   ├── sections/             # Portfolio sections
│   │   └── lib/                  # Firebase config
│   ├── .env.example              # Environment template
│   └── package.json
├── SETUP_CHECKLIST.md            # Step-by-step setup
├── IMPLEMENTATION_GUIDE.md       # Complete guide
├── FIRESTORE_SETUP.md            # Database schema
└── PORTFOLIO_SYSTEM.md           # What was built
```

## Documentation

Read these files in order:

1. **SETUP_CHECKLIST.md** - Get started quickly
2. **IMPLEMENTATION_GUIDE.md** - Complete setup guide
3. **FIRESTORE_SETUP.md** - Database configuration
4. **PORTFOLIO_SYSTEM.md** - System overview

## Key Routes

- `/` - Main portfolio website
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard (protected)

## Authorized Admins

These emails can access the admin dashboard:
- `empiredigitalsworldwide@gmail.com`
- `letstalk2mishael@gmail.com`

Create them in Firebase Authentication with passwords.

## Technology

- React 19 + TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- React Router
- Vite

## Portfolio Subcategories

### Web Development
- Church Website
- Banking & Investment
- Real Estate Agent
- Company Management
- School Management
- Broker Site
- E-Commerce
- Courier Service
- Other Businesses

### Brand Design
- Church Branding
- Flyers
- Birthday Flyers
- Logo
- Other Visuals

### AI Automation
- All projects

## Admin Features

✓ Add projects with images
✓ Categorize into subcategories
✓ Add descriptions and links
✓ Upload images (5MB max)
✓ Delete projects
✓ View thumbnails
✓ Real-time updates

## Image Support

**Formats**: JPG, PNG, WebP
**Max Size**: 5MB
**Upload**: Drag-drop interface
**Storage**: Firebase Storage

## Security

- ✓ Public portfolios (read-only)
- ✓ Admin authentication required
- ✓ Email validation (2 authorized addresses)
- ✓ Firebase Security Rules
- ✓ Password protected
- ✓ CORS enabled

## Deployment

Ready for production on:
- Vercel
- Netlify
- Any Node.js hosting

Add environment variables and deploy:
```bash
npm run build
```

## Get Started Now

1. **Read** → `SETUP_CHECKLIST.md`
2. **Configure** → Firebase + `.env.local`
3. **Run** → `npm run dev`
4. **Login** → `/admin`
5. **Add Projects** → Start managing portfolio!

## Project URLs

After setup:

- Website: `http://localhost:5173`
- Admin Login: `http://localhost:5173/admin`
- Web Dev: `http://localhost:5173/#web-development`
- Brand: `http://localhost:5173/#brand-design`
- AI: `http://localhost:5173/#ai-automation`

## Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for troubleshooting
2. Review `FIRESTORE_SETUP.md` for database issues
3. Check browser console (F12) for errors
4. Verify Firebase credentials in `.env.local`

## License

Your portfolio system is ready for production use.

---

**Start with:** Read `SETUP_CHECKLIST.md` → Follow steps → Launch! 🚀
