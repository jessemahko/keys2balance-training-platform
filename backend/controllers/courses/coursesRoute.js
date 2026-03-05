const router = require('express').Router()
const CoursesController = require('./coursesController')
const middleware = require('../../utils/middleware')

// read endpoints require an authenticated user context
router.get('/', middleware.userExtractor, CoursesController.getCourses)
router.get('/:id', middleware.userExtractor, CoursesController.getCourse)

// create is admin-only
router.post(
  '/',
  middleware.userExtractor,
  middleware.authorizeRoles('admin'),
  CoursesController.createCourse,
)

// update/delete require authenticated admin or trainer
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
