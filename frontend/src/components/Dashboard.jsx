import React, { useState, useEffect, useRef, useContext, act } from "react";
import axios from "axios";
import classnames from "classnames";
import styles from "./Dashboard.module.css";
import logo from "../assets/aviator.png";
import avatar from "../assets/av-1.png";
import { MdOutlinePayments } from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaBars } from "react-icons/fa6";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { FaHistory } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import Canvas from "./Canvas.jsx";
import RoundHistory from "./RoundHistory.jsx";
import BetControls from "./BetControls/BetControls.jsx";
import InfoBoard from "./InfoBoard.jsx";
import Deposit from "./Wallet/Deposit.jsx";
import Withdraw from "./Wallet/Withdraw.jsx";
import WalletHistory from "./Wallet/WalletHistory.jsx";

import { useSoundContext } from "../context/SoundContext.jsx";
import { EnginContext } from "../context/EnginContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useClickOutside from "../utils/useClickOutside.js";

const Dashboard = () => {
  const {
    activePage,
    closePage,
    openDeposit,
    openWithdraw,
    openWalletHistory,
  } = useContext(EnginContext);
  const { betState, alerts } = useContext(EnginContext);
  const [logoutShow, setLogoutShow] = useState(false);
  const [loggedout, setLogout] = useState(false);
  const { user, logout, authLoading, isAuthenticated } = useAuth();
  const [sidebar, setSidebar] = useState(false);

  const balance = betState.balance;
  const { toggle, playing, toggleSound, isSound } = useSoundContext();

  const onClose = () => {
    setSidebar(false);
  };
  const modalRef = useRef(null);
  useClickOutside(modalRef, onClose);

  const handleLogoutButton = () => {
    setLogout(true);
    logout();
  };

  useEffect(() => {
    if (activePage != null || sidebar) {
      document.body.classList.add("noScroll");
    } else {
      document.body.classList.remove("noScroll");
    }
  }, [activePage, sidebar]);

  return (
    <>
      <div className={styles.mainContainer}>
        <header>
          <div className={styles.navContainer}>
            <div className={styles.navLogo}>
              <img src={logo} alt="Logo" />
            </div>
            <div className={styles.navBar}>
              <div className={styles.navBalanceContainer}>
                {/* <span className={styles.depositIcon}>
                  <button className={styles.icon} onClick={openDeposit}>
                    <MdOutlinePayments />
                  </button>
                </span> */}
                <button
                  className={styles.btnBalance}
                  onClick={() => openWalletHistory("transactions")}
                >
                  <div className={styles.navBalance}>
                    <span className={styles.navAmount}>
                      {balance.toFixed(2)}
                    </span>

                    <span className={styles.navCurrency}> INR</span>
                  </div>
                </button>
              </div>
              <div className={styles.navToggler}>
                <span
                  className={styles.navToggleBtn}
                  onClick={() => setSidebar(!sidebar)}
                  aria-label="Toggle Sidebar"
                >
                  <FaBars />
                </span>
              </div>
            </div>
          </div>
          {sidebar && (
            <div className={styles.user}>
              <div
                className={classnames(styles.sidebar, {
                  [styles.sidebarOpen]: sidebar,
                })}
                ref={modalRef}
              >
                <div className={styles.section1}>
                  <div className={styles.avatar}>
                    <img src={avatar} alt="avatar" />
                  </div>
                  <span className={styles.username}>
                    {user.phone.slice(0, 2)}***{user.phone.slice(-2)}
                  </span>
                </div>
                <div className={styles.section2}>
                  <div className={styles.listMenu}>
                    <div className={styles.listMenuItem}>
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-volume-down"
                            viewBox="0 0 16 16"
                          >
                            <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8" />
                          </svg>
                        </span>
                        SOUND
                      </div>
                      <div className="checkbox form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="flexSwitchCheckDefault"
                          checked={isSound}
                          onChange={toggleSound}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="soundSwitch"
                        ></label>
                      </div>
                    </div>
                    <div className={styles.listMenuItem}>
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-music-note-beamed"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2" />
                            <path
                              fillRule="evenodd"
                              d="M14 11V2h1v9zM6 3v10H5V3z"
                            />
                            <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z" />
                          </svg>
                        </span>
                        MUSIC
                      </div>
                      <div className="checkbox form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="flexSwitchCheckDefault"
                          checked={playing}
                          onChange={toggle}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckDefault"
                        ></label>
                      </div>
                    </div>
                    {/* <div className={styles.listMenuItem}>
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <MdAnimation />
                        </span>
                        ANIMATION
                      </div>
                      <div className="checkbox form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="flexSwitchCheckDefault"
                          checked={isAnimation}
                          onChange={() => setIsAnimation(!isAnimation)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckDefault"
                        ></label>
                      </div>
                    </div> */}
                  </div>
                </div>
                <div className={styles.section3}>
                  <div className={styles.listMenuItem}>
                    <button className={styles.btnItem} onClick={openDeposit}>
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <MdOutlinePayments />
                        </span>
                        Deposit Funds
                      </div>
                    </button>
                  </div>
                  <div className={styles.listMenuItem}>
                    <button className={styles.btnItem} onClick={openWithdraw}>
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <MdOutlinePayments />
                        </span>
                        Withdraw Funds
                      </div>
                    </button>
                  </div>
                  <div className={styles.listMenuItem}>
                    <button
                      className={styles.btnItem}
                      onClick={() => openWalletHistory("bets")}
                    >
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <FaHistory />
                        </span>
                        Bet History
                      </div>
                    </button>
                  </div>
                  <div className={styles.listMenuItem}>
                    <div className={styles.title}>
                      <span className={styles.icon}>
                        <RiCustomerService2Fill />
                      </span>
                      Contact Us
                    </div>
                  </div>
                  <div
                    className={styles.listMenuItem}
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className={styles.btnLogout}
                      onClick={() => setLogoutShow(true)}
                    >
                      <div className={styles.title}>
                        <span className={styles.icon}>
                          <ImExit />
                        </span>
                        LOGOUT
                      </div>
                    </button>
                  </div>
                </div>
                <div className={styles.section4}>
                  <div className={styles.listMenuItem}>
                    <div className={styles.title}>
                      <span className={styles.icon}>
                        <AiOutlineSafetyCertificate />
                      </span>
                      <span>Provably Fair Game</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
        {logoutShow && (
          <div className={classnames(styles.logoutContainer, styles.visible)}>
            <div className={styles.logoutContent}>
              <h2>Are you sure you want to logout?</h2>
              <button
                className={styles.logoutButton}
                onClick={handleLogoutButton}
              >
                Yes
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setLogout(false), setLogoutShow(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        )}

        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={classnames(styles.alertContainer, {
              [styles.leaving]: alert.leaving,
              [styles.entering]: alert.entering,
            })}
            style={{
              top: `${20 + index * 70}px`,
            }}
          >
            <div className={classnames(styles.alert)}>
              {alert.type === "cashout" && (
                <div className={styles.cashoutBanner}>
                  <div className={styles.cashoutText}>
                    <div className={styles.subtitle}>You have cashed out!</div>
                    <div className={styles.multiplier}>{alert.score}x</div>
                  </div>
                  <div className={styles.cashoutAmount}>
                    <div className={styles.label}>Win INR</div>
                    <div className={styles.amount}>{alert.text}</div>
                  </div>
                </div>
              )}
              {alert.type === "error" && (
                <div className={styles.error}>
                  <div className={styles.errorText}>{alert.text}</div>
                  <div className={styles.errorButton}>x</div>
                </div>
              )}
            </div>
          </div>
        ))}

        <main>
          <div className={styles.gameContainer}>
            <InfoBoard />
            <div className={styles.gamePlay}>
              <RoundHistory />
              <div className={styles.stageBoard}>
                <Canvas />
              </div>
              <BetControls />
            </div>
          </div>
        </main>
        {activePage === "deposit" && <Deposit onClose={closePage} />}
        {activePage === "withdraw" && <Withdraw onClose={closePage} />}
        {activePage === "walletHistory" && (
          <WalletHistory onClose={closePage} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
