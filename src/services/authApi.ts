import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (identifier: string, password: string) => {
  try {
    const response = await authApi.post('/auth/local', {
      identifier,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || error.message;
  }
};

export const setAuthToken = (token: string) => {
  if (token) {
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  delete authApi.defaults.headers.common['Authorization'];
  localStorage.removeItem('auth_token');
};

export default authApi;
