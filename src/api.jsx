import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and hasn't been retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }
        
        // Try to refresh the token
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        
        // If token refresh is successful
        if (response.status === 200) {
          // Update tokens in localStorage
          localStorage.setItem("token", response.data.access);
          
          // Update the authorization header
          originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is expired or invalid, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}token/`, {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
    }
    return response.data;
  },
  
  register: async (userData) => {
    return await axios.post(`${API_URL}users/register/`, userData);
  },
  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
  
  getCurrentUser: async () => {
    return await api.get("users/me/");
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default api;