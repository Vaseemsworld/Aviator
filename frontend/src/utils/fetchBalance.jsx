import axios from "axios";

export const fetchBalance = async ({ token }) => {
  try {
    const res = await axios.get("http://localhost:8000/wallet/balance/", {
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
