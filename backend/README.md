# CollabTask Backend API

Backend API for CollabTask - Project Management & Collaboration Platform

## 🚀 Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

## 📁 Project Structure

```
backend/
├── src/
│   ├── features/           # Feature modules (domain-driven design)
│   │   ├── auth/          # Authentication & authorization
│   │   ├── users/         # User management
│   │   ├── projects/      # Project management
│   │   ├── tasks/         # Task management
│   │   ├── teams/         # Team management
│   │   ├── notifications/ # Notification system
│   │   ├── activities/    # Activity tracking
│   │   ├── files/         # File management
│   │   ├── search/        # Search functionality
│   │   └── admin/         # Admin panel
│   ├── core/              # Core utilities & base classes
│   │   ├── base/          # Base controllers
│   │   ├── errors/        # Error handlers
│   │   ├── interfaces/    # Common interfaces
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Core services (JWT, etc.)
│   ├── infrastructure/    # Infrastructure layer
│   │   ├── database/      # Database configuration
│   │   ├── redis/         # Redis configuration
│   │   └── kafka/         # Kafka configuration
│   ├── app.ts             # Express app setup
│   └── main.ts            # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── dist/                  # Compiled TypeScript output
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
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/collabtask"
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

3. Run database migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## 🏃 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 API Documentation

Once running, access Swagger documentation at:
```
http://localhost:5000/api-docs
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

### Endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Using Protected Endpoints:

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npx prisma studio
```

## 🏗️ Architecture

This backend follows **Clean Architecture** principles with a **feature-based** structure:

### Layers:
1. **API Layer** (`features/*/api/`) - Controllers and routes
2. **Domain Layer** (`features/*/domain/`) - Business logic, entities, repositories
3. **Use Cases** (`features/*/use-cases/`) - Application business rules
4. **Infrastructure** (`infrastructure/`) - External services, database

### Key Principles:
- Dependency Injection
- Repository Pattern
- SOLID Principles
- Domain-Driven Design (DDD)

## 🔌 Key Features

### User Management
- User CRUD operations
- Role-based access control (Admin, Manager, Member)
- User statistics and analytics
- User invitations

### Project Management
- Project CRUD operations
- Project members management
- Project statistics
- Tags and categories

### Task Management
- Task CRUD operations
- Task assignments
- Comments and attachments
- Priority and status management
- Dependencies

### Team Management
- Team CRUD operations
- Team member management
- Team roles

### Notifications
- Real-time notifications
- Notification preferences
- Mark as read functionality

### Activity Tracking
- Activity feed
- Analytics dashboard
- Time tracking

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `REDIS_URL` | Redis connection URL (optional) | - |
| `KAFKA_BROKERS` | Kafka brokers (optional) | - |

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run clean` | Clean build directory |

## 🚨 Error Handling

The API uses custom error classes:
- `AppError` - Base error class
- `NotFoundError` - 404 errors
- `UnauthorizedError` - 401 errors
- `ForbiddenError` - 403 errors
- `ValidationError` - 400 errors

## 📦 Dependencies

### Production
- `express` - Web framework
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `swagger-jsdoc` & `swagger-ui-express` - API documentation

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server
- `jest` - Testing framework
- `prisma` - Prisma CLI

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update API documentation (Swagger comments)
4. Follow the existing code structure
5. Use meaningful commit messages

## 📄 License

ISC
