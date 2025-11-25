# Quick Start Guide

Get the Onboarding Alchemy Platform up and running in under 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

Check your versions:
```bash
node --version
npm --version
```

## Installation Steps

### 1. Install Dependencies (1-2 minutes)

```bash
npm install
```

This installs dependencies for both client and server using npm workspaces.

### 2. Set Up Environment Variables (30 seconds)

```bash
# Copy example files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The default values work fine for local development. You can edit them later if needed.

**Important**: Update `JWT_SECRET` in `server/.env` before deploying to production!

### 3. Initialize Database (30 seconds)

```bash
cd server
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

This creates the SQLite database and adds a default HR user.

### 4. Start the Application (10 seconds)

```bash
npm run dev
```

This starts both the frontend and backend servers.

## Access the Application

**Frontend**: Open http://localhost:5173 in your browser

**Backend API**: http://localhost:3000/api

**Health Check**: http://localhost:3000/health

## Default Login Credentials

```
Email: hr@example.com
Password: password123
```

## What You Can Do

✅ **HR Dashboard**: View onboarding stats and recent activity
✅ **Add Employees**: Create new employee records
✅ **Upload Documents**: Manage employee documents
✅ **Schedule Meetings**: Book meetings with employees
✅ **Track Progress**: Monitor 30-60-90 day plans
✅ **Manage Tasks**: Handle onboarding tasks
✅ **Messaging**: Communicate with team members
✅ **Analytics**: View onboarding metrics
✅ **AI Copilot**: Get AI assistance (requires Azure OpenAI setup)

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues

Reset the database:

```bash
cd server
rm prisma/dev.db
npm run db:push
npm run db:seed
cd ..
```

### Installation Issues

Clean install:

```bash
npm run clean
npm install
```

### Can't Login

Make sure:
1. Backend server is running (check terminal)
2. Database is seeded (run `npm run db:seed --workspace=server`)
3. Using correct credentials: `hr@example.com` / `password123`

## Next Steps

### For Users
- Explore the dashboard
- Add your first employee
- Upload some documents
- Schedule a meeting
- Check out the analytics

### For Developers
- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development guidelines
- Check [README.md](./README.md) for detailed documentation
- Review [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for deployment info

## Useful Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:client       # Start only frontend
npm run dev:server       # Start only backend

# Database
npm run db:studio --workspace=server  # Open Prisma Studio (GUI)
npm run db:seed --workspace=server    # Re-seed database

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Project Structure at a Glance

```
onboarding-alchemy-platform/
├── client/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/     # All pages
│   │   ├── components/ # Reusable components
│   │   └── lib/       # API client & utilities
│   └── .env           # Frontend config
├── server/            # Backend (Express + Prisma)
│   ├── src/
│   │   ├── controllers/ # API logic
│   │   ├── routes/     # API routes
│   │   └── middleware/ # Auth, uploads, etc.
│   ├── prisma/        # Database schema
│   └── .env           # Backend config
└── package.json       # Workspace config
```

## Features Overview

### HR Features
- 👥 Employee Management - Add, edit, view employees
- 📄 Document Management - Upload and organize files
- 📅 Meeting Scheduling - Book and manage meetings
- 📊 30-60-90 Day Plans - Track onboarding milestones
- ✅ Task Management - Manage onboarding tasks
- 💬 Messaging - Internal communication
- 📈 Analytics - Visualize metrics
- 🤖 AI Copilot - AI-powered assistance

### Employee Features
- 🏠 Personal Dashboard - View your progress
- 📂 Document Access - Download your documents
- 📅 Self-Schedule - Book meetings with HR
- ✅ Progress Tracking - See your 30-60-90 plan
- 👤 Profile Management - Update your info

## Security Notes

⚠️ **Development Mode**: The default setup is for local development only.

Before deploying to production:
1. Change `JWT_SECRET` in `server/.env`
2. Use a strong, random secret key
3. Switch to PostgreSQL (recommended)
4. Enable HTTPS
5. Review security settings

## Getting Help

- 📖 Full documentation: [README.md](./README.md)
- 💻 Development guide: [DEVELOPMENT.md](./DEVELOPMENT.md)
- 🚀 Production setup: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- 🐛 Found a bug? Check the issue tracker

## What's Next?

1. **Explore the app** - Try out all the features
2. **Add real data** - Create actual employee records
3. **Customize** - Adjust settings to match your needs
4. **Deploy** - When ready, follow the production guide

---

**Need help?** Check the documentation or reach out to the team!

**Ready to develop?** Read [DEVELOPMENT.md](./DEVELOPMENT.md) for coding guidelines!

Happy onboarding! 🎉
