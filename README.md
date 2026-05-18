# Keys2Balance Training Platform

A full-stack Learning Management System (LMS) built with React, Node.js/Express, and PostgreSQL.

---

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React 19 + Vite 7 + Redux Toolkit            |
| UI         | Tailwind CSS 4 + MUI 7                       |
| Backend    | Node.js + Express 4                          |
| Database   | PostgreSQL 14+                               |
| Auth       | JWT + Passport.js (Local + Google OAuth 2.0) |
| Email      | Nodemailer (SMTP)                            |
| Deployment | Fly.io                                       |
| i18n       | i18next (EN / FI / SV)                       |

---

## Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14
- npm ≥ 8

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd keys2balance-training-platform
```

### 2. Set up the database

```bash
createdb keys2balance

# Schema only
psql -d keys2balance -f backend/database/schema.sql

# Schema + seed data (includes test users)
psql -d keys2balance -f backend/init.sql
```

### 3. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://localhost/keys2balance
SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173

# Optional — email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=yourpassword

# Optional — Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Install dependencies & run

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3001`.

---

## Project Structure

```
keys2balance-training-platform/
├── frontend/
│   ├── src/
│   │   ├── components/       Reusable UI components
│   │   ├── pages/            Route-level pages
│   │   ├── reducers/         Redux slices + thunks
│   │   ├── services/         Axios API modules
│   │   └── store.js          Redux store
│   └── public/locales/       i18n files (en / fi / sv)
│
└── backend/
    ├── controllers/          Route handlers
    ├── models/               Database query functions
    ├── utils/                Middleware, config, passport, email
    └── database/             schema.sql, test_data.sql, init.sql
```

---

## User Roles

| Role            | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| **Admin**       | Full access — manage courses, trainers, participants, access codes  |
| **Trainer**     | Create and manage own courses, lessons, quizzes; grade participants |
| **Participant** | Enroll in courses, take quizzes, join discussions                   |

---

## Building for Production

```bash
# macOS / Linux
cd backend && npm run build:ui:mac

# Windows CMD
cd backend && npm run build:ui:windows-cmd

# WSL
cd backend && npm run build:ui:wsl
```

The React app is built into `backend/dist/` and served statically by Express.

---

## Deployment (Fly.io)

### 1. Install the Fly CLI & log in

```bash
# Install (macOS/Linux)
curl -L https://fly.io/install.sh | sh

# Log in
fly auth login
```

### 2. Build the frontend

```bash
# macOS / Linux
cd backend && npm run build:ui:mac

# Windows CMD
cd backend && npm run build:ui:windows-cmd

# WSL
cd backend && npm run build:ui:wsl
```

This compiles the React app into `backend/dist/` so Express can serve it statically.

### 3. Deploy

```bash
# Deploy only (frontend already built)
cd backend && npm run deploy

# Build frontend + deploy in one step
npm run deploy:full
```

### 4. View production logs

```bash
npm run logs:prod
```

### Production config (`backend/fly.toml`)

| Setting        | Value                       |
| -------------- | --------------------------- |
| App name       | `keys2balance`              |
| Region         | `ams` (Amsterdam)           |
| RAM            | 1 GB                        |
| CPUs           | 1                           |
| Uploads volume | `/app/uploads` (persistent) |

> Make sure all required environment variables are set as Fly secrets before deploying:
>
> ```bash
> fly secrets set SECRET=your_jwt_secret FRONTEND_URL=https://keys2balance.fly.dev ...
> ```

---

## Running Tests

```bash
cd backend
npm test                   # Unit tests
npm run test:integration   # Integration tests (requires TEST_DATABASE_URL)
npm run test:all           # All tests
```

---

## Environment Variables Reference

| Variable               | Required | Description                                        |
| ---------------------- | -------- | -------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string                       |
| `SECRET`               | Yes      | JWT signing secret                                 |
| `FRONTEND_URL`         | Yes      | Frontend base URL (used for OAuth redirect + CORS) |
| `EMAIL_SECRET`         | No       | Email token secret (falls back to `SECRET`)        |
| `SMTP_HOST`            | Email    | SMTP hostname                                      |
| `SMTP_PORT`            | Email    | SMTP port (usually 587)                            |
| `SMTP_SECURE`          | Email    | `"true"` for port 465, `"false"` for 587           |
| `SMTP_USER`            | Email    | Sender address                                     |
| `SMTP_PASS`            | Email    | SMTP password / app password                       |
| `GOOGLE_CLIENT_ID`     | OAuth    | Google OAuth client ID                             |
| `GOOGLE_CLIENT_SECRET` | OAuth    | Google OAuth client secret                         |
| `PORT`                 | No       | API port (default: 3001)                           |
| `VITE_API_BASE_URL`    | Frontend | API base URL (build-time, in `frontend/.env`)      |

