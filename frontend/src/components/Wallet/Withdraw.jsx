import React, { useEffect, useState, useRef } from "react";
import classnames from "classnames";
import styles from "./Wallet.module.css";
import useClickOutside from "../../utils/useClickOutside";
import Wallet from "./Wallet";
import api from "../../api";
import { toast } from "react-toastify";

const inputGroups = [
  {
    section: "Bank Details",
    fields: [
      {
        name: "accountNumber",
        type: "text",
        placeholder: "Account Number",
        label: "Account Number",
        icon: "🏦",
      },
      {
        name: "ifscCode",
        type: "text",
        placeholder: "IFSC Code",
        label: "IFSC Code",
        icon: "🔤",
      },
      {
        name: "accountHolderName",
        type: "text",
        placeholder: "Account Holder Name",
        label: "Account Holder Name",
        icon: "🧑",
      },
      {
        name: "bankName",
        type: "select",
        placeholder: "Select your bank",
        label: "Bank Name",
        icon: "🏦",
        options: [
          "State Bank of India (SBI)",
          "HDFC Bank",
          "ICICI Bank",
          "Axis Bank",
          "Bank of Baroda (BOB)",
          "Canara Bank",
          "Punjab National Bank (PNB)",
        ],
      },
    ],
  },
  {
    section: "Amount",
    fields: [
      {
        name: "amount",
        type: "number",
        placeholder: "Min 300 - Max 50000",
        label: "Amount",
        icon: "💸",
      },
    ],
  },
];

const Withdraw = ({ onClose }) => {
  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    amount: "",
    bankName: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setFormErrors({ ...formErrors, [field]: "" });
  };

  const validateField = (field) => {
    let error = "";
    const value = formData[field].trim();
    switch (field) {
      case "accountNumber":
        if (!value) error = "Required";
        break;
      case "ifscCode":
        if (!value) error = "Required";
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()))
          error = "Invalid IFSC Code";
        break;
      case "accountHolderName":
        if (!value) error = "Required";
        break;
      case "amount":
        const amt = Number(value);
        if (!amt || amt < 300 || amt > 50000)
          error = "Must be between ₹300 and ₹50,000";
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key);
      if (err) errors[key] = err;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access");
      const res = await api.post(
        "/wallet/withdraw/",
        {
          amount: Number(formData.amount),
          bankDetails: {
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            accountHolderName: formData.accountHolderName,
            bankName: formData.bankName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("success");
      setFormData({
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        amount: "",
      });
      setFormErrors({});
    } catch (error) {
      console.error(error);
      setMessage("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wallet title={"Withdraw Funds"} onClose={onClose}>
      <div className={styles.withdrawFormWrapper}>
        {inputGroups.map(({ section, fields }) => (
          <div key={section} className={styles.inputGroup}>
            <h4 className={styles.sectionTitle}>{section}</h4>
            {fields.map(
              ({ name, type, placeholder, label, icon, options }, index) => (
                <div key={name} className={styles.inputRow}>
                  <label
                    htmlFor={name}
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                      clip: "rect(0 0 0 0)",
                    }}
                  >
                    {label}
                  </label>

                  {icon && <span className={styles.iconLabel}>{icon}</span>}
                  {type === "select" ? (
                    <select
                      id={name}
                      className={classnames(styles.input, {
                        [styles.inputError]: formErrors[name],
                      })}
                      value={formData[name]}
                      onChange={handleChange(name)}
                      onBlur={() => validateField(name)}
                    >
                      <option value="" disabled>
                        {placeholder || "Select an option"}
                      </option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={name}
                      type={type}
                      placeholder={placeholder}
                      autoFocus={section === "Bank Details" && index === 0}
                      className={classnames(styles.input, {
                        [styles.inputError]: formErrors[name],
                      })}
                      value={formData[name]}
                      onChange={handleChange(name)}
                      onBlur={() => validateField(name)}
                    />
                  )}

                  {formErrors[name] && (
                    <span className={styles.error}>{formErrors[name]}</span>
                  )}
                </div>
              )
            )}
          </div>
        ))}
        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Withdraw"}
        </button>
      </div>
      {message === "success" && (
        <div className={styles.success}>
          Withdraw request submitted successfully.
        </div>
      )}
      {message === "failed" && (
        <div className={styles.failed}>Withdraw request failed.</div>
      )}

      <div className={styles.footer}>
        <span className={styles.footerText}>
          <b>Note:</b> Please carefully review your details before withdrawing —
          incorrect information may result in lost funds.
        </span>
      </div>
    </Wallet>
  );
};

export default Withdraw;
