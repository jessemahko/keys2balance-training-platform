const Assessment = require('../models/assessment');

const AssessmentController = {
  async createAssessment(req) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })

    const { lessonId, title, assessmentJson } = req.body;
    return await Assessment.create({ lessonId, title, assessmentJson });
  },

  async getAssessment(req) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
      
    const { id } = req.params;
    const assessment = await Assessment.getById(id);
    if (!assessment) return null;

    const sanitized = JSON.parse(JSON.stringify(assessment.assessment_json));
    sanitized.questions?.forEach(q => delete q.correctOptionId);
    assessment.assessment_json = sanitized;

    return assessment;
  }
};

module.exports = AssessmentController;