const router = require('express').Router()
const AssessmentController = require('./assessmentController')
router.get('/', AssessmentController.getAssessments)
router.get('/:id', AssessmentController.getAssessment)
router.post('/', AssessmentController.postAssessment)
router.delete('/:id', AssessmentController.deleteAssessment)
router.put('/:id', AssessmentController.updateAssessment)
module.exports = router
