import api from './api';

export const posService = {
  // Process checkout
  checkout: async (items, paymentMethod, notes = '') => {
    const response = await api.post(`/pos/checkout`, {
      items,
      paymentMethod,
      notes
    });
    return response.data;
  },

  // Get sales history for current cashier
  getSalesHistory: async (limit = 20, skip = 0) => {
    const response = await api.get(`/pos/sales`, {
      params: { limit, skip }
    });
    return response.data;
  },

  // Get daily sales report
  getDailyReport: async () => {
    const response = await api.get(`/pos/daily-report`);
    return response.data;
  }
};
