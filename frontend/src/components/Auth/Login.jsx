import React, { useState } from "react";
import styles from "./Auth.module.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ openRegisterModal }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/users/login/", {
        username,
        password,
      });
      setMessage(response.data.message || "Login successful");
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.error || "An error occurred. Try again.");
      } else {
        setMessage("Please check your internet connection and try again.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleLogin}>
        <div className={styles.usernameContainer}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
        </div>

        <br />
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <span
            className={styles.eyeIcons}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <br />
        <h4 className={styles.forgotPassword}>Forgot Password ?</h4>
        <button className={`${styles.btn} ${styles.loginBtn}`} type="submit">
          Login
        </button>
        {message && (
          <p
            style={{ color: message.includes("successful") ? "green" : "red" }}
          >
            {message}
          </p>
        )}
        <div className={styles.loginFooter}>
          <h4>Not Registered Yet?</h4>
          <button
            className={`${styles.btn} ${styles.registerBtn}`}
            type="button"
            onClick={(e) => {
              openRegisterModal();
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
