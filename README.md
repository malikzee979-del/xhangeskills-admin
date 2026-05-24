# Backend - XchangeSkills Strapi API

A Strapi CMS-based backend API for the XchangeSkills platform. Provides REST API endpoints for managing skills, users, categories, service requests, and more.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Docker & Docker Compose** (recommended)
- **PostgreSQL 15** (if running locally without Docker)

### Option 1: Docker (Recommended)

```bash
# Start both PostgreSQL and Strapi
docker compose up --build -d

# Wait 30-60 seconds for Strapi to fully initialize
```

Access at: **http://localhost:1337/api**

### Option 2: Local Development

```bash
# Update .env for local development
# DATABASE_HOST=localhost

npm install
npm run dev
```

---

## 📊 Database Seeding

### 1. Create Admin User (Required First)

```bash
docker compose exec -T backend npm run seed:admin
```

**Created Admin:**
- Username: `admin`
- Email: `admin@xchangeskills.io`
- Password: `Admin@123`

### 2. Seed Realistic Test Data

```bash
docker compose exec -T backend npm run seed:data
```

**Creates:**
- 8 users with profiles
- 5 skill categories
- 10 skills with descriptions and pricing
- 8 service requests
- 10 reviews
- 5 chats with messages
- 4 reports

---

## 📋 API Endpoints

### Protected Endpoints (JWT Required)

Include Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

#### Login
```
POST /api/auth/local
{
  "identifier": "admin",
  "password": "Admin@123"
}
```

#### Categories
```
GET /api/categories
GET /api/categories/:id
```

#### Base Skills
```
GET /api/base-skills
GET /api/base-skills/:id
```

#### Skills
```
GET /api/skills
GET /api/skills?filters[status][$eq]=pending   (pending only)
```

#### Reports
```
GET /api/reports
GET /api/reports/:id
```

#### Service Requests
```
GET /api/service-requests
GET /api/service-requests/:id
```

---

## 🐳 Docker Commands

### Build and Start
```bash
docker compose up --build -d
```

### View Logs
```bash
docker compose logs -f backend
```

### Stop Containers
```bash
docker compose down
```

### Reset Database (⚠️ Deletes All Data)
```bash
docker compose down -v
docker compose up --build -d
```

### Execute Commands in Container
```bash
docker compose exec -T backend npm run seed:admin
docker compose exec -T backend npm run seed:data
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=db                    # Use 'db' for Docker, 'localhost' for local
DATABASE_PORT=5432
DATABASE_NAME=xchangeskills
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Security Keys
APP_KEYS=replace_me_with_secure_value
API_TOKEN_SALT=replace_me
ADMIN_JWT_SECRET=replace_admin_jwt
JWT_SECRET=replace_jwt_secret

# URLs
STRAPI_URL=http://localhost:1337
FRONTEND_URL=http://localhost:3000
```

---

## 🔧 npm Scripts

```bash
npm run dev           # Start Strapi in development mode
npm run build         # Build Strapi for production
npm start            # Start production server
npm run seed:admin   # Create admin user
npm run seed:data    # Seed realistic test data
```

---

## 🧪 Testing Endpoints

### 1. Check API Health
```bash
curl http://localhost:1337/api/categories
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin",
    "password": "Admin@123"
  }'
```

### 3. Use JWT Token
```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:1337/api/categories \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## 🚨 Common Issues & Fixes

### Database connection failed
```bash
# Check database is running
docker compose ps db

# Reset database
docker compose down -v
docker compose up -d
```

### Seed script fails
```bash
# Admin user must exist first
docker compose exec -T backend npm run seed:admin

# Then seed data
docker compose exec -T backend npm run seed:data
```

### Port 1337 already in use
```bash
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 1337 | Stop-Process -Force
```

---

## 📚 Learn more

- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
