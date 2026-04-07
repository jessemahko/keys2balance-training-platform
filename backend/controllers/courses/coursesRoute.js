const router = require('express').Router()
const CoursesController = require('./coursesController')
const middleware = require('../../utils/middleware')

// read endpoints require an authenticated user context
router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)

// create is admin/trainer only
router.post(
	'/',
	middleware.authorizeRoles('admin', 'trainer'),
	CoursesController.createCourse,
)

// update/delete require authenticated admin or trainer
router.put(
	'/:id',
	middleware.authorizeRoles('admin', 'trainer'),
	CoursesController.updateCourse,
)
router.delete(
	'/:id',
	middleware.authorizeRoles('admin', 'trainer'),
	CoursesController.deleteCourse,
)

// Participant enrollment endpoints require admin/trainer (owner)
router.post(
	'/:id/enroll',
	middleware.authorizeRoles('admin', 'trainer'),
	CoursesController.enrollStudent,
)
router.delete(
	'/:id/enroll/:userId',
	middleware.authorizeRoles('admin', 'trainer'),
	CoursesController.removeStudent,
)

module.exports = router
