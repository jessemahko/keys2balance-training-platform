const router = require('express').Router()
const CoursesController = require('./coursesController')
const middleware = require('../../utils/middleware')

// read endpoints require an authenticated user context
router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)

// create is admin-only
router.post('/', CoursesController.createCourse)

// update/delete require authenticated admin or trainer
router.put('/:id', CoursesController.updateCourse)
router.delete('/:id', CoursesController.deleteCourse)

// Participant enrollment endpoints
router.post('/:id/enroll', CoursesController.enrollStudent)
router.delete('/:id/enroll/:userId', CoursesController.removeStudent)

module.exports = router
