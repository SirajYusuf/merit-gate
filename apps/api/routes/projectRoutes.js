const express = require('express');
const {
  createProject,
  deleteProject,
  getEmbeddingStatus,
  getProject,
  ingestProjectMemories,
  listProjectMemories,
  listProjects,
  retryFailedEmbeddings,
  uploadProjectFile,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { uploadProjectFile: uploadProjectFileMiddleware } = require('../services/uploadService');
const {
  createProjectValidator,
  ingestProjectValidator,
  projectIdValidator,
} = require('../validators/projectValidators');

const router = express.Router();

router.use(protect);

const handleProjectFileUpload = (req, res, next) => {
  uploadProjectFileMiddleware.single('file')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return next();
  });
};

router.post('/', createProjectValidator, validateRequest, createProject);
router.get('/', listProjects);
router.post('/upload', handleProjectFileUpload, uploadProjectFile);
router.get('/:id', projectIdValidator, validateRequest, getProject);
router.delete('/:id', projectIdValidator, validateRequest, deleteProject);
router.post('/:id/ingest', ingestProjectValidator, validateRequest, ingestProjectMemories);
router.get('/:id/memories', projectIdValidator, validateRequest, listProjectMemories);
router.get('/:id/embedding-status', projectIdValidator, validateRequest, getEmbeddingStatus);
router.post('/:id/embedding-retry', projectIdValidator, validateRequest, retryFailedEmbeddings);

module.exports = router;
