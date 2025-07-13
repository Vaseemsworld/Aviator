import axios from "axios";
import api from "../api";

export const fetchBalance = async ({ token }) => {
  try {
    const res = await api.get("/wallet/balance/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.balance;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    console.error("Error fetching balance:", err);
    return null;
  }
};
