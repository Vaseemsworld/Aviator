import React, { useState, useRef, useEffect } from "react";
import styles from "./Auth.module.css";
import { toast } from "react-toastify";
import { isValidPhone } from "../../utils/validation";

const ForgotPassword = ({ onClose }) => {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const inputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  const handleOtpChange = (val, index) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next
    if (val && index < 5) inputs.current[index + 1].focus();

    // Auto-submit if complete
    if (newOtp.every((digit) => digit)) {
      handleSubmit();
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    // call your backend here to resend OTP
    toast.success("OTP sent!");
    setTimer(30); // 30 sec countdown
  };

  const handleSubmit = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      toast.error("Please enter complete OTP.");
      return;
    }
    // TODO: call backend API to verify OTP and reset password
    toast.success("Password reset successful!");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.loginBox}>
        <h2>Reset Password</h2>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={styles.input}
        />

        <div className={styles.otpWrapper}>
          {otp.map((val, index) => (
            <input
              className={styles.otpInput}
              key={index}
              type="text"
              maxLength="1"
              value={val}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              ref={(el) => (inputs.current[index] = el)}
            />
          ))}
          <button
            className={styles.otpButton}
            onClick={handleResend}
            disabled={timer > 0 && !isValidPhone(phone)}
          >
            {timer > 0 ? `${timer}s` : " OTP"}
          </button>
        </div>

        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={
            !isValidPhone(phone) || !newPassword || otp.some((digit) => !digit)
          }
        >
          Confirm
        </button>

        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
