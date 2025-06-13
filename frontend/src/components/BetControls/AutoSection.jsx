import React, { useState, useContext } from "react";
import classnames from "classnames";
import styles from "./BetControls.module.css";
import { handleChange, handleBlur } from "./utils";
import { EnginContext } from "../../context/EnginContext";
import useSyncedRefWithRAF from "../../hooks/useSyncedRefWithRAF";

export const AutoBetToggle = ({
  isAutoActive,
  setIsAutoActive,
  isBetActive,
  setIsBetActive,
}) => {
  const handleBetClick = () => {
    setIsAutoActive(false);
    setIsBetActive(true);
  };
  const handleAutoClick = () => {
    setIsAutoActive(true);
    setIsBetActive(false);
  };

  return (
    <app-navigation-switcher className={styles.navigation}>
      <div className={styles.navigationSwitcher}>
        <div className={styles.slider}></div>
        <button
          className={classnames(
            styles.tab,
            styles.betButton,
            isBetActive ? styles.active : ""
          )}
          onClick={() => handleBetClick()}
        >
          Bet
        </button>
        <button
          className={classnames(
            styles.tab,
            styles.autoButton,
            isBetActive ? "" : styles.active
          )}
          onClick={() => handleAutoClick()}
        >
          Auto
        </button>
      </div>
    </app-navigation-switcher>
  );
};

const AutoSection = ({ betKey, isAutoActive }) => {
  const [isAutoBetOn, setIsAutoBetOn] = useState(false);
  const [isAutoCashOut, setIsAutoCashOut] = useState(false);
  const [cashOutNumber, setCashOutNumber] = useState("1.00");
  const { isLoadingRef, betState, BUTTON_STATES } = useContext(EnginContext);
  const syncedLoading = useSyncedRefWithRAF(isLoadingRef);

  return (
    <div
      className={classnames(
        styles.autoSectionWrapper,
        isAutoActive && styles.active
      )}
    >
      <div className={styles.autoSection}>
        <div className={styles.secondRow}>
          {/* Auto Bet */}
          <div className={styles.autoBetWrapper}>
            <div className={styles.autoBet}>
              <label className={styles.labelText}>Auto Bet</label>
              <div className={styles.autoBetSwitch}>
                <div className={styles.switch}>
                  <div className="checkbox form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={isAutoBetOn}
                      onChange={(e) => setIsAutoBetOn(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Auto Cash Out */}
          <div className={styles.cashOutBlock}>
            <div className={styles.cashOutSwitcher}>
              <label className={styles.labelText}>Auto Cash Out</label>
              <div className={styles.cashOutSwitch}>
                <div className={styles.switch}>
                  <div className="checkbox form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={isAutoCashOut}
                      onChange={(e) => setIsAutoCashOut(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cashOutSpinnerWrapper}>
              <div className={styles.cashOutSpinner}>
                <div className={styles.spinner}>
                  <div className={styles.input}>
                    <input
                      className={styles.inputText}
                      type="text"
                      inputMode="decimal"
                      value={cashOutNumber}
                      onChange={(e) => handleChange(e, setCashOutNumber)}
                      onBlur={() => handleBlur(cashOutNumber, setCashOutNumber)}
                    />
                  </div>
                  <div className={styles.icon}>
                    <span>x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoSection;
