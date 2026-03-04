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

## 🏗️ Core Architecture (12 Tables)

The schema is built using **UUIDs** for security and **Transactions** for data integrity.

### 1. System & Branding
*   **`platform_settings`**: Global configuration (Logo, Primary/Secondary colors, Accent colors). Enables "white-label" branding without code changes.

### 2. User Management
*   **`users`**: Core account data. 
    *   Roles: `admin`, `teacher`, `student`.
    *   Includes `is_verified` for email auth and `profile_image_url`.

### 3. Training Hierarchy
*   **`courses`**: The top-level container for a training program.
*   **`cohorts`**: Groups/Classes (e.g., "Company X - Spring 2026"). 
*   **`user_cohorts`**: Junction table linking Users to their assigned Cohorts (Profile-based access).
*   **`modules`**: Chapters inside a course (ordered via `order_index`).
*   **`lessons`**: Actual content units (Video, PDF, Text, Zoom).

### 4. Progress & Assessments
*   **`progress_records`**: Real-time tracking of student completion per lesson.
*   **`assessments`**: Quiz definitions stored as **JSONB** for maximum flexibility in question types.
*   **`assessment_responses`**: Student answers stored in JSONB format.

### 5. Community & Social
*   **`discussion_threads`**: Topic-based forum headers linked to specific courses.
*   **`discussion_messages`**: Real-time chat content within threads.

---

## 🛠️ Design Philosophy

### Why UUIDs?
We use `UUID PRIMARY KEY` instead of standard Integers. This prevents ID guessing (security) and makes it easier to merge data across different server environments.

### Why JSONB?
The `assessments` and `responses` tables use `JSONB`. This allows us to add or change quiz formats (Multiple Choice, True/False, Open Text) without ever needing to perform a database migration or change the SQL schema.

### Data Integrity
*   **`ON DELETE CASCADE`**: Automatically cleans up child records (e.g., deleting a module deletes its lessons).
*   **`ON DELETE SET NULL`**: Used for chat messages so that valuable community knowledge remains even if a user account is deleted.

---
*Last Updated: 2026-02-27*