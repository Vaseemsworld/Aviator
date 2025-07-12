import React, { useState, useRef } from "react";
import styles from "./Auth.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { isValidPhone } from "../../utils/validation";
import api from "../../api";

const Register = ({ onClose, openLoginModal, onLoginSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.phone.trim()) newErrors.phone = "Mobile Number is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const registerRes = await api.post("/register/", {
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
      });
      if (registerRes.status == 201) {
        try {
          const loginRes = await api.post("/login/", {
            phone: formData.phone,
            password: formData.password,
          });
          const { token, refresh } = loginRes.data;
          login(token, refresh);
          onLoginSuccess?.(loginRes.data);
          onClose();
          toast.success("Registration successful! You are now logged in.");
          setFormData({
            username: "",
            phone: "",
            password: "",
            confirmPassword: "",
          });
        } catch (error) {
          setErrors({ general: "Login Failed. Please try again." });
          toast.error("Login failed. Please try again.");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setFormData({
          username: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({ phone: "This phone number is already registered." });
        toast.error("This phone number is already registered.");
      } else {
        setErrors({ general: "An error occurred. Please try again." });
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div
            className={`${styles.inputGroup} ${
              errors.username ? styles.error : ""
            }`}
          >
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.username && (
              <span className={styles.errorText}>{errors.username}</span>
            )}
          </div>

          <div
            className={`${styles.inputGroup} ${
              errors.phone ? styles.error : ""
            }`}
          >
            <input
              type="tel"
              name="phone"
              placeholder="Phone No."
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.phone && (
              <span className={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div
            className={`${styles.inputGroup} ${
              errors.password ? styles.error : ""
            }`}
          >
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
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div
            className={`${styles.inputGroup} ${
              errors.confirmPassword ? styles.error : ""
            }`}
          >
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          <div className={styles.switchLink}>
            Already have an account?{" "}
            <span
              onClick={() => {
                onClose();
                openLoginModal();
              }}
            >
              Login
            </span>
          </div>
        </form>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Register;
