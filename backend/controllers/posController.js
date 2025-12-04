const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Sale = require('../models/Sale');
const User = require('../models/User');

// @desc    Process POS sale/checkout
// @route   POST /api/pos/checkout
// @access  Private (Cashier/Admin)
exports.checkout = async (req, res) => {
  try {
    const { items, paymentMethod, notes } = req.body;
    const userId = req.user._id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Validate and prepare items
    let total = 0;
    const processedItems = [];

    for (const item of items) {
      // Get product details
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // Check if quantity is available
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Available: ${product.quantity}`
        });
      }

      // Calculate item total
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        itemTotal: itemTotal,
        product: product
      });
    }

    // Calculate totals (2% tax)
    const subtotal = total;
    const taxRate = 0.02; // 2% tax
    const tax = subtotal * taxRate;
    const finalTotal = subtotal + tax;

    // Create transactions for each item and update product quantities
    const transactionIds = [];

    for (const item of processedItems) {
      // Update product quantity
      item.product.quantity -= item.quantity;
      await item.product.save();

      // Create transaction record
      const transaction = await Transaction.create({
        productId: item.productId,
        type: 'out', // Sale = out
        quantity: item.quantity,
        notes: notes || `POS Sale - Payment: ${paymentMethod}`,
        userId: userId
      });

      transactionIds.push(transaction._id);
    }

    // Create Sale record
    const sale = await Sale.create({
      items: processedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        itemTotal: item.itemTotal
      })),
      subtotal,
      tax,
      total: finalTotal,
      paymentMethod,
      cashier: userId,
      transactionIds,
      notes: notes || `POS Sale - Payment: ${paymentMethod}`
    });

    // Return receipt (include sale id)
    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: {
        receipt: {
          saleId: sale._id,
          transactionIds: transactionIds,
          items: processedItems.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            itemTotal: item.itemTotal.toFixed(2)
          })),
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: finalTotal.toFixed(2),
          paymentMethod: paymentMethod,
          cashier: `${req.user.firstName} ${req.user.lastName}`,
          date: sale.date ? sale.date.toISOString() : new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing sale',
      error: error.message
    });
  }
};

// @desc    Get sales history for cashier
// @route   GET /api/pos/sales
// @access  Private (Cashier/Admin)
exports.getSalesHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0 } = req.query;

    // Get transactions created by this user (cashier)
    const transactions = await Transaction.find({ userId })
      .populate('productId', 'name sku price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      }
    });
  } catch (error) {
    console.error('Get sales history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales history',
      error: error.message
    });
  }
};

// @desc    Get daily sales report
// @route   GET /api/pos/daily-report
// @access  Private (Cashier/Admin)
exports.getDailyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all transactions for today
    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    })
      .populate('productId', 'name price');

    // Calculate totals
    let totalItems = 0;
    let totalRevenue = 0;

    transactions.forEach(trans => {
      if (trans.type === 'out') { // Only count sales (out)
        totalItems += trans.quantity;
        totalRevenue += trans.quantity * trans.productId.price;
      }
    });

    const tax = totalRevenue * 0.02; // 2% tax
    const netRevenue = totalRevenue + tax;

    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        totalTransactions: transactions.length,
        totalItems: totalItems,
        subtotal: totalRevenue.toFixed(2),
        tax: tax.toFixed(2),
        total: netRevenue.toFixed(2),
        transactions: transactions
      }
    });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating daily report',
      error: error.message
    });
  }
};
