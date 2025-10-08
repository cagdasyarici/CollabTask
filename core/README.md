# CollabTask Core

Shared types and interfaces for CollabTask platform.

## 📦 Overview

The `collabtask-core` package contains shared TypeScript types, interfaces, and enums used by both the backend and frontend applications. This ensures type consistency across the entire platform and prevents schema discrepancies.

## 📁 Structure

```
core/
├── src/
│   ├── types/
│   │   ├── entities.ts  # Entity definitions (User, Project, Task, etc.)
│   │   ├── enums.ts     # Shared enums (UserRole, TaskStatus, etc.)
│   │   └── common.ts    # Common types (ApiResponse, PaginatedResponse, etc.)
│   └── index.ts         # Main export file
├── dist/                # Compiled output
└── package.json
```

## 🔧 Building

```bash
npm run build
```

This will compile TypeScript to JavaScript and generate type declarations in the `dist/` folder.

## 📚 Exported Types

### Entities
- `User` - User entity
- `Project` - Project entity
- `Task` - Task entity
- `Team` - Team entity
- `Notification` - Notification entity
- `Activity` - Activity entity
- `Comment` - Comment entity
- `Attachment` - Attachment entity
- `Permission` - Permission entity
- `ProjectStats` - Project statistics
- `UserStats` - User statistics
- `TimeEntry` - Time tracking entry

### Enums
- `UserRole` - User roles (ADMIN, MANAGER, MEMBER)
- `UserStatus` - User status (ACTIVE, INACTIVE, INVITED)
- `ProjectStatus` - Project status (ACTIVE, COMPLETED, PAUSED, ARCHIVED)
- `TaskStatus` - Task status (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED, BACKLOG)
- `Priority` - Priority levels (LOW, MEDIUM, HIGH, URGENT)

### Common Types
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data response
- `PaginationParams` - Pagination parameters
- `ErrorResponse` - Error response format

## 💡 Usage

### In Backend
```typescript
import { User, UserRole, ApiResponse } from 'collabtask-core';

const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: UserRole.MEMBER,
  // ...
};

const response: ApiResponse<User> = {
  success: true,
  data: user,
  message: 'User fetched successfully'
};
```

### In Frontend
```typescript
import type { Project, ProjectStatus, PaginatedResponse } from 'collabtask-core';

const projects: PaginatedResponse<Project> = {
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5
  }
};
```

## 🔄 Development Workflow

1. Make changes to type definitions
2. Run `npm run build` to compile
3. Changes will be automatically available to backend and frontend

**Note:** After making changes to core types, you may need to restart your backend and frontend development servers.

## ⚡ Watch Mode

For active development, you can run the build in watch mode:

```bash
npm run build -- --watch
```

This will automatically recompile when you make changes to the core package.

## 📦 Package Information

- **Package Name:** `collabtask-core`
- **Version:** 0.1.0
- **Private:** Yes (not published to npm)
- **Type:** Local package (linked via `file:../core`)

## 🎯 Purpose

The core package serves several important purposes:

1. **Type Safety** - Ensures consistent types across frontend and backend
2. **Single Source of Truth** - All entity definitions in one place
3. **Prevents Schema Drift** - Changes to types must be done in core package
4. **Better Refactoring** - TypeScript will catch breaking changes
5. **Code Reusability** - Shared utilities and helper types

## 🚨 Important Notes

- This package is **not published to npm**
- It's linked locally using `file:../core` in both backend and frontend
- Any changes require rebuilding the package
- Both backend and frontend depend on this package

## 📝 Adding New Types

1. Add your type/interface to the appropriate file in `src/types/`
2. Export it from `src/index.ts`
3. Run `npm run build`
4. Import and use in backend/frontend

Example:
```typescript
// src/types/entities.ts
export interface NewEntity {
  id: string;
  name: string;
  createdAt: Date;
}

// src/index.ts
export type { NewEntity } from './types/entities';
```

## 📄 License

ISC

