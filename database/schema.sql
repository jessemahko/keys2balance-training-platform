-- ======================================================================================
-- Keys2Balance Training & Assessment Platform - CONSOLIDATED SCHEMA
-- This version merges our requirements with the UUID/Transaction style.
-- ======================================================================================

BEGIN;

-- UUID generation (Professional standard - much better than simple integers)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================================
-- 1. BRANDING & LOOK (platform_settings)
-- ======================================================================================

-- Client can change logos/colors without editing CSS.
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#514587', -- K2B Purple
    secondary_color VARCHAR(7) DEFAULT '#9484b4',
    accent_gold VARCHAR(7) DEFAULT '#e3b465',
    accent_teal VARCHAR(7) DEFAULT '#2ea49c',
    allow_user_registration BOOLEAN DEFAULT TRUE
);


-- ======================================================================================
-- 2. OUR USERS (Updated to match our backend logic)
-- ======================================================================================

-- Our current register.js backend expects these columns, so we need them to avoid crashes!
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    -- Role & Status
    role TEXT NOT NULL DEFAULT 'participant'
        CHECK (role IN ('participant', 'trainer', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Profile Fields (from original requirement)
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    city TEXT,
    post_code TEXT,
    country TEXT,
    avatar_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ======================================================================================
-- 3. COURSES & GROUPS (The missing hierarchy)
-- ======================================================================================

-- We need a 'Course' container because one course (like Leadership 101) 
-- will contain many modules and lessons.
CREATE TABLE IF NOT EXISTS courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assign students to these groups manually.
CREATE TABLE IF NOT EXISTS cohorts (
    cohort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- This is the "Bridge" that links students to their teams.
CREATE TABLE IF NOT EXISTS user_cohorts (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(cohort_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, cohort_id)
);

-- ======================================================================================
-- 4. MODULES & LESSONS (The content layers)
-- ======================================================================================

-- Modules are chapters. Added 'order_index' so we can sort them.
CREATE TABLE IF NOT EXISTS modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- Lessons are where the actual video/pdf/zoom links live.
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(module_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'pdf', 'text', 'zoom')),
    content_data TEXT, 
    order_index INTEGER NOT NULL DEFAULT 0
);


-- ======================================================================================
-- 5. PROGRESS & ASSESSMENTS
-- ======================================================================================

-- Tracks if a user finished a specific lesson.
CREATE TABLE IF NOT EXISTS progress (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

-- Assessment logic linked to lessons. 
-- Using JSONB for flexibility.
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stores student's quiz answers.
CREATE TABLE IF NOT EXISTS assessment_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(assessment_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assessment_id, user_id)
);


-- ======================================================================================
-- 6. COMMUNITY (Discussion Threads)
-- ======================================================================================

-- Each course gets a team discussion area.
CREATE TABLE IF NOT EXISTS discussion_threads (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The actual chat messages. 
CREATE TABLE IF NOT EXISTS discussion_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES discussion_threads(thread_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_assessments_lesson ON assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_time ON assessment_responses(user_id, submitted_at DESC);

-- ======================================================================================
-- 7. NOTIFICATIONS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    type TEXT NOT NULL CHECK (
        type IN (
            'welcome',
            'course_assigned',
            'lesson_completed',
            'assessment_submitted',
            'discussion_reply',
            'admin_announcement',
            'reminder'
        )
    ),

    title TEXT NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_time
ON notifications(user_id, created_at DESC);

COMMIT;
