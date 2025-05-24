import React, { useState } from "react";
import "../index.css";
import logo from "../assets/aviator_logo.png";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import styles from "./Auth/Auth.module.css";

const Home = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openRegisterModal = () => {
    setShowLoginModal(false), setShowRegisterModal(true);
  };
  const closeRegisterModal = () => setShowRegisterModal(false);

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
      </header>

      <main className="main">
        <div className="section welcome-section">
          <div className="action-buttons">
            <button className="main-register-btn" onClick={openRegisterModal}>
              Register
            </button>
            <button className="main-login-btn" onClick={openLoginModal}>
              Login
            </button>
          </div>
          <h1 className="heading">Welcome to Aviator Game</h1>
          <p>
            Take control of the skies in the ultimate online experience where
            skill meets excitement. Play, win, and soar to new heights!
          </p>
          <button className="download-btn">DOWNLOAD APK</button>
        </div>
        {showRegisterModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={closeRegisterModal}>
                &times;
              </span>
              <Register />
            </div>
          </div>
        )}
        {showLoginModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={closeLoginModal}>
                &times;
              </span>
              <Login openRegisterModal={openRegisterModal} />
            </div>
          </div>
        )}
        <div className="section about-section">
          <div className="container">
            <h2 className="heading">About the Game</h2>
            <p>
              Step into the thrilling world of Aviator, a game that combines the
              rush of high-stakes betting with the unpredictability of flight!
              In Aviator, the goal is simple: bet, watch, and decide when to
              stop the flight before the plane explodes. The longer you wait,
              the higher your potential payout, but one wrong move could cost
              you it all. Ready to take off?
            </p>
          </div>

          <div className="container">
            <h2 className="heading">How To Play</h2>
            <ul className="container-text">
              <li>
                <strong>Place Your Bet: </strong> Choose the amount you wish to
                bet.
              </li>
              <li>
                <strong>Watch the Flight: </strong> The game starts with the
                plane flying and the multiplier increasing every second.
              </li>
              <li>
                <strong>Stop the Flight: </strong> Click <b>Stop</b> to lock in
                your winnings, or risk losing it all if the explosion happens
                first.
              </li>
            </ul>
          </div>

          <div className="container">
            <h2 className="heading">Game Features</h2>
            <div className="container-text">
              <p>
                <strong>Dynamic Gameplay : </strong> Each round is fast-paced
                and full of excitement, with every flight offering a new
                challenge.
              </p>
              <p>
                <strong>Multiplier Growth : </strong> The longer you wait, the
                more your multiplier grows, but be strategic – waiting too long
                could mean losing everything.
              </p>
              <p>
                <strong>Fair Play : </strong>The explosion point is random and
                generated fairly, ensuring every round is a fresh experience.
              </p>
              <p>
                <strong>Instant Payouts :</strong> When you hit Stop, your
                winnings are instantly calculated and awarded, making for a
                seamless gaming experience.
              </p>
              <p>
                <strong>24/7 Access : </strong> Jump into a new round at any
                time, no need to wait for the next game to begin.
              </p>
            </div>
          </div>

          <div className="container">
            <h2 className="heading">How To Get Started</h2>
            <div className="container-text">
              <p>
                <strong>Sign Up : </strong>
                Create an account on MyAviator and get ready for your first
                flight.
              </p>
              <p>
                <strong>Place Your Bet : </strong>Select your stake and start
                the game.
              </p>
              <p>
                <strong>Watch and Win : </strong>The multiplier increases with
                every second – will you stop in time for a big payout?
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div className="footer">
          <p className="footer-content">
            &#169; 2023 Aviator Game. All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
