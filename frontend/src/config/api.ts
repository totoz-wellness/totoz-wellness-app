import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      const errorMessage = error.response.data?.message;
      
      if (errorMessage === 'Token expired' || errorMessage === 'Invalid token') {
        // Clear stored token and user data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        
        // Optional: Show notification
        console.warn("Session expired. Please log in again.");
      }
    }
    
    // Also handle 401 (Unauthorized) if needed
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.message;
      
      if (errorMessage === 'Access token required' || errorMessage === 'User not found') {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;