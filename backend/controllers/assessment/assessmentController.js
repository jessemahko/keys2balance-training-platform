const Assessment = require('../models/assessment');

const AssessmentController = {
  // Create a new assessment
  async createAssessment(req, res) {
    try {
      const { lessonId, title, assessmentJson } = req.body;
      const assessment = await Assessment.create({ lessonId, title, assessmentJson });

      res.json(assessment); // return created assessment
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get assessment by ID
  async getAssessment(req, res) {
    try {
      const { id } = req.params;

      const assessment = await Assessment.getById(id);

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Remove correct answers before sending to frontend
      const sanitized = JSON.parse(JSON.stringify(assessment.assessment_json));
      sanitized.questions?.forEach(q => delete q.correctOptionId);
      assessment.assessment_json = sanitized;

      res.json(assessment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = AssessmentController;