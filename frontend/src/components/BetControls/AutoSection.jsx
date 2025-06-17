import { useState, useContext, useEffect } from "react";
import classnames from "classnames";
import styles from "./BetControls.module.css";
import { handleIncrement, handleDecrement, handleBlur } from "./utils";
import { EnginContext } from "../../context/EnginContext";
import useSyncedRefWithRAF from "../../hooks/useSyncedRefWithRAF";

const handleChange = (e, setValue) => {
  const value = e.target.value;
  if (/^\d*\.?\d*$/.test(value)) {
    setValue(value);
  }
};

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

const AutoSection = ({
  betKey,
  isAutoActive,
  autoCashPoint,
  setAutoCashPoint,
}) => {
  const {
    isLoadingRef,
    placeBet,
    betState,
    dispatchBet,
    ACTIONS,
    handleAlertMessage,
  } = useContext(EnginContext);
  const isAutoCashOut = betState[betKey].autoCashout;
  const isAutoBetOn = betState[betKey].autoBet;
  const buttonState = betState[betKey].buttonState;
  const syncedIsLoading = useSyncedRefWithRAF(isLoadingRef);

  useEffect(() => {
    if (syncedIsLoading) {
      const bet = betState[betKey];
      if (bet.autoBet && !bet.isPlaced) {
        if (bet.betAmount > betState.balance) {
          handleAlertMessage("LOW_BALANCE");
          dispatchBet({ type: ACTIONS.SET_AUTO_BET, betKey, payload: false });
          return;
        }
        placeBet(betKey, bet.betAmount);
      }
    }
  }, [syncedIsLoading]);

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
                      onChange={(e) =>
                        dispatchBet({
                          type: ACTIONS.SET_AUTO_BET,
                          betKey,
                          payload: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Auto Cash Out */}
          <div
            className={classnames(styles.cashOutBlock, {
              [styles.disable]: buttonState !== "IDLE",
            })}
          >
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
                      onChange={(e) =>
                        dispatchBet({
                          type: ACTIONS.SET_AUTO_CASHOUT,
                          betKey,
                          payload: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cashOutSpinnerWrapper}>
              <div className={styles.cashOutSpinner}>
                <div className={styles.spinner}>
                  <div
                    className={classnames(styles.input, {
                      [styles.disabled]: !isAutoCashOut,
                    })}
                  >
                    <input
                      className={styles.inputText}
                      type="text"
                      inputMode="decimal"
                      disabled={!isAutoCashOut}
                      value={autoCashPoint}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          handleIncrement(autoCashPoint, setAutoCashPoint);
                        } else if (e.key === "ArrowDown") {
                          handleDecrement(
                            autoCashPoint,
                            setAutoCashPoint,
                            1.01
                          );
                        }
                      }}
                      onChange={(e) => handleChange(e, setAutoCashPoint)}
                      onBlur={() =>
                        handleBlur(autoCashPoint, setAutoCashPoint, 1.1)
                      }
                    />
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
    </div>
  );
};

export default AutoSection;
