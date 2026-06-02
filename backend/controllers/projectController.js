const EmbeddingJob = require('../models/EmbeddingJob');
const Project = require('../models/Project');
const ProjectMemory = require('../models/ProjectMemory');
const { buildProjectMemories } = require('../services/memoryBuilderService');
const { enqueueEmbeddingJobs, removeEmbeddingJobs } = require('../services/embeddingQueueService');
const { parseRawText } = require('../services/parserService');
const { readUploadedTextFile } = require('../services/uploadService');

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      userId: req.user._id,
      title,
      description,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memoryCount = await ProjectMemory.countDocuments({
      projectId: project._id,
      userId: req.user._id,
    });

    res.json({
      ...project,
      memoryCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const embeddingJobs = await EmbeddingJob.find({
      projectId: project._id,
      userId: req.user._id,
      status: { $in: ['pending', 'processing', 'failed'] },
    }).select('_id');

    try {
      await removeEmbeddingJobs(embeddingJobs.map((job) => job._id));
    } catch (queueError) {
      console.error('Failed to remove queued embedding jobs:', queueError.message);
    }

    await EmbeddingJob.deleteMany({ projectId: project._id, userId: req.user._id });
    await ProjectMemory.deleteMany({ projectId: project._id, userId: req.user._id });
    await Project.deleteOne({ _id: project._id, userId: req.user._id });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadProjectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    res.status(201).json({
      message: 'File uploaded',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ingestProjectMemories = async (req, res) => {
  try {
    let rawText = req.body.rawText || req.body.text;
    const fileName = req.body.fileName;
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!rawText && fileName) {
      rawText = await readUploadedTextFile(fileName);
    }

    const parsedMemories = await parseRawText(rawText);
    const result = await buildProjectMemories({
      userId: req.user._id,
      project,
      parsedMemories,
    });

    res.status(202).json({
      message: 'Memories parsed and embedding jobs queued',
      parsedCount: parsedMemories.length,
      queuedCount: result.queuedCount,
      memoryIds: result.memoryIds,
      embeddingJobIds: result.embeddingJobIds,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listProjectMemories = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memories = await ProjectMemory.find({
      projectId: project._id,
      userId: req.user._id,
    })
      .select('-embedding')
      .sort({ createdAt: -1 });

    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const retryFailedEmbeddings = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const failedJobs = await EmbeddingJob.find({
      projectId: project._id,
      userId: req.user._id,
      status: 'failed',
    });

    if (failedJobs.length === 0) {
      return res.json({
        message: 'No failed embedding jobs to retry',
        queuedCount: 0,
      });
    }

    await removeEmbeddingJobs(failedJobs.map((job) => job._id));

    await EmbeddingJob.updateMany(
      { _id: { $in: failedJobs.map((job) => job._id) } },
      {
        $set: {
          status: 'pending',
          attempts: 0,
          errorMessage: '',
          processedAt: null,
        },
      }
    );

    await ProjectMemory.updateMany(
      {
        _id: { $in: failedJobs.map((job) => job.memoryId) },
        userId: req.user._id,
        projectId: project._id,
      },
      { $set: { embeddingStatus: 'pending' } }
    );

    const refreshedJobs = await EmbeddingJob.find({
      _id: { $in: failedJobs.map((job) => job._id) },
    });

    await enqueueEmbeddingJobs(refreshedJobs);

    res.json({
      message: 'Failed embedding jobs requeued',
      queuedCount: refreshedJobs.length,
      embeddingJobIds: refreshedJobs.map((job) => job._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmbeddingStatus = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memoryStatuses = await ProjectMemory.aggregate([
      {
        $match: {
          projectId: project._id,
          userId: req.user._id,
        },
      },
      {
        $group: {
          _id: '$embeddingStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const jobStatuses = await EmbeddingJob.aggregate([
      {
        $match: {
          projectId: project._id,
          userId: req.user._id,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const toStatusMap = (statuses) => statuses.reduce((acc, item) => ({
      ...acc,
      [item._id]: item.count,
    }), {});

    const memories = toStatusMap(memoryStatuses);
    const jobs = toStatusMap(jobStatuses);
    const totalMemories = Object.values(memories).reduce((sum, count) => sum + count, 0);

    res.json({
      projectId: project._id,
      memories: {
        pending: memories.pending || 0,
        processing: memories.processing || 0,
        done: memories.done || 0,
        failed: memories.failed || 0,
        total: totalMemories,
      },
      jobs: {
        pending: jobs.pending || 0,
        processing: jobs.processing || 0,
        done: jobs.done || 0,
        failed: jobs.failed || 0,
      },
      ready: totalMemories > 0 && totalMemories === (memories.done || 0),
      hasFailures: (memories.failed || 0) > 0 || (jobs.failed || 0) > 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  listProjects,
  getProject,
  deleteProject,
  uploadProjectFile,
  ingestProjectMemories,
  listProjectMemories,
  retryFailedEmbeddings,
  getEmbeddingStatus,
};
