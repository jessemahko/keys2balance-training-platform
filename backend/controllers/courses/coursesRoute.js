const router = require('express').Router()
const CoursesController = require('./coursesController')
const middleware = require('../../utils/middleware')

// public read endpoints
router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)

// mutation endpoints require authenticated admin or trainer
router.post(
  '/',
  middleware.userExtractor,
  middleware.authorizeRoles('admin', 'trainer'),
  CoursesController.createCourse,
)
router.put(
  '/:id',
  middleware.userExtractor,
  middleware.authorizeRoles('admin', 'trainer'),
  CoursesController.updateCourse,
)
router.delete(
  '/:id',
  middleware.userExtractor,
  middleware.authorizeRoles('admin', 'trainer'),
  CoursesController.deleteCourse,
)

module.exports = router
