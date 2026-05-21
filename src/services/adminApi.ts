import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const safeRequest = async (promise: Promise<any>) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Skills Admin APIs
export const adminSkillApi = {
  async getPendingSkills() {
    return safeRequest(
      apiClient.get('/skills', {
        params: { filters: { status: { $eq: 'pending' } }, populate: '*' },
      })
    );
  },

  async approveSkill(id: string) {
    return safeRequest(apiClient.put(`/skills/${id}/approve`));
  },

  async rejectSkill(id: string, reason: string) {
    return safeRequest(apiClient.put(`/skills/${id}/reject`, { data: { reason } }));
  },
};

// Categories Admin APIs
export const adminCategoryApi = {
  async getAll() {
    return safeRequest(apiClient.get('/categories', { params: { populate: '*' } }));
  },
};

// Base Skills Admin APIs
export const adminBaseSkillApi = {
  async getAll() {
    return safeRequest(apiClient.get('/base-skills', { params: { populate: '*' } }));
  },
};

// Reports Admin APIs
export const adminReportApi = {
  async getAll() {
    return safeRequest(apiClient.get('/reports', { params: { populate: '*' } }));
  },

  async updateStatus(id: string, status: string) {
    return safeRequest(apiClient.put(`/reports/${id}/status`, { data: { status } }));
  },
};

export default apiClient;
