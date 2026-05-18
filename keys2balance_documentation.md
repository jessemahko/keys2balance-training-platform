# KEYS2BALANCE Training Platform

## Full Technical Documentation

_Version 1.0 · May 2026_

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [Backend REST API](#4-backend-rest-api)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Key Components Reference](#6-key-components-reference)
7. [Frontend Services Layer](#7-frontend-services-layer)
8. [Setup & Deployment](#8-setup--deployment)
9. [Backend Middleware](#9-backend-middleware)
10. [Notification System](#10-notification-system)
11. [Security Considerations](#11-security-considerations)
12. [Coding Conventions](#12-coding-conventions)
13. [Content Block Reference](#13-content-block-reference)
14. [Common Issues & Troubleshooting](#14-common-issues--troubleshooting)
15. [Quick Reference](#15-quick-reference)

---

## 1. Project Overview

Keys2Balance Training Platform is a full-stack Learning Management System (LMS) designed for the Keys2Balance organization. It supports three user roles—Admin, Trainer, and Participant—and provides tools for course creation, lesson delivery, quiz authoring, discussion forums, and progress tracking.

### 1.1 Technology Stack

| Layer        | Technology                  | Notes                                           |
| ------------ | --------------------------- | ----------------------------------------------- |
| Frontend     | React 19 + Vite 7           | SPA with React Router v7                        |
| UI Styling   | Tailwind CSS 4 + MUI 7      | Custom theme: purple / teal / gold              |
| State Mgmt   | Redux Toolkit + React-Redux | Slices: user, course, discussion, notifications |
| Backend      | Node.js + Express 4         | REST API, express-async-errors                  |
| Database     | PostgreSQL 14+              | pg driver, connection pooling                   |
| Auth         | JWT + Passport.js           | Local + Google OAuth 2.0                        |
| File Storage | Multer (local disk)         | Avatar uploads, file attachments                |
| Email        | Nodemailer                  | SMTP-based email delivery                       |
| Deployment   | Fly.io                      | Docker container, Amsterdam region              |
| i18n         | i18next + react-i18next     | EN, FI, SV translations                         |

### 1.2 Key Features

- Role-based access control: Admin · Trainer · Participant
- Course and lesson management with dynamic JSONB content blocks
- Quiz system: single choice, multiple choice, open text, and survey question types
- Real-time discussion threads per course
- Notification system (15 notification types)
- Google OAuth 2.0 single sign-on
- Multilingual UI: English, Finnish, Swedish
- White-label branding via `platform_settings` table
- Responsive design — mobile, tablet, and desktop

### 1.3 User Roles

| Role        | Capabilities                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Admin       | Full system access — manage all courses, trainers, participants, access codes; view all data       |
| Trainer     | Create & manage own courses, lessons, quizzes; enroll/remove participants; grade open-text answers |
| Participant | View enrolled courses, take quizzes, join discussions, view own grades and notifications           |

---

## 2. Architecture

### 2.1 High-Level Architecture

The platform follows a monorepo structure with a React SPA frontend and an Express REST API backend. In production, Vite builds the frontend into the backend's `dist/` folder and Express serves it statically.

| Component    | Path               | Description                                        |
| ------------ | ------------------ | -------------------------------------------------- |
| Frontend SPA | `frontend/`        | React application — built output served by backend |
| Backend API  | `backend/`         | Express REST API + static file server              |
| Database     | PostgreSQL         | Managed via Fly.io or self-hosted                  |
| File Storage | `backend/uploads/` | Persistent volume on Fly.io                        |

### 2.2 Request Flow

- Browser → React Router → Component → Redux Thunk → Axios → Express Router
- Express → Middleware (tokenExtractor → userExtractor → authorizeRoles) → Controller → Model → PostgreSQL
- Response flows back through the same chain

### 2.3 Authentication Flow

#### Local (username / password)

- `POST /login` — validates credentials, returns JWT (3-day expiry)
- Token stored in `localStorage` as `loggedUser`
- `tokenExtractor` middleware reads Bearer token from Authorization header
- `userExtractor` decodes token and attaches `req.user`

#### Google OAuth 2.0

- `GET /auth/google` — redirects to Google consent screen
- `GET /auth/google/callback` — Passport exchanges code for profile
- New users created automatically; avatar downloaded and stored locally
- JWT issued and user redirected to `/auth-success?token=…`

### 2.4 Directory Structure

```
keys2balance-training-platform/
├── frontend/               React SPA
│   ├── src/
│   │   ├── components/     Reusable UI components
│   │   ├── pages/          Route-level pages
│   │   ├── reducers/       Redux slices + thunks
│   │   ├── services/       Axios API call modules
│   │   └── store.js        Redux store configuration
│   └── public/locales/     i18n translation files (en/fi/sv)
│
└── backend/               Express API
    ├── controllers/       Route handlers (organized by domain)
    ├── models/            Database query functions
    ├── utils/             config, middleware, passport, sendEmail
    └── database/          schema.sql, test_data.sql, init.sql
```

---

## 3. Database Schema

PostgreSQL with `pgcrypto` extension. All primary keys are UUIDs (`gen_random_uuid()`). JSONB columns provide schema-less flexibility for content and quiz data.

### 3.1 Tables Overview

| Table                  | Purpose                       | Key Columns                                                                      |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `users`                | All user accounts             | `user_id` (PK), `username`, `email`, `password_hash`, `role`, `is_verified`      |
| `courses`              | Top-level training containers | `course_id` (PK), `title`, `teacher_id` (FK → users)                             |
| `lessons`              | Pages within a course         | `lesson_id` (PK), `course_id` (FK), `content_data` (JSONB), `order_index`        |
| `assessments`          | Quiz definitions              | `assessment_id` (PK), `lesson_id` (FK), `assessment_json` (JSONB)                |
| `assessment_responses` | Student quiz submissions      | `response_id` (PK), `assessment_id` (FK), `user_id` (FK), `answers_json` (JSONB) |
| `discussion_threads`   | Forum topic headers           | `thread_id` (PK), `course_id` (FK), `title`                                      |
| `discussion_messages`  | Forum messages                | `message_id` (PK), `thread_id` (FK), `user_id` (FK), `message_text`              |
| `notifications`        | System alerts                 | `notification_id` (PK), `user_id` (FK), `type` (enum), `is_read`                 |
| `course_enrollments`   | User ↔ course enrolment       | `user_id` + `course_id` (composite PK), `enrolled_at`                            |

### 3.2 JSONB Schemas

#### `lessons.content_data` — array of block objects

```json
[
  {
    "block_id": "uuid",
    "type": "text|zoom_card|file_attachment|recording_link",
    "data": { "...type-specific fields..." },
    "created_at": "ISO8601"
  }
]
```

#### `assessments.assessment_json`

```json
{
	"description": "optional intro text",
	"questions": [
		{
			"id": 1,
			"type": "single_choice|multiple_choice|open_text|survey",
			"question": "text",
			"options": ["A", "B", "C"],
			"correct": "A",
			"max_points": 1,
			"category": "Leadership"
		}
	]
}
```

#### `assessment_responses.answers_json`

```json
{
	"answers": { "1": "A", "2": ["B", "C"] },
	"score": 2,
	"max_score": 3,
	"total_score": 3,
	"manual_scores": { "3": 1 },
	"grading_status": "complete|pending"
}
```

### 3.3 Notification Types

The `notifications.type` column is constrained to these values:

- `course_assigned`, `course_enrolled`, `course_removed`, `course_deleted`
- `new_lesson_available`, `new_quiz_available`, `quiz_updated`, `quiz_deleted`
- `thread_created`, `quiz_submitted`, `quiz_graded`
- `participant_assigned`, `trainer_assigned`, `reminder`

### 3.4 Cascade Rules

| Parent deleted | Child action                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `courses`      | CASCADE → lessons, course_enrollments, assessments, discussion_threads, access_codes, notifications                                     |
| `lessons`      | CASCADE → assessments, progress                                                                                                         |
| `assessments`  | CASCADE → assessment_responses                                                                                                          |
| `users`        | CASCADE → progress, course_enrollments, assessment_responses, notifications; SET NULL → courses.teacher_id, discussion_messages.user_id |

---

## 4. Backend REST API

### 4.1 Base URL & Auth

All API endpoints are prefixed with `/api/`. Authentication uses JWT Bearer tokens:

```
Authorization: Bearer <token>
```

Unauthenticated requests return `401`. Insufficient role returns `403`.

### 4.2 Authentication Endpoints

| Method | Path                      | Auth  | Description                                              |
| ------ | ------------------------- | ----- | -------------------------------------------------------- |
| POST   | `/login`                  | None  | Login with username/email + password → JWT + user object |
| POST   | `/register`               | None  | Register new participant account                         |
| POST   | `/reset-password`         | None  | Request password reset email                             |
| POST   | `/reset-password/confirm` | None  | Confirm new password with reset token                    |
| GET    | `/auth/google`            | None  | Initiate Google OAuth flow                               |
| GET    | `/auth/google/callback`   | None  | Google OAuth callback → JWT redirect                     |
| GET    | `/verify-email/me?token=` | Token | Verify email address from link                           |
| POST   | `/verify-email`           | JWT   | Request new verification email                           |

### 4.3 Courses Endpoints

| Method | Path                              | Roles          | Description                                                             |
| ------ | --------------------------------- | -------------- | ----------------------------------------------------------------------- |
| GET    | `/api/courses`                    | All            | Admin: all courses; Trainer: own courses; Participant: enrolled courses |
| POST   | `/api/courses`                    | Admin, Trainer | Create new course                                                       |
| GET    | `/api/courses/:id`                | All            | Course detail with lessons, participants, teacher                       |
| PUT    | `/api/courses/:id`                | Admin, Trainer | Update course title / description / teacher                             |
| DELETE | `/api/courses/:id`                | Admin, Trainer | Delete course (cascades)                                                |
| POST   | `/api/courses/:id/enroll`         | Admin, Trainer | Enroll a user by `userId`                                               |
| DELETE | `/api/courses/:id/enroll/:userId` | Admin, Trainer | Remove enrollment                                                       |

### 4.4 Lessons Endpoints

| Method | Path                               | Roles          | Description                                    |
| ------ | ---------------------------------- | -------------- | ---------------------------------------------- |
| GET    | `/api/lessons/:id`                 | All (enrolled) | Get lesson with content blocks                 |
| POST   | `/api/lessons`                     | Admin, Trainer | Create lesson (`course_id` + `title` required) |
| PATCH  | `/api/lessons/:id`                 | Admin, Trainer | Update lesson title / order_index              |
| PATCH  | `/api/lessons/:id/add-block`       | Admin, Trainer | Append content block to lesson                 |
| PATCH  | `/api/lessons/:id/blocks/:blockId` | Admin, Trainer | Update specific block data                     |
| DELETE | `/api/lessons/:id/blocks/:blockId` | Admin, Trainer | Remove specific block                          |
| DELETE | `/api/lessons/:id`                 | Admin, Trainer | Delete entire lesson                           |

### 4.5 Assessments Endpoints

| Method | Path                                               | Roles          | Description                                       |
| ------ | -------------------------------------------------- | -------------- | ------------------------------------------------- |
| GET    | `/api/assessments?lessonId=`                       | All (enrolled) | List assessments for a lesson                     |
| GET    | `/api/assessments/:id`                             | All (enrolled) | Single assessment; participant gets `my_response` |
| POST   | `/api/assessments`                                 | Admin, Trainer | Create quiz (lessonId, title, assessmentJson)     |
| PUT    | `/api/assessments/:id`                             | Admin, Trainer | Update quiz title / questions                     |
| DELETE | `/api/assessments/:id`                             | Admin, Trainer | Delete quiz                                       |
| POST   | `/api/assessments/:id/submit`                      | Participant    | Submit answers → returns score                    |
| GET    | `/api/assessments/:id/results`                     | Admin, Trainer | All student responses + scores                    |
| GET    | `/api/assessments/:id/my-result`                   | Participant    | Own submission result                             |
| PATCH  | `/api/assessments/:id/responses/:responseId/grade` | Admin, Trainer | Grade an open-text question                       |

### 4.6 Other Endpoints

| Resource      | Base Path            | Notes                                                                         |
| ------------- | -------------------- | ----------------------------------------------------------------------------- |
| Discussions   | `/api/discussions`   | GET threads?courseId=, POST threads, POST messages /:threadId                 |
| Notifications | `/api/notifications` | GET all, PUT /:id (mark read), DELETE /:id                                    |
| Profile       | `/api/profile`       | GET me, PUT profile, PUT password, POST upload-avatar                         |
| Users (Admin) | `/api/users`         | GET all, POST create trainer, PUT /:id (password), PUT /:id/role, DELETE /:id |
| Access Codes  | `/api/access-codes`  | GET all, POST create, DELETE /:id (Admin only)                                |

### 4.7 Scoring Logic

The `calculateScore` function in `backend/controllers/assessment/scoring.js` handles automatic grading:

- **single_choice** — 1 point if `answer === correct`
- **multiple_choice** — 1 point only if sorted selection exactly matches sorted correct array
- **open_text** — 0 auto-score; trainer grades manually (`max_points` configurable per question)
- **survey** — auto-awarded 1 point (completion credit; no correct answer concept)

---

## 5. Frontend Architecture

### 5.1 React Router Structure

| Route                                                       | Component            | Access                                       |
| ----------------------------------------------------------- | -------------------- | -------------------------------------------- |
| `/authentication`                                           | Authentication       | Public (redirects to dashboard if logged in) |
| `/auth-success`                                             | AuthSuccess          | Public (Google OAuth callback handler)       |
| `/reset-password`                                           | ResetPasswordRequest | Public                                       |
| `/reset-password/confirm`                                   | ResetPasswordConfirm | Public                                       |
| `/verify-email`                                             | EmailVerify          | Public                                       |
| `/dashboard`                                                | DashboardHome        | Protected                                    |
| `/courses/new`                                              | CourseForm           | Admin, Trainer                               |
| `/courses/:id`                                              | CourseLabel          | Enrolled / Owner / Admin                     |
| `/courses/:id/edit`                                         | CourseForm           | Owner / Admin                                |
| `/courses/:id/lessons/:lessonId`                            | LessonPage           | Enrolled                                     |
| `/courses/:id/lessons/:lessonId/quiz/new`                   | QuizEditor           | Trainer / Admin                              |
| `/courses/:id/lessons/:lessonId/quiz/:assessmentId`         | QuizTake             | Participant                                  |
| `/courses/:id/lessons/:lessonId/quiz/:assessmentId/results` | QuizResults          | Trainer / Admin                              |
| `/courses/:id/discussion`                                   | DiscussionPage       | Enrolled                                     |
| `/announcements`                                            | AnnouncementPage     | All                                          |
| `/profile`                                                  | ProfilePage          | All                                          |
| `/profile/:userId`                                          | OtherProfile         | All                                          |
| `/manage-trainers`                                          | ManageTrainers       | Admin only                                   |

### 5.2 Redux Store

| Slice           | State Shape                                           | Key Actions                                              |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `user`          | `User object \| null`                                 | `setUser`, `removeUser`, `editUser`; thunks: `setUserFn` |
|                 |                                                       | , `rmUserFn`, `updateAvatar`, `updateProfileFn`          |
| `course`        | `{ items[], isLoading, error }`                       | `setCourses`, `appendCourse`, `updateCourseAction`,      |
|                 |                                                       | , `addParticipantAction`, `removeParticipantAction`      |
|                 |                                                       | ,`removeCourseAction`                                    |
| `discussion`    | `{ threads[], activeThreadId, isLoading, isSending }` | `setThreads`, `setActiveThread`, `setSending`            |
|                 |                                                       |                                                          |
| `notifications` | `Notification[]`                                      | `setAnnouncement`, `markAsReadNotification`,             |
|                 |                                                       | , `deleteAnnouncement`; polled every 10s                 |
| `users`         | `User[]`                                              | `setUsers`, `updateUser`;                                |
|                 |                                                       | used by Admin/Trainer for participant Management         |
| `noti`          | `{ noti: "", error: "" }`                             | `setNoti`, `setErrorMessage`; auto-clear timeouts        |

### 5.3 Content Block System

Lessons store an ordered array of blocks in the JSONB `content_data` column. Each block has a `type` and a `data` object:

| Block Type        | Key Data Fields                                      | Rendered Component                          |
| ----------------- | ---------------------------------------------------- | ------------------------------------------- |
| `text`            | `delta` (Quill Delta JSON), legacy: `content` (HTML) | `QuillDeltaRenderer` → semantic HTML        |
| `zoom_card`       | `title`, `date`, `time`, `join_link`                 | `ZoomBlock` — card with Join Meeting button |
| `file_attachment` | `title`, `files[]` (name, size, url base64)          | `FileBlock` — download list                 |
| `recording_link`  | `title`, `url`, `description`                        | `LinkEmbedBlock` — external link card       |

Trainers/admins see Edit and Delete buttons on hover. A "+" button below each block allows inserting a new block at that position. `BlockEditorModal` handles both create and edit workflows using a single form.

### 5.4 Quiz System (Frontend)

#### QuizEditor — for Trainers/Admins

- Create/edit quiz title, optional description, and N questions
- Question types: `single_choice`, `multiple_choice`, `open_text`, `survey`
- Correct answers set via radio (single) or checkbox (multiple)
- Open-text questions define `max_points` (manual grading by trainer)
- Survey questions require a `category` string (used for results aggregation)

#### QuizTake — for Participants

- Loads assessment; if already submitted, renders read-only view with score
- Single choice → radio buttons; Multiple / Survey → checkboxes; Open text → textarea
- On submit: calls `POST /api/assessments/:id/submit`
- Survey results displayed as a sortable category score table

#### QuizResults — for Trainers/Admins

- Shows summary statistics (submissions count, average score, question count)
- Submissions table with expand rows for open-text manual grading
- Survey section shows a participant × category score matrix with column sort

### 5.5 i18n

Translation files in `frontend/public/locales/{en,fi,sv}/translation.json`. Language is persisted in `localStorage`. `i18next-browser-languagedetector` auto-detects on first load.

- `en` — English (default fallback)
- `fi` — Finnish
- `sv` — Swedish

All user-facing strings must use the `t()` hook. Backend error messages are translated on the frontend via `t(errorMessage)` since error strings are English keys.

---

## 6. Key Components Reference

| Component              | Path                                              | Description                                                                                                                                   |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sidebar`              | `components/Sidebar/Sidebar.jsx`                  | Navigation — shows main menu or course-context menu (lessons list). Language switcher. Collapsible.                                           |
| `BlockContainer`       | `components/BlockEditor/BlockContainer.jsx`       | Wrapper for each lesson content block; shows Edit/Delete/AddBelow controls on hover for editors.                                              |
| `BlockEditorModal`     | `components/BlockEditor/BlockEditorModal.jsx`     | Full-screen modal for creating/editing any block type with type-specific form fields.                                                         |
| `QuillDeltaRenderer`   | `components/ContentBlocks/QuillDeltaRenderer.jsx` | Safe Delta → React rendering. No `dangerouslySetInnerHTML`. Supports bold, italic, underline, strike, links, ordered/unordered lists, h1, h2. |
| `ProfileHeader`        | `components/profile/ProfileHeader.jsx`            | Avatar with crop-upload dialog (react-avatar-edit), name, email, role badge, unverified warnings.                                             |
| `NotificationListener` | `components/NotificationListener.jsx`             | Invisible component mounted in Dashboard; polls `/api/notifications` every 10 seconds.                                                        |
| `ProtectedRoute`       | `components/ProtectedRoute.jsx`                   | Redirects unauthenticated users; prompts to complete profile if fields missing.                                                               |
| `AnnoucementNavLink`   | `components/Sidebar/AnnoucementNavLink.jsx`       | NavLink with unread notification dot indicator.                                                                                               |

---

## 7. Frontend Services Layer

All API communication is centralized in `frontend/src/services/`. Each module exports functions that return the response data directly.

| Module          | File                           | Functions                                                                                                                   |
| --------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Auth — Login    | `authen/login.js`              | `login(credentials)`, `setToken(token)`, `getToken()`, `isTokenExpired(token)`, `getStoredUser()`                           |
| Auth — Register | `authen/register.js`           | `register(credentials)`                                                                                                     |
| Auth — Reset    | `authen/resetPassword.js`      | `requestResetPassword(email)`, `confirmResetPassword({token, newPassword})`                                                 |
| Courses         | `courses.js`                   | `getAllCourses`, `getCourseById`, `createCourse`, `updateCourse`, `enrollParticipant`, `removeParticipant`, `deleteCourse`  |
| Lessons         | `lessons.js`                   | `getLessonById`, `createLesson`, `updateLesson`, `deleteLesson`, `addBlock`, `updateBlock`, `deleteBlock`                   |
| Assessments     | `assessments.js`               | `getByLesson`, `getById`, `create`, `update`, `remove`, `submit`, `getResults`, `getMyResult`, `gradeQuestion`              |
| Discussion      | `discussion.js`                | `getThreads(courseId)`, `createThread`, `createMessage`                                                                     |
| Profile         | `profile.js`                   | `getMe`, `updateProfile`, `changePassword`, `updateAvatar`, `requestEmailVerification`, `VerifyEmail`, `getProfile(userId)` |
| Users           | `users.js`                     | `getAllUsers`, `updateUserRole(userId, role)`                                                                               |
| Notifications   | `announcement/announcement.js` | `getAllNotifications`, `markAsRead(id)`, `deleteNotification(id)`                                                           |

All services use the `buildApiUrl()` helper from `apiConfig.js` which reads `VITE_API_BASE_URL` at build time and defaults to `http://localhost:3001`.

---

## 8. Setup & Deployment

### 8.1 Local Development Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14
- npm ≥ 8

### 8.2 Environment Variables (`backend/.env`)

| Variable               | Required | Description                                                    |
| ---------------------- | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string for production                    |
| `TEST_DATABASE_URL`    | Dev      | Separate test database connection string                       |
| `SECRET`               | Yes      | JWT signing secret                                             |
| `EMAIL_SECRET`         | No       | Separate secret for email tokens (falls back to SECRET)        |
| `FRONTEND_URL`         | Yes      | Base URL of the frontend (e.g. `https://keys2balance.fly.dev`) |
| `SMTP_HOST`            | Email    | SMTP server hostname                                           |
| `SMTP_PORT`            | Email    | SMTP port (587 for TLS)                                        |
| `SMTP_SECURE`          | Email    | `"true"` for port 465, `"false"` for 587                       |
| `SMTP_USER`            | Email    | Sender email address                                           |
| `SMTP_PASS`            | Email    | SMTP password or app-specific password                         |
| `GOOGLE_CLIENT_ID`     | OAuth    | Google OAuth 2.0 client ID                                     |
| `GOOGLE_CLIENT_SECRET` | OAuth    | Google OAuth 2.0 client secret                                 |
| `PORT`                 | No       | API port (default 3001)                                        |

### 8.3 Database Setup

```bash
# Create database
createdb keys2balance

# Apply schema
psql -d keys2balance -f backend/database/schema.sql

```

### 8.4 Running Locally

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend proxies `/api`, `/login`, etc. to `http://localhost:3001` via Vite proxy config.

### 8.5 Building for Production

```bash
# macOS / Linux
cd backend && npm run build:ui:mac

# Windows CMD
cd backend && npm run build:ui:windows-cmd

# WSL
cd backend && npm run build:ui:wsl
```

This builds the frontend into `backend/dist/` and the Express server serves it.

### 8.6 Fly.io Deployment

```bash
fly deploy
```

Configuration in `backend/fly.toml`: Amsterdam region, 1 GB RAM, persistent uploads volume, auto-start machines.

### 8.7 Running Tests

```bash
cd backend
npm test                  # Unit tests (excludes integration/)
npm run test:integration  # Integration tests (requires TEST_DATABASE_URL)
npm run test:all          # All tests
```

---

## 9. Backend Middleware

| Middleware                 | File                  | Description                                                                                   |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| `tokenExtractor`           | `utils/middleware.js` | Reads Authorization header, strips `"Bearer "`, sets `req.token`                              |
| `userExtractor`            | `utils/middleware.js` | Verifies JWT via `process.env.SECRET`; sets `req.user` = decoded payload or null              |
| `authorizeRoles(...roles)` | `utils/middleware.js` | Returns 401 if no user, 403 if `user.role` not in allowed list                                |
| `errorHandler`             | `utils/middleware.js` | Maps pg error codes (22P02 → 400 malformatted id; 23505 → 400 duplicate) and JWT errors (401) |
| `unknownEndpoint`          | `utils/middleware.js` | 404 for unmatched routes                                                                      |
| `express-async-errors`     | `app.js` import       | Patches Express router so async exceptions propagate to `errorHandler` automatically          |

### 9.1 Route-Level Authorization Examples

```javascript
// Access codes — Admin only
app.use(
	'/api/access-codes',
	userExtractor,
	authorizeRoles('admin'),
	accessCodeRouter,
)

// Courses — all authenticated roles
app.use(
	'/api/courses',
	userExtractor,
	authorizeRoles('admin', 'trainer', 'participant'),
	coursesRouter,
)

// Inside coursesRouter — further restriction
router.post(
	'/',
	authorizeRoles('admin', 'trainer'),
	CoursesController.createCourse,
)
```

---

## 10. Notification System

Notifications are created server-side by the backend and polled by the frontend every 10 seconds via `NotificationListener`. Each notification targets a specific user.

| Trigger                              | Notification Type                           | Recipients                              |
| ------------------------------------ | ------------------------------------------- | --------------------------------------- |
| Course created / assigned to trainer | `course_assigned`                           | Trainer                                 |
| Participant enrolled                 | `course_enrolled`                           | Participant                             |
| Participant removed                  | `course_removed`                            | Participant                             |
| Course deleted                       | `course_deleted`                            | All enrolled participants               |
| New lesson created                   | `new_lesson_available`                      | All enrolled (except creator)           |
| New quiz created                     | `new_quiz_available`                        | All enrolled + teacher (except creator) |
| Quiz updated                         | `quiz_updated`                              | All enrolled + teacher (except updater) |
| Quiz deleted                         | `quiz_deleted`                              | All enrolled + teacher (except deleter) |
| Discussion thread created            | `thread_created`                            | All enrolled + teacher (except creator) |
| Student submits quiz                 | `quiz_submitted`                            | Teacher                                 |
| Trainer grades open-text             | `quiz_graded`                               | Participant                             |
| Role changed                         | `trainer_assigned` / `participant_assigned` | User whose role changed                 |

---

## 11. Security Considerations

### 11.1 Authentication & Tokens

- JWTs signed with HS256; 3-day expiry for login, 1-hour for password reset, 1-day for email verification
- Tokens are stored in `localStorage` — acceptable trade-off for this SPA; migrate to HttpOnly cookies for higher security
- `isTokenExpired()` checked client-side before every API call; expired tokens trigger automatic logout

### 11.2 Password Policy

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 digit
- At least 1 special character (`!@#$%^&*(),.?":{}|<>`)
- No whitespace
- bcrypt with `saltRounds = 10`

### 11.3 XSS Prevention

- Lesson rich text stored as Quill Delta (structured JSON), not raw HTML
- `QuillDeltaRenderer` converts Delta → React elements without `dangerouslySetInnerHTML`
- Only `http`/`https`/`mailto` links allowed in rendered content
- Legacy HTML content stripped to plain text via `htmlToPlainText()`

### 11.4 CORS

`app.use(cors())` currently allows all origins. For production, restrict to the frontend URL:

```javascript
app.use(cors({ origin: process.env.FRONTEND_URL }))
```

### 11.5 File Uploads

- Multer stores files in `backend/uploads/` with timestamp-prefixed filenames
- Client-side validation: max 1 MB per avatar file
- Server validates file presence; no file type whitelist (add mimetype check for production)

### 11.6 SQL Injection

- All queries use pg parameterized queries (`$1`, `$2`, …)
- No raw string concatenation in SQL

---

## 12. Coding Conventions

### 12.1 Backend

- `async/await` throughout; `express-async-errors` eliminates try/catch in most routes
- Controllers validate inputs and check authorization before calling models
- Model files contain only database query functions — no business logic
- Parameterized SQL only — never string-interpolated queries
- All functions exported as named exports; no default exports in controllers/models

### 12.2 Frontend

- Functional components with hooks; no class components
- Redux Toolkit slices for all shared state; local `useState` for ephemeral UI state
- Thunks in reducer files check `isTokenExpired()` and dispatch `rmUserFn()` on expired tokens
- All API calls in `services/` layer — no axios calls inside components or reducers
- Tailwind utility classes preferred; inline styles only for dynamic values (colors, sizes)

### 12.3 Code Formatting

- Prettier enforced: single quotes, no semicolons, tabs, LF line endings
- ESLint: `react-hooks` rules, `react-refresh` for HMR safety
- File naming: PascalCase for components/pages, camelCase for utilities/services

### 12.4 Environment Variables

- Never commit `.env` files — both `.gitignore` files exclude them
- Frontend: `VITE_API_BASE_URL` (build-time) via `.env` in `frontend/`
- Backend: all secrets via `backend/.env`

---

## 13. Content Block Reference

### 13.1 Text Block

**Type:** `text`

| Field     | Type                 | Description                                                      |
| --------- | -------------------- | ---------------------------------------------------------------- |
| `delta`   | Object (Quill Delta) | Rich text as structured JSON (preferred, new blocks)             |
| `content` | String (HTML)        | Legacy HTML field — rendered as plain text in QuillDeltaRenderer |

### 13.2 Zoom Card Block

**Type:** `zoom_card`

| Field       | Type                | Description                      |
| ----------- | ------------------- | -------------------------------- |
| `title`     | String              | Meeting name displayed on card   |
| `date`      | String (YYYY-MM-DD) | Meeting date                     |
| `time`      | String (HH:MM)      | Meeting time                     |
| `join_link` | String (URL)        | Zoom join URL — opens in new tab |

### 13.3 File Attachment Block

**Type:** `file_attachment`

| Field   | Type   | Description                                              |
| ------- | ------ | -------------------------------------------------------- |
| `title` | String | Section header (e.g. "Course Materials")                 |
| `files` | Array  | Each item: `{ name, size, type, url (base64 data URL) }` |

### 13.4 Recording / Link Block

**Type:** `recording_link`

| Field         | Type              | Description                         |
| ------------- | ----------------- | ----------------------------------- |
| `title`       | String            | Link label                          |
| `url`         | String (URL)      | External URL                        |
| `description` | String (optional) | Brief description shown below title |

---

## 14. Common Issues & Troubleshooting

| Issue                           | Likely Cause                    | Solution                                                                                                   |
| ------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 401 on API calls                | Token expired or missing        | Check `localStorage` `loggedUser`; re-login; verify `SECRET` env var on backend                            |
| 403 on route                    | Wrong role                      | Check `user.role` vs `authorizeRoles()` for that route                                                     |
| CORS error in browser           | Backend CORS config             | Add `FRONTEND_URL` to allowed origins; ensure no trailing slash                                            |
| Google OAuth loop               | Wrong callback URL              | `FRONTEND_URL` env var must exactly match OAuth redirect URI in Google Console                             |
| Email not sent                  | SMTP misconfigured              | Check `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`; enable app password                              |
| Avatar not displaying           | Wrong URL resolution            | Check `API_BASE_URL` in frontend; `avatar_url` stored as `/uploads/filename` — needs base URL prepended    |
| Notification dot not appearing  | Poll not running                | Ensure `NotificationListener` is mounted (Dashboard renders it); check token validity                      |
| Quiz score shows 0              | Multiple-choice comparison      | Ensure answer array is sorted before comparison; check `assessmentJson.questions` IDs match `answers` keys |
| UNIQUE constraint error (23505) | Duplicate enrollment / username | `errorHandler` maps this to 400 with the pg detail message                                                 |
| Lessons out of order            | `order_index`                   | Sidebar and CourseLabel both sort by `order_index` ascending                                               |

---

## 15. Quick Reference

### Frontend API Base URL

```
VITE_API_BASE_URL=http://localhost:3001        (development)
VITE_API_BASE_URL=https://keys2balance.fly.dev  (production)
```

### Key File Locations

| File                                          | Purpose                                                             |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `backend/app.js`                              | Express app setup — all routes and middleware registered here       |
| `backend/utils/config.js`                     | PostgreSQL pool + PORT export                                       |
| `backend/utils/middleware.js`                 | `tokenExtractor`, `userExtractor`, `authorizeRoles`, `errorHandler` |
| `backend/utils/passport.js`                   | Google OAuth strategy + user creation logic                         |
| `backend/database/schema.sql`                 | Complete DDL — run this to create all tables                        |
| `backend/init.sql`                            | Schema + test seed data combined — used for Docker                  |
| `frontend/src/store.js`                       | Redux store — all slice reducers registered here                    |
| `frontend/src/services/apiConfig.js`          | `buildApiUrl()` helper — single source of API base URL              |
| `frontend/src/i18n.js`                        | i18next initialization — loads translations from `/public/locales`  |
| `frontend/public/locales/en/translation.json` | English translation keys (template for new strings)                 |

### Color Design Tokens

| Token                   | Hex       | Usage                                                  |
| ----------------------- | --------- | ------------------------------------------------------ |
| `--color-primary`       | `#514587` | Main purple — headings, active nav, buttons            |
| `--color-primary-light` | `#9484b4` | Lighter purple — hover states, secondary UI            |
| `--color-secondary`     | `#e3b465` | Gold — notifications, warnings, secondary CTAs         |
| `--color-success`       | `#2ea49c` | Teal — success states, Zoom blocks, trainer role badge |
| `--color-border-color`  | `#cdd0d8` | Borders, dividers                                      |
| `--color-sidebar-bg`    | `#ededed` | Sidebar background                                     |
| `--color-bg-main`       | `#f8f9fa` | Page background                                        |

