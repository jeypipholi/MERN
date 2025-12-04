const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMonthlyReport,
  getInventoryStatus,
  getStockReport,
  getDailySalesReport
} = require('../controllers/reportController');

const router = express.Router();

// Admin only
router.use(protect);
router.use(authorize('admin'));

// Monthly sales
router.get('/monthly', getMonthlyReport);

// Daily sales (wrapper)
router.get('/daily', getDailySalesReport);

// Sales by period (daily/weekly/monthly)
router.get('/sales', require('../controllers/reportController').getSalesByPeriod);

// Inventory status
router.get('/inventory-status', getInventoryStatus);

// Stock report
router.get('/stock-report', getStockReport);

module.exports = router;
