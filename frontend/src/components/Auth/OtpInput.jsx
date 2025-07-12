import React, { useRef } from "react";
import styles from "./OtpInput.module.css";

const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/, ""); // allow only digits
    if (val) {
      const newOtp = value.split("");
      newOtp[index] = val;
      onChange(newOtp.join(""));
      if (index < length - 1) inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={styles.otpContainer}>
      {[...Array(length)].map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={styles.otpInput}
        />
      ))}
    </div>
  );
};

export default OtpInput;
