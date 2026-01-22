import axios from "axios";

export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_ENDPOINTS: {
    AUTH: {
      GOOGLE: "/auth/google",
      LOGOUT: "/auth/logout",
      CHECK: "/auth/check",
      TOKEN: "/auth/token",
    },
    USER: {
      PROFILE: "/user/profile",
    },
    EXERCISE: {
      BASE: "/exercise",
    },
    WORKOUT: {
      BASE: "/workout",
      USER_WORKOUTS: "/workout/user",
    },
    SET: {
      BASE: "/set",
      WORKOUT_SETS: "/set/workout",
    }
  },
} as const;

export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default config;