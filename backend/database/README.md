# 🗄️ Database Architecture - Keys2Balance LMS

This directory contains the source of truth for the Keys2Balance PostgreSQL database schema.

## 🚀 Setup Instructions

1.  **Install PostgreSQL** (v14+ recommended).
2.  **Create the database:**
    ```bash
    createdb keys2balance
    ```
3.  **Run the schema script:**
    ```bash
    psql -d keys2balance -f database/schema.sql
    ```

---

## 🏗️ Core Architecture (10 Tables)

The schema is built using **UUIDs** for security and **Transactions** for data integrity.

### 1. System & Branding
*   **`platform_settings`**: Global configuration (Logo, Primary/Secondary colors, Accent colors). Enables "white-label" branding without code changes.

### 2. User Management
*   **`users`**: Core account data. 
    *   Roles: `participant`, `trainer`, `admin`.
    *   Includes authentication fields and full profile data (`first_name`, `address`, `phone`, `date_of_birth`, `avatar_url`).

### 3. Training Hierarchy & Access
*   **`courses`**: The top-level container for a training program.
*   **`lessons`**: Directly linked to a Course. Contains dynamic `content_data` (JSONB) for building rich pages (Video, PDF, Text, Zoom) and ordered via `order_index`.
*   **`cohorts`**: Groups/Teams (e.g., "Company X - Spring 2026"). 
*   **`user_cohorts`**: Junction table linking Users to their assigned Cohorts (Bridge for profile-based access).

### 4. Progress & Assessments
*   **`progress`**: Real-time tracking of student completion per lesson, including timestamps (`completed_at`, `last_activity_at`).
*   **`assessments`**: Quiz definitions stored as **JSONB** for maximum flexibility, linked directly to lessons.
*   **`assessment_responses`**: Student answers stored in JSONB format.

### 5. Community & Communications
*   **`discussion_threads`**: Topic-based forum headers linked to specific courses.
*   **`discussion_messages`**: Real-time chat content within threads.
*   **`notifications`**: System alerts for users (e.g., welcome, lesson completion, replies).

---

## 🛠️ Design Philosophy

### Why UUIDs?
We use `UUID PRIMARY KEY` instead of standard Integers. This prevents ID guessing (security) and makes it easier to merge data across different server environments.

### Why JSONB?
The `lessons`, `assessments`, and `responses` tables use `JSONB`. This creates an extremely flexible NoSQL-like experience inside PostgreSQL, allowing us to build dynamic course pages and varying quiz formats (Multiple Choice, True/False, Open Text) without ever performing a database migration.

### Data Integrity
*   **`ON DELETE CASCADE`**: Automatically cleans up child records (e.g., deleting a course deletes its lessons and progress tracking).
*   **`ON DELETE SET NULL`**: Used for chat messages and course instructors so that valuable community knowledge and global settings remain even if a user account is deleted.

---
*Last Updated: 2026-03-04*