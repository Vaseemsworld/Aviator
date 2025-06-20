import React, { useEffect, useState } from "react";
import classnames from "classnames";
import styles from "./Wallet.module.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { RiCustomerService2Fill } from "react-icons/ri";
import UpiIcon from "../../assets/upi-icon.avif";
import PaytmLogo from "../../assets/paytm-logo.avif";
import { SiPhonepe, SiGooglepay } from "react-icons/si";

const Deposit = ({ onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [isVisible, setIsVisible] = useState(false);

  const paymentMethods = [
    { name: "UPI", icon: <img src={UpiIcon} alt="Upi Icon" /> },
    { name: "Phone Pe", icon: <SiPhonepe /> },
    { name: "Paytm", icon: <img src={PaytmLogo} alt="Paytm Logo" /> },
    { name: "Google Pay", icon: <SiGooglepay /> },
  ];

  const isSelected = (amt) => Number(depositAmount) === amt;
  const amount = [100, 500, 1000, 10000];
  const [depositAmount, setDepositAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(false);

  const handleSubmit = () => {
    const amountNum = Number(depositAmount);
    if (isNaN(amountNum) || amountNum < 100 || amountNum > 50000) {
      setFormError("Enter amount between ₹100 and ₹50,000");
      return;
    }
    setFormError("");
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <div className={classnames(styles.overlay, { [styles.show]: isVisible })}>
        <div
          className={classnames(styles.depositPage, {
            [styles.fadeInUp]: isVisible,
          })}
        >
          <div className={styles.depositContainer}>
            <div className={styles.content}>
              <header className={styles.header}>
                <button className={styles.backButton} onClick={handleClose}>
                  <i className={styles.icon}>
                    <IoMdArrowRoundBack />
                  </i>
                </button>
                <div className={styles.icons}>
                  <i className={styles.icon}>
                    <RiCustomerService2Fill />
                  </i>
                  <i className={styles.icon}>
                    <svg
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      viewBox="0 0 56 56"
                    >
                      <defs>
                        <clipPath id="3b8409b5fb390f72ff65226bf194a6f7-clipPath">
                          <rect
                            id="3b8409b5fb390f72ff65226bf194a6f7-矩形_3360"
                            data-name="矩形 3360"
                            width="56"
                            height="56"
                            transform="translate(-9003.117 7343.883)"
                            strokeWidth="1"
                          ></rect>
                        </clipPath>
                      </defs>
                      <g
                        id="3b8409b5fb390f72ff65226bf194a6f7-comm_icon_cz_jl"
                        transform="translate(9003.117 -7343.883)"
                        clipPath="url(#3b8409b5fb390f72ff65226bf194a6f7-clipPath)"
                      >
                        <path
                          id="3b8409b5fb390f72ff65226bf194a6f7-联合_619"
                          data-name="联合 619"
                          d="M5477.7,10114.192a16.013,16.013,0,0,1,6.113-30.81h.013a16.014,16.014,0,1,1-6.125,30.81Zm1.391-26.22a12.361,12.361,0,1,0,4.719-.938A12.395,12.395,0,0,0,5479.1,10087.973Zm-23.658,22.719a6.564,6.564,0,0,1-6.555-6.56v-34.693a6.561,6.561,0,0,1,6.555-6.555h26.811a6.56,6.56,0,0,1,6.552,6.555V10076h-3.65v-6.558a2.905,2.905,0,0,0-2.9-2.9h-26.813a2.908,2.908,0,0,0-2.9,2.9v34.581l0,0v.106a2.9,2.9,0,0,0,2.9,2.9h8.134v3.655Zm33.487-3.681-6.417-6.434a1.709,1.709,0,0,1-.452-.817v-.01a.6.6,0,0,1-.03-.155l0-.018v-.059a21.265,21.265,0,0,1-.028-2.3v-5.7a1.825,1.825,0,1,1,3.651,0v7.218l5.773,5.783a1.764,1.764,0,0,1-.751,3.033,1.812,1.812,0,0,1-.421.051A1.779,1.779,0,0,1,5488.925,10107.011Zm-30.334-19.975a1.827,1.827,0,0,1,0-3.653h6.311a1.827,1.827,0,0,1,0,3.653Zm0-9.456a1.825,1.825,0,0,1,0-3.65h20.5a1.825,1.825,0,1,1,0,3.65Z"
                          transform="translate(-14449.841 -2716.841)"
                        ></path>
                      </g>
                    </svg>
                  </i>
                </div>
              </header>
              <div className={styles.mainContent}>
                <div className={styles.titleContainer}>
                  <div className={styles.title}>
                    <i className={styles.phoneIcon}>
                      <svg
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        viewBox="0 0 31.979 33.88"
                      >
                        <path
                          id="04ee13ddbe5875af1edf71bbf8a982fb-icon_cz_zxcz1"
                          d="M17.456,33.88H3.492A3.485,3.485,0,0,1,0,30.41V3.47A3.485,3.485,0,0,1,3.492,0H17.467a3.486,3.486,0,0,1,3.481,3.484V16.265a10.035,10.035,0,0,0-2.255,1.066V5.183a1.161,1.161,0,0,0-1.164-1.156h-14A1.161,1.161,0,0,0,2.364,5.183V27.6a1.136,1.136,0,0,0,.982,1.157h11.12a9.961,9.961,0,0,0,3.622,5.057,3.457,3.457,0,0,1-.632.066Zm-6.674-3.708a1.247,1.247,0,1,0,1.255,1.247,1.247,1.247,0,0,0-1.255-1.247ZM24.1,33.614a7.831,7.831,0,1,1,7.879-7.831A7.831,7.831,0,0,1,24.1,33.614Zm-.159-3.321h0l1.45.012a6.019,6.019,0,0,1-1.357-2.4,4.6,4.6,0,0,0,1.5.866,2.287,2.287,0,0,0,2.742-2.509c-.023-1.233-.923-2.054-2.063-3.092a19,19,0,0,1-2.268-2.343,19.557,19.557,0,0,1-2.255,2.286c-1.145,1.029-2.049,1.842-2.086,3.085a2.292,2.292,0,0,0,2.711,2.56,5.013,5.013,0,0,0,1.562-.855,5.972,5.972,0,0,1-1.385,2.385c.869.011,1.227.013,1.373.013h.08Z"
                        ></path>
                      </svg>
                    </i>
                    <span className={styles.depositTitleText}>
                      Deposit Funds
                    </span>
                  </div>
                </div>

                <div className={classnames(styles.paymentOptions, styles.p)}>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      className={classnames(styles.p1, styles.paymentOption, {
                        [styles.selectedPayment]:
                          selectedMethod === method.name,
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
                    {amount.map((amt, index) => (
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
                    {formError && (
                      <span className={styles.error}>{formError}</span>
                    )}
                  </div>
                  <button className={styles.button} onClick={handleSubmit}>
                    Deposit Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Deposit;
