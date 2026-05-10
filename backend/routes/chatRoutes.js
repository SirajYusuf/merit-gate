const express = require('express');
const { chatWithLLM, getHistory, getChatLogDetails } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  chatValidator,
  historyValidator,
  chatLogDetailsValidator,
} = require('../validators/chatValidators');

const router = express.Router();

router.use(protect);

router.post('/', chatValidator, validateRequest, chatWithLLM);
router.get('/history', historyValidator, validateRequest, getHistory);
router.get('/history/:id', chatLogDetailsValidator, validateRequest, getChatLogDetails);

module.exports = router;
