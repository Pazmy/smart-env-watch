const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/reportController');

// Multer config: memory storage (RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
// POST /api/reports - Create a new report with image
router.post('/', upload.single('image'), reportController.createReport);

module.exports = router;
