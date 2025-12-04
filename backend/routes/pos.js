const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  checkout,
  getSalesHistory,
  getDailyReport
} = require('../controllers/posController');

const router = express.Router();

// Protect all POS routes - user, cashier, and admin can access
router.use(protect);
router.use(authorize('user', 'cashier', 'admin'));

// POST checkout
router.post('/checkout', checkout);

// GET sales history
router.get('/sales', getSalesHistory);

// GET daily report
router.get('/daily-report', getDailyReport);

module.exports = router;
