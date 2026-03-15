BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================================
-- 1. USERS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS users (
	user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

	username TEXT UNIQUE NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,

	role TEXT NOT NULL DEFAULT 'participant'
		CHECK (role IN ('participant', 'trainer', 'admin')),

	is_verified BOOLEAN NOT NULL DEFAULT FALSE,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,

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

	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================================================
-- 2. PLATFORM SETTINGS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
	logo_url TEXT,
	primary_color VARCHAR(7) DEFAULT '#514587',
	secondary_color VARCHAR(7) DEFAULT '#9484b4',
	accent_gold VARCHAR(7) DEFAULT '#e3b465',
	accent_teal VARCHAR(7) DEFAULT '#2ea49c',
	allow_user_registration BOOLEAN DEFAULT TRUE
);

-- ======================================================================================
-- 3. COURSES
-- ======================================================================================

CREATE TABLE IF NOT EXISTS courses (
	course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	description TEXT,
	thumbnail_url TEXT,
	teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================================================
-- 4. COHORTS (GROUPS)
-- ======================================================================================

CREATE TABLE IF NOT EXISTS cohorts (
	cohort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_cohorts (
	user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
	cohort_id UUID REFERENCES cohorts(cohort_id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, cohort_id)
);

-- ======================================================================================
-- 5. LESSONS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS lessons (
	lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	content_data JSONB DEFAULT '[]'::jsonb,
	order_index INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE(course_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course
ON lessons(course_id);

-- ======================================================================================
-- 6. PROGRESS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS progress (
	user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
	lesson_id UUID REFERENCES lessons(lesson_id) ON DELETE CASCADE,
	is_completed BOOLEAN NOT NULL DEFAULT FALSE,
	completed_at TIMESTAMPTZ,
	last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user
ON progress(user_id);

-- ======================================================================================
-- 7. ASSESSMENTS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS assessments (
	assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	lesson_id UUID NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	assessment_json JSONB NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_lesson
ON assessments(lesson_id);

-- ======================================================================================
-- 8. ASSESSMENT RESPONSES
-- ======================================================================================

CREATE TABLE IF NOT EXISTS assessment_responses (
	response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	assessment_id UUID NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
	answers_json JSONB NOT NULL,
	submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (assessment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_time
ON assessment_responses(user_id, submitted_at DESC);

-- ======================================================================================
-- 9. DISCUSSION THREADS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS discussion_threads (
	thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE(course_id)
);

CREATE TABLE IF NOT EXISTS discussion_messages (
	message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	thread_id UUID NOT NULL REFERENCES discussion_threads(thread_id) ON DELETE CASCADE,
	user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
	message_text TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================================================
-- 10. NOTIFICATIONS
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

-- ======================================================================================
-- 11. UPDATED_AT TRIGGER
-- ======================================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();



-- ======================================================================================
-- 12. ACCESS CODES (for student registration)
-- ======================================================================================

CREATE TABLE IF NOT EXISTS access_codes (
	code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
	course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
	is_available BOOLEAN NOT NULL DEFAULT True,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 day'
);

-- ======================================================================================
-- 13. COURSE ENROLLMENTS
-- ======================================================================================

CREATE TABLE IF NOT EXISTS course_enrollments (
	user_id UUID NOT NULL
		REFERENCES users(user_id)
		ON DELETE CASCADE,

	course_id UUID NOT NULL
		REFERENCES courses(course_id)
		ON DELETE CASCADE,

	enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course
ON course_enrollments(course_id);

COMMIT;