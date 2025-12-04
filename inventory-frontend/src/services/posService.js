import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const posService = {
  // Process checkout
  checkout: async (items, paymentMethod, notes = '') => {
    const response = await api.post(`${API_ENDPOINTS.API_BASE}/pos/checkout`, {
      items,
      paymentMethod,
      notes
    });
    return response.data;
  },

  // Get sales history for current cashier
  getSalesHistory: async (limit = 20, skip = 0) => {
    const response = await api.get(`${API_ENDPOINTS.API_BASE}/pos/sales`, {
      params: { limit, skip }
    });
    return response.data;
  },

  // Get daily sales report
  getDailyReport: async () => {
    const response = await api.get(`${API_ENDPOINTS.API_BASE}/pos/daily-report`);
    return response.data;
  }
};
