# CollabTask - Project Management & Collaboration Platform

<div align="center">

![CollabTask](https://img.shields.io/badge/CollabTask-v1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

A modern, full-stack project management and team collaboration platform built with TypeScript.

[English](#english) | [Türkçe](./README.tr.md)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

CollabTask is a comprehensive project management and team collaboration platform designed to streamline workflows, enhance team productivity, and provide real-time insights into project progress. Built with modern web technologies and following best practices in software architecture.

---

## ✨ Features

### Project Management
- 📊 **Project Dashboard** - Real-time overview of all projects
- 📝 **Task Management** - Create, assign, and track tasks
- 🎨 **Kanban Board** - Visual task management with drag-and-drop
- 📈 **Progress Tracking** - Monitor project and task completion
- 🏷️ **Tags & Labels** - Organize projects and tasks efficiently

### Team Collaboration
- 👥 **User Management** - Invite and manage team members
- 🔐 **Role-Based Access Control** - Admin, Manager, and Member roles
- 👨‍👩‍👧‍👦 **Team Management** - Create and organize teams
- 💬 **Activity Feed** - Real-time updates on team activities
- 🔔 **Notifications** - Stay informed about important events

### Advanced Features
- 🔍 **Advanced Search** - Find projects, tasks, and users quickly
- 📊 **Analytics & Reports** - Detailed insights and statistics
- ⏱️ **Time Tracking** - Track time spent on tasks
- 📎 **File Management** - Attach files to projects and tasks
- 🌓 **Modern UI** - Clean, responsive, and intuitive interface

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

### Frontend
- **Framework:** React 19.1
- **Build Tool:** Vite 7.x
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router v7

### Shared
- **Core Package:** Shared types and interfaces
- **Monorepo Structure:** Organized codebase with clear separation

---

## 📁 Project Structure

```
CHADOWA-S-CollabTask/
├── backend/                 # Backend API (Express.js)
│   ├── src/
│   │   ├── features/       # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── projects/   # Project management
│   │   │   ├── tasks/      # Task management
│   │   │   ├── teams/      # Team management
│   │   │   ├── notifications/
│   │   │   ├── activities/
│   │   │   ├── files/
│   │   │   └── search/
│   │   ├── core/           # Core utilities
│   │   ├── infrastructure/ # Database & external services
│   │   └── main.ts         # Application entry point
│   ├── prisma/             # Database schema & migrations
│   └── package.json
│
├── collabtask-ui/          # Frontend Application (React)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── core/                   # Shared types & interfaces
│   ├── src/
│   │   └── types/
│   │       ├── entities.ts # Entity definitions
│   │       ├── enums.ts    # Shared enums
│   │       └── common.ts   # Common types
│   └── package.json
│
└── package.json            # Root package.json
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** (v10.x or higher) - Comes with Node.js
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CHADOWA-S-CollabTask.git
cd CHADOWA-S-CollabTask
```

### 2. Install Dependencies

Install dependencies for all packages:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../collabtask-ui
npm install

# Install core package dependencies
cd ../core
npm install
```

### 3. Build Core Package

The core package contains shared types used by both frontend and backend:

```bash
cd core
npm run build
```

---

## ⚙️ Configuration

### 1. Database Setup

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE collabtask;

# Exit PostgreSQL
\q
```

### 2. Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
```

Create `.env` file with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/collabtask"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional: Redis (if using caching)
REDIS_URL=redis://localhost:6379

# Optional: Kafka (if using event streaming)
KAFKA_BROKERS=localhost:9092
```

**⚠️ Important:** Replace `your_password` and `your_super_secret_jwt_key_change_this_in_production` with your actual values.

### 3. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Frontend Environment Variables

Create a `.env` file in the `collabtask-ui/` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Running the Application

### Development Mode

You'll need **three terminal windows**:

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

The backend will start at `http://localhost:5000`

#### Terminal 2: Frontend Development Server

```bash
cd collabtask-ui
npm run dev
```

The frontend will start at `http://localhost:5173`

#### Terminal 3: Watch Core Package (Optional)

If you're making changes to the core package:

```bash
cd core
npm run build -- --watch
```

### Production Build

#### Build Backend

```bash
cd backend
npm run build
npm start
```

#### Build Frontend

```bash
cd collabtask-ui
npm run build
npm run preview
```

---

## 📚 API Documentation

Once the backend is running, you can access the Swagger API documentation at:

```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `GET /api/users/me/stats` - Get user statistics
- `PUT /api/users/:id` - Update user
- `POST /api/users/invite` - Invite new user

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit
```

---

## 🔒 Default Users

After running migrations, you can create an admin user manually or use the registration endpoint.

**Recommended First User:**
- Email: `admin@collabtask.com`
- Password: `Admin123!` (change after first login)
- Role: `ADMIN`

---

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📝 Development Workflow

1. Create a new branch for your feature
2. Make changes in the appropriate package
3. If changing core types, rebuild the core package
4. Test your changes
5. Create a pull request

---

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure the database exists
4. Run migrations: `npx prisma migrate deploy`

### Port Already in Use

If port 5000 or 5173 is already in use:

1. Change the port in backend `.env` (PORT variable)
2. Update frontend API URL accordingly
3. Restart the servers

### Core Package Not Found

If you get errors about `collabtask-core` not found:

1. Build the core package: `cd core && npm run build`
2. Reinstall dependencies in backend and frontend
3. Restart the development servers

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**CHADOWA-S Development Team**

---

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- React team for the powerful UI library
- Prisma team for the excellent ORM
- All open-source contributors

---

<div align="center">

Made with ❤️ by CHADOWA-S Team

</div>
