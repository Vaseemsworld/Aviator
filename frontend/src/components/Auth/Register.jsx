import React, { useState } from "react";
import styles from "./Auth.module.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/users/register/",
        {
          username,
          email,
          password,
        }
      );
      setMessage(response.data.message || "User created successfully");
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
      <h1 className={styles.title}>Register</h1>
      <form onSubmit={handleRegister}>
        <div className={styles.usernameContainer}>
          <input
            type="text"
            name="username"
            placeholder="Username*"
            required
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
        </div>
        <br />
        <div className={styles.emailContainer}>
          <input
            type="email"
            name="email"
            placeholder="Email*"
            required
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>
        <br />
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password*"
            required
            minLength={6}
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
        <button className={`${styles.btn} ${styles.registerBtn}`} type="submit">
          Register
        </button>
      </form>
      {message && (
        <p
          style={{ color: message.includes("successfully") ? "green" : "red" }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
