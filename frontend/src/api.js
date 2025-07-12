import axios from "axios";
import { jwtDecode } from "jwt-decode";

const baseURL = "http://localhost:8000/";
const api = axios.create({ baseURL });

api.interceptors.request.use(
  async (config) => {
    let access = localStorage.getItem("access");
    let refresh = localStorage.getItem("refresh");

    try {
      if (access) {
        const decoded = jwtDecode(access);
        const now = Date.now() / 1000;

        if (decoded.exp < now && refresh) {
          const res = await axios.post(`${baseURL}/token/refresh/`, {
            refresh,
          });

          access = res.data.access;
          localStorage.setItem("access", access);

          if (res.data.refresh) {
            refresh = res.data.refresh;
            localStorage.setItem("refresh", refresh);
          }
        }

        config.headers.Authorization = `Bearer ${access}`;
      }
      return config;
    } catch (err) {
      console.error("Token refresh failed:", err);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "http://localhost:5173/";
      return Promise.reject(err);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
