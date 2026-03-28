const express = require('express');
const router = express.Router();
const { calculateDecision } = require('../controllers/decisionController');

router.post('/calculate', calculateDecision);

module.exports = router;
