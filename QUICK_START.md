# 🚀 Quick Start Guide

This guide will help you get CollabTask up and running in just a few minutes.

## Prerequisites Check

Before starting, make sure you have:

```bash
# Check Node.js version (should be 20.x or higher)
node --version

# Check npm version (should be 10.x or higher)
npm --version

# Check PostgreSQL (should be 14 or higher)
psql --version
```

## One-Command Setup (Recommended)

### For Unix/Linux/macOS:

```bash
# Clone and setup
git clone https://github.com/yourusername/CHADOWA-S-CollabTask.git
cd CHADOWA-S-CollabTask

# Install all dependencies
npm install && cd backend && npm install && cd ../collabtask-ui && npm install && cd ../core && npm install && npm run build && cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp collabtask-ui/.env.example collabtask-ui/.env

# Edit your .env files with your credentials
# backend/.env - Update DATABASE_URL and JWT_SECRET
# collabtask-ui/.env - Usually no changes needed
```

### For Windows PowerShell:

```powershell
# Clone and setup
git clone https://github.com/yourusername/CHADOWA-S-CollabTask.git
cd CHADOWA-S-CollabTask

# Install all dependencies
npm install
cd backend
npm install
cd ../collabtask-ui
npm install
cd ../core
npm install
npm run build
cd ..

# Copy environment files
Copy-Item backend/.env.example backend/.env
Copy-Item collabtask-ui/.env.example collabtask-ui/.env

# Edit your .env files with your credentials
```

## Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE collabtask;
\q

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Start Development Servers

You'll need **3 terminal windows**:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd collabtask-ui
npm run dev
# Frontend runs on http://localhost:5173
```

### Terminal 3 - Core (Optional, only if making changes to core)
```bash
cd core
npm run build -- --watch
```

## 🎉 You're Ready!

1. Open your browser: `http://localhost:5173`
2. Create an account or use demo credentials
3. Start managing your projects!

## Quick Commands Reference

```bash
# Backend
npm run dev         # Start development server
npm test           # Run tests
npm run build      # Build for production

# Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Core
npm run build      # Build shared types
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001

# Update VITE_API_URL in collabtask-ui/.env
VITE_API_URL=http://localhost:5001
```

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists: `CREATE DATABASE collabtask;`

### Core Package Not Found
```bash
cd core
npm run build
```

## Next Steps

- 📚 Read the [Full Documentation](./README.md)
- 🔍 Explore the [API Documentation](http://localhost:5000/api-docs)
- 🤝 Check out [Contributing Guidelines](./CONTRIBUTING.md)

---

Need help? Open an issue on GitHub!

