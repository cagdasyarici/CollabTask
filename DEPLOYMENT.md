# 🚀 Deployment Guide / Dağıtım Rehberi

This guide covers deploying CollabTask to production.

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure production `DATABASE_URL`
- [ ] Setup CORS with production frontend URL
- [ ] Enable SSL/HTTPS
- [ ] Setup database backups
- [ ] Configure logging
- [ ] Setup monitoring (optional)
- [ ] Configure rate limiting (optional)

### Frontend
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Build for production: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Configure CDN (optional)
- [ ] Setup analytics (optional)

### Database
- [ ] Create production database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed initial data (if needed)
- [ ] Setup automated backups
- [ ] Configure connection pooling

## 🌐 Deployment Options

### Option 1: Traditional Server (VPS)

#### Backend Deployment

```bash
# On your server
cd backend

# Install dependencies
npm install --production

# Build
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name collabtask-api

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Frontend Deployment

```bash
# Build frontend
cd collabtask-ui
npm run build

# Serve with nginx or apache
# Copy dist/ folder to web server root
```

**Nginx Configuration Example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/collabtask-ui/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Option 2: Docker Deployment

**Dockerfile - Backend:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**Dockerfile - Frontend:**

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: collabtask
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/collabtask
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./collabtask-ui
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Option 3: Cloud Platforms

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd collabtask-ui
vercel --prod
```

**vercel.json:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### Heroku (Backend)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
cd backend
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Railway (Full Stack)

1. Connect your GitHub repository
2. Railway will auto-detect and deploy both services
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure services (Backend + Frontend)
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## 🔐 Environment Variables for Production

### Backend (.env)

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=very_long_random_secret_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# Optional: Redis
REDIS_URL=redis://user:password@host:6379

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### PM2 Logs

```bash
# View logs
pm2 logs collabtask-api

# Monitor
pm2 monit
```

### Application Monitoring (Optional)

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Infrastructure monitoring
- **New Relic** - APM

## 🔄 CI/CD Pipeline

**GitHub Actions Example (.github/workflows/deploy.yml):**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
          cd ../collabtask-ui && npm install
          cd ../core && npm install && npm run build

      - name: Run tests
        run: cd backend && npm test

      - name: Build
        run: |
          cd backend && npm run build
          cd ../collabtask-ui && npm run build

      # Add your deployment steps here
      # - name: Deploy to server
      #   run: ...
```

## 🗄️ Database Backup

### Manual Backup

```bash
# Backup
pg_dump -U postgres collabtask > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U postgres collabtask < backup.sql
```

### Automated Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U postgres collabtask > /backups/collabtask_$(date +\%Y\%m\%d).sql
```

## 🚀 Performance Optimization

### Backend
- Enable gzip compression
- Setup Redis for caching
- Use connection pooling
- Enable query caching
- Setup CDN for static assets

### Frontend
- Enable code splitting
- Lazy load routes
- Optimize images
- Use CDN
- Enable browser caching

### Database
- Add proper indexes
- Optimize queries
- Enable query caching
- Setup read replicas (if needed)

## 📝 Post-Deployment

- [ ] Test all functionality
- [ ] Verify SSL certificate
- [ ] Test API endpoints
- [ ] Check logs for errors
- [ ] Setup monitoring alerts
- [ ] Configure backups
- [ ] Update DNS records
- [ ] Test from different devices
- [ ] Verify CORS settings
- [ ] Test authentication flow

## 🆘 Troubleshooting

### Backend Not Starting
- Check logs: `pm2 logs collabtask-api`
- Verify environment variables
- Check database connection
- Ensure migrations are up to date

### Frontend 404 Errors
- Configure web server for SPA routing
- Check build output
- Verify API URL

### Database Connection Issues
- Verify DATABASE_URL
- Check firewall rules
- Ensure database is running
- Test connection manually

---

For more help, consult the [documentation](./README.md) or open an issue on GitHub.

