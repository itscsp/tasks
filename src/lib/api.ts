import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://kaasu-wp.local/wp-json/csp/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('csp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for handling token expiration and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('csp_refresh_token');

      if (refreshToken) {
        try {
          // Attempt to get new tokens using the refresh token
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (response.data.token) {
            const { token, refresh_token } = response.data;
            
            // Save new tokens
            localStorage.setItem('csp_token', token);
            localStorage.setItem('csp_refresh_token', refresh_token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token expired or invalid, logout user
          localStorage.removeItem('csp_token');
          localStorage.removeItem('csp_refresh_token');
          localStorage.removeItem('csp_user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
