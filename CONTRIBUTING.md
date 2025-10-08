# Contributing to CollabTask

Thank you for your interest in contributing to CollabTask! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/CHADOWA-S-CollabTask.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Guidelines

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Properly type all functions, parameters, and return values
- Avoid using `any` type
- Use interfaces for object types
- Use enums for constant values

#### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing

#### Naming Conventions
- **Files:** PascalCase for components (`UserProfile.tsx`), camelCase for utilities (`api.service.ts`)
- **Components:** PascalCase (`UserProfile`)
- **Functions:** camelCase (`getUserData`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces:** PascalCase with 'I' prefix optional (`User` or `IUser`)

### Project Structure

#### Backend
- Feature modules in `backend/src/features/`
- Each feature has: `api/`, `domain/`, `use-cases/`
- Shared code in `backend/src/core/`
- Infrastructure in `backend/src/infrastructure/`

#### Frontend
- Reusable components in `collabtask-ui/src/components/`
- Pages in `collabtask-ui/src/pages/`
- Services in `collabtask-ui/src/services/`
- State management in `collabtask-ui/src/store/`

#### Core Package
- Shared types in `core/src/types/`
- Always rebuild after changes: `npm run build`

### Git Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(tasks): add task priority filter
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

### Testing

#### Backend Tests
```bash
cd backend
npm test
```

- Write unit tests for business logic
- Write integration tests for API endpoints
- Aim for >80% code coverage
- Use meaningful test descriptions

#### Frontend Tests
- Test user interactions
- Test component rendering
- Test API service calls
- Mock external dependencies

### Pull Request Process

1. **Update Documentation:** Update README if you change functionality
2. **Add Tests:** Include tests for new features
3. **Update CHANGELOG:** Add entry describing your changes
4. **Code Review:** Wait for maintainers to review
5. **Address Feedback:** Make requested changes
6. **Squash Commits:** Clean up commit history if requested

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 96]
- Node.js version: [e.g. 20.0.0]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Alternative solutions you've considered

**Additional context**
Any other context or screenshots
```

## 📚 Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🔐 Security

If you discover a security vulnerability, please email [security@yourcompany.com] instead of using the issue tracker.

## 📝 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## ❓ Questions?

Feel free to open an issue with the `question` label or contact the maintainers.

---

Thank you for contributing to CollabTask! 🎉

