BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#514587',
    secondary_color VARCHAR(7) DEFAULT '#9484b4',
    accent_gold VARCHAR(7) DEFAULT '#e3b465',
    accent_teal VARCHAR(7) DEFAULT '#2ea49c',
    allow_user_registration BOOLEAN DEFAULT TRUE
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL, 
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'trainer', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE, 
    profile_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Cohorts (Teams/Classes)
CREATE TABLE IF NOT EXISTS cohorts (
    cohort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. User-Cohort Junction
CREATE TABLE IF NOT EXISTS user_cohorts (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(cohort_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, cohort_id)
);

-- 6. Lessons (Directly linked to Course)
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_data JSONB DEFAULT '[]'::jsonb, -- Array of blocks: Video, PDF, Zoom, etc.
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Progress Tracking
CREATE TABLE IF NOT EXISTS progress (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

-- 8. Assessments
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Assessment Responses
CREATE TABLE IF NOT EXISTS assessment_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(assessment_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assessment_id, user_id)
);

-- 10. Community (Threads linked to Course)
CREATE TABLE IF NOT EXISTS discussion_threads (
    thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES discussion_threads(thread_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);

COMMIT;
