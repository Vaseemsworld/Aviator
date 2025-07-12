import React, { useEffect, useState, useRef } from "react";
import classnames from "classnames";
import styles from "./Wallet.module.css";
import Wallet from "./Wallet";
import UpiIcon from "../../assets/upi-icon.avif";
import PaytmLogo from "../../assets/paytm-logo.avif";
import { SiPhonepe, SiGooglepay } from "react-icons/si";
import useClickOutside from "../../utils/useClickOutside";
import api from "../../api";

const Deposit = ({ onClose }) => {
  const modalRef = useRef(null);
  useClickOutside(modalRef, onClose);

  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(false);

  const paymentMethods = [
    { name: "UPI", icon: <img src={UpiIcon} alt="Upi Icon" /> },
    { name: "Phone Pe", icon: <SiPhonepe /> },
    { name: "Paytm", icon: <img src={PaytmLogo} alt="Paytm Logo" /> },
    { name: "Google Pay", icon: <SiGooglepay /> },
  ];

  const isSelected = (amt) => Number(depositAmount) === amt;
  const amountPreset = [100, 500, 1000, 10000];

  const generateUPILink = (amount) => {
    const txtId = `TXN${Date.now()}`;
    const upiLink =
      `upi://pay?pa=7073237376@ibl&pn=phonpe&mc=0000&tid=${txtId}` +
      `&tr=${txtId}&tn=Wallet+Deposit&am=${amount}&cu=INR`;
    return upiLink;
  };

  const handleSubmit = async () => {
    const amountNum = Number(depositAmount);
    if (isNaN(amountNum) || amountNum < 100 || amountNum > 50000) {
      setFormError("Enter amount between ₹100 and ₹50,000");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    // 1. Generate UPI transaction ID
    const txnId = `TXN${Date.now()}`;

    // 2. Generate UPI URL
    const upiUrl = `upi://pay?pa=7073237376@ibl&pn=phonpe&mc=0000&tid=${txnId}&tr=${txnId}&tn=Wallet+Deposit&am=${amountNum}&cu=INR`;

    // 3. OPTIONAL: Log intent to backend BEFORE redirect (optional but useful)
    try {
      const token = localStorage.getItem("access");
      await api.post(
        "/wallet/deposit/",
        {
          amount: amountNum,
          paymentInfo: {
            method: selectedMethod,
            txnId: txnId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to log deposit:", err);
      setFormError("Failed to log deposit. Try again.");
      setIsSubmitting(false);
      return;
    }

    // 4. Redirect to UPI app
    window.location.href = upiUrl;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);

    const amountNum = Number(value);
    const isValid = !isNaN(amountNum) && amountNum >= 100 && amountNum <= 50000;

    setIsValidAmount(isValid);
    if (isValid) {
      setFormError("");
    }
  };

  return (
    <>
      <Wallet title={"Deposit Funds"} onClose={onClose}>
        <div className={classnames(styles.paymentOptions, styles.p)}>
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className={classnames(styles.p1, styles.paymentOption, {
                [styles.selectedPayment]: selectedMethod === method.name,
              })}
              onClick={() => setSelectedMethod(method.name)}
            >
              <i className={styles.icon}>{method.icon}</i>
              <span className={styles.name}>{method.name}</span>
            </div>
          ))}
        </div>

        <div className={classnames(styles.amountContainer)}>
          <div className={styles.amountTitle}>Deposit Amount</div>
          <div className={classnames(styles.amountOptions, styles.p)}>
            {amountPreset.map((amt, index) => (
              <div
                key={index}
                className={classnames(styles.amountOption, styles.p1, {
                  [styles.selected]: isSelected(amt),
                })}
                onClick={() => setDepositAmount(amt)}
              >
                <span className={styles.amountText}>{amt}</span>
              </div>
            ))}
          </div>
          <div className={styles.inputContainer}>
            <span className={styles.rupeeIcon}>₹</span>
            <input
              type="text"
              placeholder="Min 100-Max 50,000"
              className={classnames(styles.input, {
                [styles.valid]: isValidAmount,
                [styles.inputError]: formError,
              })}
              value={depositAmount}
              onChange={handleChange}
            />
            {formError && <span className={styles.error}>{formError}</span>}
          </div>
          <button
            className={classnames(
              styles.button,
              isSubmitting && styles.disable
            )}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Processing..." : "Deposit Now"}
          </button>
        </div>
      </Wallet>
    </>
  );
};

export default Deposit;
