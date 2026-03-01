const router = require('express').Router();
const AssessmentController = require('../controllers/assessmentController');

// Create a new assessment
router.post('/', AssessmentController.createAssessment);

// Get assessment by ID
router.get('/:id', AssessmentController.getAssessment);

module.exports = router;