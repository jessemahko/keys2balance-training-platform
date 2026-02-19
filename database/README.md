## Database Setup

1. Install PostgreSQL
2. Create database:
   createdb keys2balance
3. Run schema:
   psql -d keys2balance -f database/schema.sql

## Core tables

1) users
## Stores participants, trainers and admin.
-user_id (PK)
-email (UNIQUE, NOT NULL)
-password_hash (NOT NULL)
-role (NOT NULL, default 'participant') → participant | trainer | admin
## profile fields 
-first_name
-last_name
-gender 
-date_of_birth
-phone
-address 
-city 
-post_code
-country
-avatar_url 
## Account meta
-is_active (NOT NULL, default true)
-created_at (NOT NULL)
-updated_at (NOT NULL)

2) modules
## Reusable course templates (e.g., “Team Training”).
-module_id (PK)
-title (NOT NULL)
-description

3) progress
## Tracks completion per participant
-module_id (PK/FK → modules.module_id)
-user_id (PK/FK → users.user_id)
-is_completed (NOT NULL, default false)
-completed_at (nullable)
-last_activity_at (NOT NULL)

4) assessments
## Assessment attached to a module (can be 0..many).
-assessment_id (PK)
-module_id (FK → modules.module_id, NOT NULL)
-title (NOT NULL)
-description (optional)
-assessment_json (JSONB, NOT NULL) → the assessment structure (questions, types, options)
-is_required (NOT NULL, default false)
-created_at (NOT NULL)

5) assessment_responses
## One submitted response per user per assessment per cohort.
-assessment_response_id (PK)
-assessment_id (FK → assessments.assessment_id, NOT NULL)
-user_id (FK → users.user_id, NOT NULL)
-answers_json (JSONB, NOT NULL) → answers payload (mcq selections, text answers)
-submitted_at (NOT NULL)
-UNIQUE (assessment_id, user_id)