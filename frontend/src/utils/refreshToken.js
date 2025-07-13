import axios from "axios";

export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await axios.post("http://localhost:8000/api/token/refresh/", {
      refresh,
    });

    const newAccess = res.data.access;
    // localStorage.setItem(, newAccess);
    return newAccess;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem();
    localStorage.removeItem("refresh");
    return null;
  }
};
