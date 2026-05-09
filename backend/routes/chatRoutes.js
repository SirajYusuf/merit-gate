const express = require('express');
const { chatWithLLM, getHistory, getChatLogDetails } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', chatWithLLM);
router.get('/history', getHistory);
router.get('/history/:id', getChatLogDetails);

module.exports = router;
