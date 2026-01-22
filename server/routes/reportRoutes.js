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

// GET /api/reports - Get All Reports (Admin)
router.get('/', reportController.getAllReports);

// PATCH /api/reports/:id/status - Update Report Status
router.patch('/:id/status', reportController.updateReportStatus);

// GET /api/reports/:ticketId - Check status by Ticket ID
router.get('/:ticketId', reportController.getReportByTicketId);

module.exports = router;
