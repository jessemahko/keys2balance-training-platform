const router = require('express').Router();
const AssessmentController = require('./assessmentController');
//create assessment
router.post('/', async (req, res) => {
  const assessment = await AssessmentController.createAssessment(req);
  res.json(assessment);
});

//get assessment
router.get('/:id', async (req, res) => {
  const assessment = await AssessmentController.getAssessment(req);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  res.json(assessment);
});

module.exports = router;