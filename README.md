# 🐬 RUDRA App Service — Freshwater Species Reporting/Sighting System

This is the backend service that powers the mobile app used by volunteers to report or record sightings of freshwater species.

---

## 📦 Tech Stack

- **Node.js**
- **Express.js + TypeScript**
- **PostgreSQL**
- **Supabase (Storage)**
- **Redis (Caching)**
- **Twilio (SMS Verification)**
- **Docker** & **Vercel** (Deployment)

---

## 📂 Project Structure

```bash
.
├── src/
│   ├── alias.ts
│   ├── index.ts
│   ├── config/
│   │   ├── config.ts
│   │   ├── db.ts
│   │   └── redis.ts
│   ├── constants/
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── auth/
│   │   ├── module/
│   │   ├── notifications/
│   │   ├── question/
│   │   ├── region/
│   │   ├── reporting/
│   │   ├── resource/
│   │   ├── sighting/
│   │   ├── species/
│   │   ├── submission/
│   │   ├── tier/
│   │   └── user/
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   └── error-handler.ts
│   ├── routes/
│   │   ├── auth/
│   │   ├── module/
│   │   ├── notifications/
│   │   ├── questions/
│   │   ├── region/
│   │   ├── reporting/
│   │   ├── resource/
│   │   ├── sighting/
│   │   ├── species/
│   │   ├── submission/
│   │   ├── tier/
│   │   └── user/
│   │   └── index.ts
│   └── utils/
│       ├── file-upload.ts
│       ├── rate-limit.ts
│       ├── static-lookup.ts
│       ├── strings.ts
│       └── twilio.ts
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── nodemon.json
├── package.json
├── README.md
├── tsconfig.json
├── vercel.json
└── .github/
    └── workflows/
        └── docker-image.yml
```

---

## 🚀 Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Configure environment:**
   - Add `.env` and fill in required values (DB, Redis, Twilio, Supabase, etc).

3. **Run in development:**

   ```sh
   npm run dev
   ```

4. **Build for production:**

   ```sh
   npm run build
   ```

5. **Start production server:**
   ```sh
   npm run start:dist
   ```

---

## 🐳 Docker

- Build and run with Docker Compose:
  ```sh
  docker-compose up --build
  ```

---

## 🛡️ Lint & Format

- Lint code:
  ```sh
  npm run lint
  ```
- Type check:
  ```sh
  npm run typecheck
  ```

---

## 📖 API Overview

- All endpoints are prefixed with `/api/v1`
- Authentication required for most routes (JWT Bearer token)
- Key modules:
  - Auth (OTP via Twilio)
  - Sighting & Reporting (CRUD)
  - Species, Region, Tier, Module, Notifications
  - File uploads (Supabase Storage)

### 📚 API Documentation (Swagger)

- **Swagger UI**: `http://localhost:8080/api-docs`

---
