const router = require('express').Router()
const AssessmentController = require('./assessmentController')

router.get('/', AssessmentController.getAssessments)
router.get('/:id', AssessmentController.getAssessment)
router.post('/', AssessmentController.postAssessment)
router.put('/:id', AssessmentController.updateAssessment)
router.delete('/:id', AssessmentController.deleteAssessment)

router.post('/:id/submit', AssessmentController.submitAssessment)
router.get('/:id/results', AssessmentController.getResults)
router.get('/:id/my-result', AssessmentController.getMyResult)

module.exports = router
