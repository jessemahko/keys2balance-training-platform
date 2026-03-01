const Assessment = require('../models/assessment');

const AssessmentController = {
  // Create a new assessment
  async createAssessment(req, res) {
    
    const { lessonId, title, assessmentJson } = req.body;
    const assessment = await Assessment.create({ lessonId, title, assessmentJson });
    res.json(assessment); // return created assessment
  
  },

  // Get assessment by ID
  async getAssessment(req, res) {
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
  }
};

module.exports = AssessmentController;