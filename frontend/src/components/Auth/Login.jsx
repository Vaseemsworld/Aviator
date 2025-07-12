import React, { useState } from "react";
import styles from "./Auth.module.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { isValidPhone } from "../../utils/validation";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const Login = ({
  onClose,
  openRegisterModal,
  onLoginSuccess,
  setShowPasswordModal,
}) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.phone || !formData.password) {
      setError("Mobile Number and password are required.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError("Invalid phone number.");
      return;
    }
    try {
      const response = await api.post("/login/", {
        phone: formData.phone,
        password: formData.password,
      });

      if (response.data.access) {
        await login(response.data.access, response.data.refresh);
        onLoginSuccess?.(response.data);
        onClose();
        toast.success("Login successful!");
      } else {
        setError("Login failed. Try again.");
        toast.error("Login failed. Try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setFormData({ phone: "", password: "" });
      setError("Invalid credentials. Try Again!");
      toast.error("Invalid credentials. Try Again!");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className={`${styles.inputGroup} ${error ? styles.error : ""}`}>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={`${styles.inputGroup} ${error ? styles.error : ""}`}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className={styles.inlineRow}>
            <span className={styles.errorText}>{error || "\u00A0"}</span>

            <div className={styles.forgotPassword}>
              {/* <span onClick={() => setShowPasswordModal(true)}>
                Forgot Password?
              </span> */}
              <span>Forgot Password?</span>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={
              isLoading || !isValidPhone(formData.phone) || !formData.password
            }
          >
            {isLoading ? "Login..." : "Login"}
          </button>
        </form>
        <div className={styles.switchLink}>
          Don’t have an account?{" "}
          <span onClick={openRegisterModal}>Register</span>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Login;
