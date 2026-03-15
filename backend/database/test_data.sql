BEGIN;

-- ======================================================================================
-- USERS
-- ======================================================================================

INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES
('admin1','admin@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','admin','Admin','User'),
('trainer1','trainer1@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','trainer','John','Doe'),
('trainer2','trainer2@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','trainer','Sarah','Smith'),
('student1','student1@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Alice','Brown'),
('student2','student2@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Bob','Taylor'),
('student3','student3@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Charlie','Wilson'),
('student4','student4@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Diana','Clark')
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