BEGIN;

-- ======================================================================================
-- USERS
-- ======================================================================================

INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES
('admin1','admin@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','admin','Admin','User'),
('trainer1','trainer@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','trainer','John','Trainer'),
('student1','student1@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Alice','Student'),
('student2','student2@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Bob','Student'),
('student3','student3@test.com','$2b$10$C6UzMDM.H6dfI/f/IKcEeO3vqE3c4T.Gv10XqjT5YsdDzZ3uw8DGa','participant','Charlie','Student');

-- ======================================================================================
-- PLATFORM SETTINGS
-- ======================================================================================

INSERT INTO platform_settings (user_id)
SELECT user_id FROM users WHERE username='admin1';

-- ======================================================================================
-- COURSE
-- ======================================================================================

INSERT INTO courses (title, description, teacher_id)
VALUES (
'Intro to Leadership',
'Basic leadership training',
(SELECT user_id FROM users WHERE username='trainer1')
);

-- ======================================================================================
-- COHORTS
-- ======================================================================================

INSERT INTO cohorts (name)
VALUES
('Cohort A'),
('Cohort B');

INSERT INTO user_cohorts (user_id, cohort_id)
VALUES
(
(SELECT user_id FROM users WHERE username='student1'),
(SELECT cohort_id FROM cohorts WHERE name='Cohort A')
),
(
(SELECT user_id FROM users WHERE username='student2'),
(SELECT cohort_id FROM cohorts WHERE name='Cohort A')
),
(
(SELECT user_id FROM users WHERE username='student3'),
(SELECT cohort_id FROM cohorts WHERE name='Cohort B')
);

-- ======================================================================================
-- LESSONS
-- ======================================================================================

INSERT INTO lessons (course_id, title, order_index)
VALUES
(
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'Lesson 1: Leadership Basics',
1
),
(
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'Lesson 2: Communication',
2
),
(
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'Lesson 3: Team Management',
3
);

-- ======================================================================================
-- PROGRESS
-- ======================================================================================

INSERT INTO progress (user_id, lesson_id, is_completed)
VALUES
(
(SELECT user_id FROM users WHERE username='student1'),
(SELECT lesson_id FROM lessons WHERE order_index=1 LIMIT 1),
TRUE
),
(
(SELECT user_id FROM users WHERE username='student2'),
(SELECT lesson_id FROM lessons WHERE order_index=1 LIMIT 1),
TRUE
);

-- ======================================================================================
-- ASSESSMENT
-- ======================================================================================

INSERT INTO assessments (lesson_id, title, assessment_json)
VALUES (
(SELECT lesson_id FROM lessons WHERE order_index=1 LIMIT 1),
'Lesson 1 Quiz',
'{
	"questions":[
		{
			"id":1,
			"question":"What is leadership?",
			"type":"multiple_choice",
			"options":["Control","Influence","Force"],
			"correct":"Influence"
		}
	]
}'
);

-- ======================================================================================
-- ASSESSMENT RESPONSES
-- ======================================================================================

INSERT INTO assessment_responses (assessment_id, user_id, answers_json)
VALUES
(
(SELECT assessment_id FROM assessments LIMIT 1),
(SELECT user_id FROM users WHERE username='student1'),
'{"1":"Influence"}'
),
(
(SELECT assessment_id FROM assessments LIMIT 1),
(SELECT user_id FROM users WHERE username='student2'),
'{"1":"Control"}'
);

-- ======================================================================================
-- DISCUSSION
-- ======================================================================================

INSERT INTO discussion_threads (course_id, title)
VALUES (
(SELECT course_id FROM courses WHERE title='Intro to Leadership'),
'General Discussion'
);

INSERT INTO discussion_messages (thread_id, user_id, message_text)
VALUES
(
(SELECT thread_id FROM discussion_threads LIMIT 1),
(SELECT user_id FROM users WHERE username='student1'),
'This lesson was great!'
),
(
(SELECT thread_id FROM discussion_threads LIMIT 1),
(SELECT user_id FROM users WHERE username='trainer1'),
'Glad you liked it.'
);

-- ======================================================================================
-- NOTIFICATIONS
-- ======================================================================================

INSERT INTO notifications (user_id, type, title, message)
VALUES
(
(SELECT user_id FROM users WHERE username='student1'),
'welcome',
'Welcome',
'Welcome to the platform'
),
(
(SELECT user_id FROM users WHERE username='student1'),
'course_assigned',
'New Course',
'You have been assigned a new course'
);

COMMIT;