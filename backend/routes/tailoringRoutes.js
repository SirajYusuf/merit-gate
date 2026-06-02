const express = require('express');
const {
  createTailoringRun,
  getTailoringRun,
  listTailoringRuns,
} = require('../controllers/tailoringController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  listTailoringRunsValidator,
  runTailoringValidator,
  tailoringRunIdValidator,
} = require('../validators/tailoringValidators');

const router = express.Router();

router.use(protect);

router.post('/run', runTailoringValidator, validateRequest, createTailoringRun);
router.get('/runs', listTailoringRunsValidator, validateRequest, listTailoringRuns);
router.get('/runs/:id', tailoringRunIdValidator, validateRequest, getTailoringRun);

module.exports = router;
