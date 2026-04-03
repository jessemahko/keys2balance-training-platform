BEGIN;

-- ======================================================================================
-- USERS
-- ======================================================================================

INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES
('admin1','admin@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','admin','Admin','User'),
('trainer1','trainer1@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','trainer','John','Doe'),
('trainer2','trainer2@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','trainer','Sarah','Smith'),
('student1','student1@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','participant','Alice','Brown'),
('student2','student2@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','participant','Bob','Taylor'),
('student3','student3@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','participant','Charlie','Wilson'),
('student4','student4@test.com','$2b$10$bsnG3SCCXhADlR0W8UGltuv39n.dkB1AsUGkxi1gqIhmTUloRd2o6','participant','Diana','Clark')
ON CONFLICT (username) DO NOTHING;

-- ======================================================================================
-- PLATFORM SETTINGS
-- ======================================================================================

INSERT INTO platform_settings (user_id)
SELECT user_id FROM users WHERE username='admin1'
ON CONFLICT DO NOTHING;

-- ======================================================================================
-- COURSES
-- ======================================================================================

INSERT INTO courses (title, description, teacher_id)
SELECT
'Intro to Leadership',
'Leadership fundamentals',
(SELECT user_id FROM users WHERE username='trainer1')
WHERE NOT EXISTS (
	SELECT 1 FROM courses WHERE title='Intro to Leadership'
);

INSERT INTO courses (title, description, teacher_id)
SELECT
'Effective Communication',
'Communication and listening skills',
(SELECT user_id FROM users WHERE username='trainer1')
WHERE NOT EXISTS (
	SELECT 1 FROM courses WHERE title='Effective Communication'
);

INSERT INTO courses (title, description, teacher_id)
SELECT
'Team Management',
'Managing teams and conflict',
(SELECT user_id FROM users WHERE username='trainer2')
WHERE NOT EXISTS (
	SELECT 1 FROM courses WHERE title='Team Management'
);

-- ======================================================================================
-- LESSONS
-- ======================================================================================

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'What is Leadership',
1
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='What is Leadership'
);

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'Leadership Styles',
2
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='Leadership Styles'
);

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Effective Communication'),
'Active Listening',
1
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='Active Listening'
);

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Effective Communication'),
'Giving Feedback',
2
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='Giving Feedback'
);

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Team Management'),
'Building Trust',
1
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='Building Trust'
);

INSERT INTO lessons (course_id, title, order_index)
SELECT
(SELECT course_id FROM courses WHERE title='Team Management'),
'Conflict Resolution',
2
WHERE NOT EXISTS (
	SELECT 1 FROM lessons WHERE title='Conflict Resolution'
);

-- ======================================================================================
-- COURSE ENROLLMENTS
-- ======================================================================================

INSERT INTO course_enrollments (user_id, course_id)
VALUES
((SELECT user_id FROM users WHERE username='student1'), (SELECT course_id FROM courses WHERE title='Intro to Leadership')),
((SELECT user_id FROM users WHERE username='student2'), (SELECT course_id FROM courses WHERE title='Intro to Leadership')),
((SELECT user_id FROM users WHERE username='student3'), (SELECT course_id FROM courses WHERE title='Intro to Leadership'))
ON CONFLICT DO NOTHING;

INSERT INTO course_enrollments (user_id, course_id)
VALUES
((SELECT user_id FROM users WHERE username='student1'), (SELECT course_id FROM courses WHERE title='Effective Communication')),
((SELECT user_id FROM users WHERE username='student4'), (SELECT course_id FROM courses WHERE title='Effective Communication'))
ON CONFLICT DO NOTHING;

INSERT INTO course_enrollments (user_id, course_id)
VALUES
((SELECT user_id FROM users WHERE username='student2'), (SELECT course_id FROM courses WHERE title='Team Management')),
((SELECT user_id FROM users WHERE username='student3'), (SELECT course_id FROM courses WHERE title='Team Management')),
((SELECT user_id FROM users WHERE username='student4'), (SELECT course_id FROM courses WHERE title='Team Management'))
ON CONFLICT DO NOTHING;

-- ======================================================================================
-- ASSESSMENTS
-- ======================================================================================

INSERT INTO assessments (lesson_id, title, assessment_json)
SELECT
(SELECT lesson_id FROM lessons WHERE title='What is Leadership'),
'Leadership Quiz',
'{"questions":[{"id":1,"question":"Leadership is...","options":["Control","Influence","Authority"],"correct":"Influence"}]}'
WHERE NOT EXISTS (
	SELECT 1 FROM assessments WHERE title='Leadership Quiz'
);

-- ======================================================================================
-- DISCUSSION THREADS
-- ======================================================================================

INSERT INTO discussion_threads (course_id, title)
SELECT
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'Leadership Discussion'
WHERE NOT EXISTS (
	SELECT 1 FROM discussion_threads WHERE title='Leadership Discussion'
);

INSERT INTO discussion_threads (course_id, title)
SELECT
(SELECT course_id FROM courses WHERE title='Effective Communication'),
'Communication Discussion'
WHERE NOT EXISTS (
	SELECT 1 FROM discussion_threads WHERE title='Communication Discussion'
);

INSERT INTO discussion_threads (course_id, title)
SELECT
(SELECT course_id FROM courses WHERE title='Team Management'),
'Team Discussion'
WHERE NOT EXISTS (
	SELECT 1 FROM discussion_threads WHERE title='Team Discussion'
);


-- ======================================================================================
-- NOTIFICATIONS - TEST DATA
-- ======================================================================================

-- Welcome notifications (new users)
INSERT INTO notifications (user_id, type, title, message, is_read)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'welcome',
 'Welcome to Leadership Academy!',
 'Welcome Alice! We are excited to have you join our learning platform. Start exploring courses today.',
 TRUE),
 
((SELECT user_id FROM users WHERE username='student2'),
 'welcome',
 'Welcome to Leadership Academy!',
 'Welcome Bob! We are excited to have you join our learning platform. Start exploring courses today.',
 TRUE),
 
((SELECT user_id FROM users WHERE username='student3'),
 'welcome',
 'Welcome to Leadership Academy!',
 'Welcome Charlie! We are excited to have you join our learning platform. Start exploring courses today.',
 FALSE),
 
((SELECT user_id FROM users WHERE username='student4'),
 'welcome',
 'Welcome to Leadership Academy!',
 'Welcome Diana! We are excited to have you join our learning platform. Start exploring courses today.',
 FALSE);

-- Course assigned notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'course_assigned',
 'New Course: Intro to Leadership',
 'You have been assigned to the course "Intro to Leadership" taught by John Doe. Start learning now!',
 TRUE,
 NOW() - INTERVAL '5 days'),
 
((SELECT user_id FROM users WHERE username='student1'),
 'course_assigned',
 'New Course: Effective Communication',
 'You have been assigned to the course "Effective Communication" taught by John Doe. Start learning now!',
 TRUE,
 NOW() - INTERVAL '4 days'),
 
((SELECT user_id FROM users WHERE username='student2'),
 'course_assigned',
 'New Course: Intro to Leadership',
 'You have been assigned to the course "Intro to Leadership" taught by John Doe. Start learning now!',
 FALSE,
 NOW() - INTERVAL '3 days'),
 
((SELECT user_id FROM users WHERE username='student3'),
 'course_assigned',
 'New Course: Team Management',
 'You have been assigned to the course "Team Management" taught by Sarah Smith. Start learning now!',
 FALSE,
 NOW() - INTERVAL '2 days');

-- Lesson completed notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'lesson_completed',
 'Lesson Completed: What is Leadership',
 'Congratulations! You have successfully completed the lesson "What is Leadership". Great progress!',
 TRUE,
 NOW() - INTERVAL '2 days'),
 
((SELECT user_id FROM users WHERE username='student1'),
 'lesson_completed',
 'Lesson Completed: Active Listening',
 'Congratulations! You have successfully completed the lesson "Active Listening". Keep it up!',
 TRUE,
 NOW() - INTERVAL '1 day'),
 
((SELECT user_id FROM users WHERE username='student2'),
 'lesson_completed',
 'Lesson Completed: What is Leadership',
 'Congratulations! You have successfully completed the lesson "What is Leadership". Great progress!',
 FALSE,
 NOW() - INTERVAL '3 days');

-- Assessment submitted notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'assessment_submitted',
 'Assessment Submitted: Leadership Quiz',
 'Your assessment "Leadership Quiz" has been submitted successfully. Score: 100%',
 TRUE,
 NOW() - INTERVAL '2 days'),
 
((SELECT user_id FROM users WHERE username='student1'),
 'assessment_submitted',
 'Assessment Submitted: Communication Quiz',
 'Your assessment "Communication Quiz" has been submitted successfully. Score: 100%',
 TRUE,
 NOW() - INTERVAL '1 day'),
 
((SELECT user_id FROM users WHERE username='student2'),
 'assessment_submitted',
 'Assessment Submitted: Leadership Quiz',
 'Your assessment "Leadership Quiz" has been submitted successfully. Score: 100%',
 FALSE,
 NOW() - INTERVAL '2 days');

-- Discussion reply notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'discussion_reply',
 'New Reply: Leadership Discussion',
 'John Doe replied to your discussion post: "Great question! Leaders need to be visionary, empathetic, and decisive."',
 TRUE,
 NOW() - INTERVAL '1 day'),
 
((SELECT user_id FROM users WHERE username='student2'),
 'discussion_reply',
 'New Reply: Team Discussion',
 'Charlie Wilson replied to your discussion post in "Team Discussion"',
 FALSE,
 NOW() - INTERVAL '12 hours'),
 
((SELECT user_id FROM users WHERE username='student1'),
 'discussion_reply',
 'New Reply: Communication Discussion',
 'Bob Taylor replied to your discussion post in "Communication Discussion"',
 FALSE,
 NOW() - INTERVAL '6 hours');

-- Admin announcement notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student1'),
 'admin_announcement',
 'Platform Maintenance Scheduled',
 'The platform will undergo maintenance on Friday night from 11 PM to 1 AM. Plan accordingly.',
 TRUE,
 NOW() - INTERVAL '3 days'),
 
((SELECT user_id FROM users WHERE username='student2'),
 'admin_announcement',
 'Platform Maintenance Scheduled',
 'The platform will undergo maintenance on Friday night from 11 PM to 1 AM. Plan accordingly.',
 FALSE,
 NOW() - INTERVAL '3 days'),
 
((SELECT user_id FROM users WHERE username='student3'),
 'admin_announcement',
 'New Feature: Video Lessons',
 'We have added video lessons to all courses. Check out the new content!',
 FALSE,
 NOW() - INTERVAL '2 days'),
 
((SELECT user_id FROM users WHERE username='student4'),
 'admin_announcement',
 'New Feature: Video Lessons',
 'We have added video lessons to all courses. Check out the new content!',
 FALSE,
 NOW() - INTERVAL '2 days');

-- Reminder notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
VALUES
((SELECT user_id FROM users WHERE username='student2'),
 'reminder',
 'Incomplete Lesson: Leadership Styles',
 'You have not yet completed the lesson "Leadership Styles" in the Intro to Leadership course. Complete it today!',
 FALSE,
 NOW() - INTERVAL '1 day'),
 
((SELECT user_id FROM users WHERE username='student3'),
 'reminder',
 'Pending Assessment: Building Trust',
 'You have not yet submitted the assessment for "Building Trust" lesson. Submit your response now!',
 FALSE,
 NOW() - INTERVAL '12 hours'),
 
((SELECT user_id FROM users WHERE username='student4'),
 'reminder',
 'Course Start Reminder',
 'You are enrolled in "Effective Communication" course but haven''t started yet. Begin learning today!',
 FALSE,
 NOW() - INTERVAL '8 hours');

-- ======================================================================================
-- ACCESS CODES
-- ======================================================================================

INSERT INTO access_codes (course_id)
SELECT (SELECT course_id FROM courses WHERE title='Intro to Leadership')
WHERE NOT EXISTS (
	SELECT 1 FROM access_codes WHERE course_id = (SELECT course_id FROM courses WHERE title='Intro to Leadership')
);

INSERT INTO access_codes (course_id)
SELECT (SELECT course_id FROM courses WHERE title='Effective Communication')
WHERE NOT EXISTS (
	SELECT 1 FROM access_codes WHERE course_id = (SELECT course_id FROM courses WHERE title='Effective Communication')
);

INSERT INTO access_codes (course_id)
SELECT (SELECT course_id FROM courses WHERE title='Team Management')
WHERE NOT EXISTS (
	SELECT 1 FROM access_codes WHERE course_id = (SELECT course_id FROM courses WHERE title='Team Management')
);

COMMIT;