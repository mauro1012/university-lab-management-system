const express = require('express');
const health = require('./health');

const router = express.Router();

router.get('/health', health);

module.exports = router;
