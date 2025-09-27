// src/api/axiosInstance.js
import axios from "axios";

const envBase = (import.meta.env?.VITE_API_URL || "").replace(/\/+$/, "");
const baseURL =
  envBase || (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status || 0;
    const data = err.response?.data || {};
    const message =
      data?.message || data?.error || err.message || "Request failed";
    const details = data?.errors || null;
    return Promise.reject({ status, message, details, raw: err });
  }
);

export default api;