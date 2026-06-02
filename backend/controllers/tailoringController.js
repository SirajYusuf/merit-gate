const TailoringRun = require('../models/TailoringRun');
const { getTailoringRunWithProvenance, runTailoring } = require('../services/tailoringService');

const createTailoringRun = async (req, res) => {
  try {
    const result = await runTailoring({
      userId: req.user._id,
      jobDescription: req.body.jobDescription,
      projectIds: req.body.projectIds || [],
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      memoryType: req.body.memoryType,
      topK: req.body.topK,
      topN: req.body.topN,
    });

    res.status(201).json({
      tailoringRunId: result.tailoringRun._id,
      tailoredResumeId: result.tailoredResume._id,
      jdMetadata: result.jdMetadata,
      tailoredBullets: result.tailoredBullets,
      retrievedMemories: result.retrievedMemories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listTailoringRuns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      TailoringRun.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-jobDescription'),
      TailoringRun.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTailoringRun = async (req, res) => {
  try {
    const tailoringRun = await getTailoringRunWithProvenance({
      userId: req.user._id,
      tailoringRunId: req.params.id,
    });

    if (!tailoringRun) {
      return res.status(404).json({ message: 'Tailoring run not found' });
    }

    res.json(tailoringRun);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTailoringRun,
  listTailoringRuns,
  getTailoringRun,
};
