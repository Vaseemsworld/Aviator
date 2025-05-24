import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./BetControls.module.css";
import classnames from "classnames";
import { EnginContext } from "../context/EnginContext";
import useSyncedRefWithRAF from "../hooks/useSyncedRefWithRAF";
import { useSoundContext } from "../context/SoundContext";

const handleChange = (e, setValue) => {
  const input = parseFloat(e.target.value);
  if (input <= 22000 && input >= 10) {
    setValue(input);
  }
};

const handleDecrement = (value, setValue) => {
  const numeric = parseFloat(value);
  const newValue = Math.max(10, numeric - 1).toFixed(2);
  setValue(newValue);
};

const handleIncrement = (value, setValue) => {
  const numeric = parseFloat(value);
  const newValue = Math.min(22000, numeric + 1).toFixed(2);
  setValue(newValue);
};

const handleBlur = (value, setValue) => {
  const numeric = parseFloat(value);
  if (!isNaN(numeric)) {
    setValue(numeric.toFixed(2));
  } else {
    setValue("10.00");
  }
};

const useDisplayValue = (score, betAmount, shouldRun) => {
  const [displayValue, setDisplayValue] = useState(parseFloat(betAmount));
  const betAmountRef = useRef(parseFloat(betAmount));

  useEffect(() => {
    betAmountRef.current = parseFloat(betAmount);
    setDisplayValue(parseFloat(betAmount));
  }, [betAmount]);

  useEffect(() => {
    if (!shouldRun) {
      setDisplayValue(parseFloat(betAmount));
      return;
    }

    let frameId;

    const update = () => {
      const targetValue = score.current * betAmountRef.current;
      setDisplayValue((prev) => {
        // for smooth score update
        const diff = targetValue - prev;
        if (Math.abs(diff) < 0.01) {
          return targetValue;
        }
        return prev + diff * 0.1;
      });
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [score, shouldRun]);

  return displayValue;
};

const BetInput = ({ betKey }) => {
  const {
    isLoadingRef,
    score,
    balance,
    betState,
    setBetState,
    placeBet,
    cancelBet,
    cashOut,
    setButtonState,
    handleAlertMessage,
    winningAmount,
    flash,
    setFlash,
  } = useContext(EnginContext);

  const value = betState[`betAmount${betKey}`];
  const setValue = (newValue) => {
    setBetState((prev) => ({
      ...prev,
      [`betAmount${betKey}`]: newValue,
    }));
  };
  const buttonState = betState[`buttonState${betKey}`];
  const displayValue = useDisplayValue(
    score,
    value,
    betState[`isBet${betKey}Placed`]
  );

  const { playWin } = useSoundContext();
  const [isAutoActive, setIsAutoActive] = useState(false);
  const amounts = [100, 200, 500, 1000];
  const [cashOutNumber, setCashOutNumber] = useState("1.00");
  const [isBetActive, setIsBetActive] = useState(true);
  const [isAutoBetOn, setIsAutoBetOn] = useState(false);
  const [isAutoCashOut, setIsAutoCashOut] = useState(false);

  const syncedIsLoading = useSyncedRefWithRAF(isLoadingRef);

  useEffect(() => {
    console.log(syncedIsLoading);
    if (syncedIsLoading) {
      if (buttonState === "WAITING") {
        if (!betState[`hasDeductedBalance${betKey}`]) {
          const result = placeBet(betKey, value);
          if (result?.error) {
            handleAlertMessage(result.error);
          }
        }
      } else if (buttonState === "FLYING") {
        setButtonState(betKey, "IDLE");
        setBetState((prev) => ({
          ...prev,
          [`isBet${betKey}Placed`]: false,
          [`hasDeductedBalance${betKey}`]: false,
        }));
      }
    } else {
      if (buttonState === "BET_PLACED") {
        setButtonState(betKey, "FLYING");
        setBetState((prev) => ({ ...prev, [`isBet${betKey}Placed`]: true }));
      }
      setFlash(true);
      const timeout = setTimeout(() => {
        setFlash(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [syncedIsLoading]);

  const handleBetBtn = () => {
    switch (buttonState) {
      case "IDLE":
        if (syncedIsLoading) {
          if (balance >= value) {
            const result = placeBet(betKey, value);
            if (result?.error) {
              handleAlertMessage(result.error);
            }
          }
        } else {
          setButtonState(betKey, "WAITING");
        }
        break;
      case "BET_PLACED":
        if (syncedIsLoading) {
          cancelBet(betKey, value);
        }
        setButtonState(betKey, "IDLE");
        break;
      case "FLYING":
        if (!syncedIsLoading) {
          cashOut(
            betKey,
            value,
            score,
            playWin,
            winningAmount,
            handleAlertMessage
          );
        }
        break;
      case "WAITING":
        if (!syncedIsLoading) {
          setButtonState(betKey, "IDLE");
        }
        break;
      default:
        break;
    }
  };

  const getButtonLabel = () => {
    switch (buttonState) {
      case "IDLE":
        return "BET";
      case "BET_PLACED":
        return "CANCEL";
      case "WAITING":
        return "CANCEL";
      case "FLYING":
        return "CASH OUT";
      default:
        return "BET";
    }
  };

  const getButtonClass = () => {
    switch (buttonState) {
      case "IDLE":
        return "";
      case "BET_PLACED":
        return styles.btnCancel;
      case "WAITING":
        return styles.btnCancel;
      case "FLYING":
        return styles.btnCashout;
      default:
        return "";
    }
  };

  const handleBetClick = () => {
    setIsAutoActive(false);
    setIsBetActive(true);
  };
  const handleAutoClick = () => {
    setIsAutoActive(true);
    setIsBetActive(false);
  };

  return (
    <app-bet-control
      className={classnames(styles.betControl, styles.doubleBet)}
    >
      <div className={classnames(styles.control, flash && styles.flash)}>
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

        <div className={classnames(styles.firstRow, styles.autoGameFeature)}>
          <div
            className={classnames(
              styles.betBlock,
              buttonState !== "IDLE" && styles.inActive
            )}
          >
            <app-spinner className={styles.spinner}>
              <div className={classnames(styles.spinner, styles.big)}>
                <div className={styles.button}>
                  <button
                    className={styles.minus}
                    onClick={() => handleDecrement(value, setValue)}
                  ></button>
                </div>
                <div className={styles.input}>
                  <input
                    className={styles.inputText}
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => handleChange(e, setValue)}
                    onBlur={() => handleBlur(value, setValue)}
                  />
                </div>
                <div className={styles.button}>
                  <button
                    className={styles.plus}
                    onClick={() => handleIncrement(value, setValue)}
                  ></button>
                </div>
              </div>
            </app-spinner>

            <div className={styles.betsOptList}>
              {amounts.map((amount) => (
                <button
                  key={amount}
                  className={classnames(
                    styles.btn,
                    styles.btnSecondary,
                    styles.betOpt
                  )}
                  onClick={() => setValue(amount.toFixed(2))}
                >
                  <span className={styles.btnText}>{amount.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonsBlock}>
            <button
              className={classnames(
                styles.btn,
                styles.btnSuccess,
                getButtonClass()
              )}
              onClick={handleBetBtn}
            >
              <span className={styles.btnsText}>
                <label className={styles.labelText}>{getButtonLabel()}</label>
                {buttonState === "WAITING" && (
                  <span className={styles.waitingText}>
                    Waiting for next round
                  </span>
                )}
                {buttonState !== "WAITING" && buttonState !== "BET_PLACED" && (
                  <label className={styles.amount}>
                    <span className={styles.amountText}>
                      {displayValue.toFixed(2)}
                    </span>
                    <span className={styles.amountCurrency}>INR</span>
                  </label>
                )}
              </span>
            </button>
          </div>
        </div>

        <div
          className={classnames(
            styles.autoSectionWrapper,
            isAutoActive && styles.active
          )}
        >
          <div className={styles.autoSection}>
            <div className={styles.secondRow}>
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
                          onBlur={() =>
                            handleBlur(cashOutNumber, setCashOutNumber)
                          }
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
      </div>
    </app-bet-control>
  );
};

const BetControls = () => {
  return (
    <div className={styles.betControls}>
      <app-bet-controls>
        <div className={styles.controls}>
          <BetInput betKey="1" />
          <BetInput betKey="2" />
        </div>
      </app-bet-controls>
    </div>
  );
};

export default BetControls;
