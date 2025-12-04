const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// @desc Get monthly sales report
// @route GET /api/admin/reports/monthly
// @access Private (Admin)
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1); // month 1-12
    const y = parseInt(year) || now.getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    // Aggregate sales (from Sale collection)
    const sales = await Sale.find({ date: { $gte: start, $lt: end } });

    let totalItems = 0;
    let subtotal = 0;

    sales.forEach(s => {
      s.items.forEach(it => {
        totalItems += it.quantity;
        subtotal += it.itemTotal;
      });
    });

    const tax = subtotal * 0.02;
    const total = subtotal + tax;

    res.status(200).json({
      success: true,
      data: {
        month: m,
        year: y,
        totalSales: sales.length,
        totalItems,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        sales
      }
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ success: false, message: 'Error generating monthly report', error: error.message });
  }
};

// @desc Get inventory status (all products)
// @route GET /api/admin/reports/inventory-status
// @access Private (Admin)
exports.getInventoryStatus = async (req, res) => {
  try {
    const products = await Product.find().select('name sku category quantity price updatedAt createdAt');

    res.status(200).json({
      success: true,
      data: {
        count: products.length,
        products
      }
    });
  } catch (error) {
    console.error('Inventory status error:', error);
    res.status(500).json({ success: false, message: 'Error fetching inventory status', error: error.message });
  }
};

// @desc Get stock report (low stock and out of stock)
// @route GET /api/admin/reports/stock-report
// @access Private (Admin)
exports.getStockReport = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;

    const lowStock = await Product.find({ quantity: { $gt: 0, $lte: threshold } }).select('name sku category quantity price');
    const outOfStock = await Product.find({ quantity: { $eq: 0 } }).select('name sku category quantity price');

    res.status(200).json({
      success: true,
      data: {
        threshold,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStock,
        outOfStock
      }
    });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ success: false, message: 'Error generating stock report', error: error.message });
  }
};

// @desc Get daily sales report (wrapper) - re-use transaction based logic
// @route GET /api/admin/reports/daily
// @access Private (Admin)
exports.getDailySalesReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await Transaction.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('productId', 'name price');

    let totalItems = 0;
    let totalRevenue = 0;

    transactions.forEach(trans => {
      if (trans.type === 'out') {
        totalItems += trans.quantity;
        totalRevenue += trans.quantity * trans.productId.price;
      }
    });

    const tax = totalRevenue * 0.02;
    const netRevenue = totalRevenue + tax;

    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        totalTransactions: transactions.length,
        totalItems,
        subtotal: totalRevenue.toFixed(2),
        tax: tax.toFixed(2),
        total: netRevenue.toFixed(2),
        transactions
      }
    });
  } catch (error) {
    console.error('Daily sales report error:', error);
    res.status(500).json({ success: false, message: 'Error generating daily sales report', error: error.message });
  }
};

// @desc Get sales by period (daily, weekly, monthly)
// @route GET /api/admin/reports/sales
// @access Private (Admin)
exports.getSalesByPeriod = async (req, res) => {
  try {
    const { period = 'daily', date } = req.query; // date optional (ISO)
    const now = date ? new Date(date) : new Date();

    let start;
    let end;

    if (period === 'daily') {
      start = new Date(now);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (period === 'weekly') {
      // week starting Monday
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7; // 0->6 (Sunday->6)
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    } else if (period === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid period' });
    }

    const sales = await Sale.find({ date: { $gte: start, $lt: end } }).populate('cashier', 'firstName lastName');

    // aggregate totals
    let subtotal = 0;
    let totalItems = 0;

    sales.forEach(s => {
      s.items.forEach(it => {
        subtotal += it.itemTotal;
        totalItems += it.quantity;
      });
    });

    const tax = subtotal * 0.02;
    const total = subtotal + tax;

    res.status(200).json({
      success: true,
      data: {
        period,
        start: start.toISOString(),
        end: end.toISOString(),
        count: sales.length,
        totalItems,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        sales
      }
    });
  } catch (error) {
    console.error('Sales by period error:', error);
    res.status(500).json({ success: false, message: 'Error generating sales report', error: error.message });
  }
};
