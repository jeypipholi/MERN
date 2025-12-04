import api from './api';

export const reportService = {
  getDaily: async () => {
    const res = await api.get('/admin/reports/daily');
    return res.data;
  },

  getMonthly: async (month, year) => {
    const res = await api.get('/admin/reports/monthly', { params: { month, year } });
    return res.data;
  },

  // Get sales by period: period = daily|weekly|monthly
  getSales: async (period = 'daily', date) => {
    const res = await api.get('/admin/reports/sales', { params: { period, date } });
    return res.data;
  },

  getInventoryStatus: async () => {
    const res = await api.get('/admin/reports/inventory-status');
    return res.data;
  },

  getStockReport: async (threshold = 5) => {
    const res = await api.get('/admin/reports/stock-report', { params: { threshold } });
    return res.data;
  }
};
