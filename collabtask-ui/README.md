# CollabTask Frontend

Frontend application for CollabTask - Project Management & Collaboration Platform

## 🚀 Tech Stack

- **Framework:** React 19.1
- **Build Tool:** Vite 7.x
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS (utility-first CSS)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router v7
- **Package Manager:** npm

## 📁 Project Structure

```
collabtask-ui/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ActivityFeed.tsx
│   │   ├── AdvancedFilters.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── CreateTaskModal.tsx
│   │   ├── CreateTeamModal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Input.tsx
│   │   ├── InviteUserModal.tsx
│   │   ├── Layout.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   ├── pages/            # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── KanbanPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   └── index.ts
│   ├── services/         # API services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── notifications.service.ts
│   │   ├── projects.service.ts
│   │   ├── tasks.service.ts
│   │   ├── teams.service.ts
│   │   └── users.service.ts
│   ├── store/            # State management
│   │   └── authStore.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── lib/              # Utility functions
│   │   └── api.config.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── dist/                 # Build output
└── package.json
```

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Application will run at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## 🎨 UI Components

### Basic Components
- **Button** - Customizable button with variants
- **Input** - Form input fields
- **Card** - Container component
- **Badge** - Status and tag indicators
- **Avatar** - User profile images
- **ProgressBar** - Progress visualization

### Complex Components
- **Modal** - Reusable modal dialogs
- **Dropdown** - Dropdown menus
- **Layout** - Page layout wrapper
- **Navbar** - Navigation bar

### Feature Components
- **CreateProjectModal** - Project creation form
- **CreateTaskModal** - Task creation form
- **CreateTeamModal** - Team creation form
- **InviteUserModal** - User invitation form
- **ActivityFeed** - Activity timeline
- **NotificationCenter** - Notification panel
- **AdvancedFilters** - Filtering interface

## 📄 Pages

### Public Pages
- **HomePage** (`/`) - Landing page
- **LoginPage** (`/login`) - User login
- **SignupPage** (`/signup`) - User registration

### Protected Pages (Requires Authentication)
- **DashboardPage** (`/dashboard`) - Overview dashboard
- **ProjectsPage** (`/projects`) - Project list and management
- **KanbanPage** (`/kanban`) - Kanban board for tasks
- **UserManagementPage** (`/users`) - User and team management
- **ProfilePage** (`/profile`) - User profile and settings

## 🔐 Authentication

The app uses JWT-based authentication managed by Zustand store.

### Auth Store
Located in `src/store/authStore.ts`:
- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Auth status
- `login()` - Login user
- `logout()` - Logout user
- `register()` - Register new user

### Protected Routes
Protected routes automatically redirect to `/login` if the user is not authenticated.

## 🌐 API Services

### Auth Service (`auth.service.ts`)
- `login()` - User login
- `register()` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user
- `updateProfile()` - Update user profile

### Projects Service (`projects.service.ts`)
- `getProjects()` - Get all projects
- `getProjectById()` - Get project by ID
- `createProject()` - Create new project
- `updateProject()` - Update project
- `deleteProject()` - Delete project

### Tasks Service (`tasks.service.ts`)
- `getTasks()` - Get all tasks
- `getTaskById()` - Get task by ID
- `createTask()` - Create new task
- `updateTask()` - Update task
- `deleteTask()` - Delete task

### Users Service (`users.service.ts`)
- `getUsers()` - Get all users
- `getUserById()` - Get user by ID
- `getUserStats()` - Get user statistics
- `inviteUser()` - Invite new user

### Teams Service (`teams.service.ts`)
- `getTeams()` - Get all teams
- `createTeam()` - Create new team
- `updateTeam()` - Update team
- `deleteTeam()` - Delete team

## 🎨 Styling

The app uses **Tailwind CSS** for styling:

### Utility Classes
- Responsive design: `sm:`, `md:`, `lg:`, `xl:`
- Flexbox: `flex`, `flex-col`, `items-center`, `justify-between`
- Grid: `grid`, `grid-cols-2`, `gap-4`
- Spacing: `p-4`, `m-4`, `space-y-4`
- Colors: `bg-blue-500`, `text-gray-900`

### Custom Styles
Global styles are in `src/index.css`

## 📱 Responsive Design

The UI is fully responsive with breakpoints:
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🔄 State Management

### Zustand Store
Simple and lightweight state management:

```typescript
// Example: Auth Store
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (credentials) => { /* ... */ },
  logout: async () => { /* ... */ },
}));
```

## 🚨 Error Handling

API errors are handled in `api.service.ts`:
- Automatic token refresh
- Error logging
- User-friendly error messages

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## 📦 Dependencies

### Production
- `react` & `react-dom` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `zustand` - State management
- `collabtask-core` - Shared types

### Development
- `vite` - Build tool
- `typescript` - Type checking
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting
- `tailwindcss` - CSS framework (implied by usage)

## 🎯 Features

### Dashboard
- Quick stats overview
- Recent projects
- Today's tasks
- Progress overview

### Project Management
- Create, edit, delete projects
- Filter and sort projects
- Project members management
- Project statistics

### Kanban Board
- Drag-and-drop task management
- Multiple columns (Todo, In Progress, Done, etc.)
- Task filtering and sorting
- Quick task creation

### User Management
- View all users
- Invite new users
- Manage teams
- Role assignment

## 🚀 Build Optimization

Vite provides:
- Fast Hot Module Replacement (HMR)
- Optimized production builds
- Code splitting
- Tree shaking
- Asset optimization

## 🤝 Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Follow the existing component structure
4. Use Tailwind CSS for styling
5. Write clean, readable code
6. Test your changes

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📄 License

ISC
