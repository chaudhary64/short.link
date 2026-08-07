import axios from "axios";
import { store } from "../store/store";
import { setToken, removeToken } from "../features/auth/authSlice";
import { removeUserInfo } from "../features/user/userSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      !originalRequest.headers?.Authorization
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      originalRequest._retry = true;
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`;
      const { data } = await axios.get(refreshEndpoint, {
        withCredentials: true,
      });

      const newToken = data.accessToken;
      if (!newToken) {
        throw new Error("No access token in refresh response");
      }

      store.dispatch(setToken(newToken));
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(removeToken());
      store.dispatch(removeUserInfo());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
