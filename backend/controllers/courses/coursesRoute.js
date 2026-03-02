const router = require('express').Router()
const CoursesController = require('./coursesController')

router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)
router.post('/', CoursesController.createCourse)
router.put('/:id', CoursesController.updateCourse)
router.delete('/:id', CoursesController.deleteCourse)

module.exports = router
