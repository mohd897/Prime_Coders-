const express = require('express');
const router = express.Router();
const { chatInteraction, dashboardAiInteraction } = require('../controllers/chatController');

router.post('/chat', chatInteraction);
router.post('/dashboard-ai', dashboardAiInteraction);

module.exports = router;
