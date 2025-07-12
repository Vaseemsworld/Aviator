import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import api from "../api";
import { fetchBalance } from "../utils/fetchBalance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const decodeToken = (token) => {
    try {
      if (!token || typeof token !== "string" || token === "undefined")
        return null;
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("access");
        return null;
      }
      return { token, ...decoded };
    } catch (err) {
      console.error("Token decoding failed:", err);
      return null;
    }
  };

  const tryTokenRefresh = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    try {
      const res = await api.post("/token/refresh/", { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("access", newAccess);

      if (res.data.refresh) {
        localStorage.setItem("refresh", res.data.refresh);
      }

      return newAccess;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  };

  const initializeUser = async (token) => {
    let decodedUser = decodeToken(token);
    if (!decodedUser) {
      const newAccess = await tryTokenRefresh();
      decodedUser = decodeToken(newAccess);
      if (!decodedUser) throw new Error("Session expired");
      token = newAccess;
    }
    const balance = await fetchBalance({ token });
    setUser({ ...decodedUser, balance });
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access");
      try {
        if (token) {
          await initializeUser(token);
        }
      } catch (err) {
        toast.error("Session expired. Please log in again.");
        logout();
      } finally {
        setAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (token, refresh) => {
    localStorage.setItem("access", token);
    localStorage.setItem("refresh", refresh);

    await initializeUser(token);
  };

  const logout = async () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    window.location.href = "http://localhost:5173/";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, authLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
