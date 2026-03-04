const lessonRouter = require('express').Router()
const lessonController = require('./lessonController')
const middleware = require('../../utils/middleware')

// GET all lessons for a specific course
lessonRouter.get('/course/:courseId', lessonController.getLessonsByCourse)

// GET a single lesson
lessonRouter.get('/:id', lessonController.getLesson)

// POST a new lesson container
lessonRouter.post(
    '/',
    middleware.userExtractor,
    middleware.authorizeRoles('admin', 'trainer'),
    lessonController.createLesson,
)

// PATCH a lesson to add a content block (Zoom, PDF, etc.)
lessonRouter.patch(
    '/:id/add-block',
    middleware.userExtractor,
    middleware.authorizeRoles('admin', 'trainer'),
    lessonController.addBlock,
)

// PATCH a specific block within a lesson
lessonRouter.patch(
    '/:id/blocks/:blockId',
    middleware.userExtractor,
    middleware.authorizeRoles('admin', 'trainer'),
    lessonController.updateBlock,
)

// DELETE a specific block within a lesson
lessonRouter.delete(
    '/:id/blocks/:blockId',
    middleware.userExtractor,
    middleware.authorizeRoles('admin', 'trainer'),
    lessonController.deleteBlock,
)

// DELETE a lesson
lessonRouter.delete(
    '/:id',
    middleware.userExtractor,
    middleware.authorizeRoles('admin', 'trainer'),
    lessonController.deleteLesson,
)

module.exports = lessonRouter
