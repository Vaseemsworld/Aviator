import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./BetControls.module.css";
import classnames from "classnames";
import {
  handleChange,
  handleBlur,
  handleDecrement,
  handleIncrement,
} from "./utils";
import AutoSection, { AutoBetToggle } from "./AutoSection";
import { EnginContext } from "../../context/EnginContext";
import useSyncedRefWithRAF from "../../hooks/useSyncedRefWithRAF";
import { useSoundContext } from "../../context/SoundContext";

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
    betState,
    ACTIONS,
    BUTTON_STATES,
    placeBet,
    cancelBet,
    cashOut,
    handleAlertMessage,
    winningAmount,
    flash,
    setFlash,
    dispatchBet,
  } = useContext(EnginContext);

  const balance = betState.balance;
  const syncedIsLoading = useSyncedRefWithRAF(isLoadingRef);
  const { playWin } = useSoundContext();

  const value = parseFloat(betState[betKey].betAmount);
  const setValue = (newValue) => {
    dispatchBet({
      type: ACTIONS.SET_BET_AMOUNT,
      betKey,
      payload: parseFloat(newValue),
    });
  };
  const buttonState = betState[betKey].buttonState;
  const displayValue = useDisplayValue(score, value, betState[betKey].isPlaced);

  const amounts = [100, 200, 500, 1000];

  const [isAutoActive, setIsAutoActive] = useState(false);
  const [isBetActive, setIsBetActive] = useState(true);

  // const handleAutoBet = () => {
  //   if (syncedIsLoading) {
  //     buttonState = BUTTON_STATES.BET_PLACED;
  //   } else {
  //     buttonState = BUTTON_STATES.WAITING;
  //   }
  // };

  // if (isAutoActive) {
  //   handleAutoBet();
  // }

  useEffect(() => {
    if (syncedIsLoading) {
      if (buttonState === BUTTON_STATES.WAITING) {
        if (!betState[betKey].hasDeductedBalance) {
          const result = placeBet(betKey, value);
          if (result?.error) {
            handleAlertMessage(result.error);
          }
        }
      } else if (buttonState === BUTTON_STATES.FLYING) {
        dispatchBet({
          type: ACTIONS.RESET_BET,
          betKey,
          payload: {
            buttonState: BUTTON_STATES.IDLE,
            isPlaced: false,
            hasDeductedBalance: false,
          },
        });
      }
    } else {
      if (buttonState === BUTTON_STATES.BET_PLACED) {
        dispatchBet({
          type: ACTIONS.SET_BUTTON_STATE,
          betKey,
          payload: BUTTON_STATES.FLYING,
        });
        dispatchBet({
          type: ACTIONS.SET_BET_PLACED,
          betKey,
          payload: true,
        });
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
      case BUTTON_STATES.IDLE:
        if (syncedIsLoading) {
          if (balance >= value) {
            placeBet(betKey, value);
          } else {
            handleAlertMessage("LOW_BALANCE");
            dispatchBet({ type: ACTIONS.RESET_BET, betKey });
          }
        } else {
          dispatchBet({
            type: ACTIONS.SET_BUTTON_STATE,
            betKey,
            payload: BUTTON_STATES.WAITING,
          });
        }
        break;
      case BUTTON_STATES.BET_PLACED:
        if (syncedIsLoading) {
          cancelBet(betKey, value);
        }
        dispatchBet({
          type: ACTIONS.SET_BUTTON_STATE,
          betKey,
          payload: BUTTON_STATES.IDLE,
        });
        break;
      case BUTTON_STATES.FLYING:
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
      case BUTTON_STATES.WAITING:
        if (!syncedIsLoading) {
          dispatchBet({
            type: ACTIONS.SET_BUTTON_STATE,
            betKey,
            payload: BUTTON_STATES.IDLE,
          });
        }
        break;
      default:
        break;
    }
  };

  const getButtonLabel = () => {
    switch (buttonState) {
      case BUTTON_STATES.IDLE:
        return "BET";
      case BUTTON_STATES.BET_PLACED:
        return "CANCEL";
      case BUTTON_STATES.WAITING:
        return "CANCEL";
      case BUTTON_STATES.FLYING:
        return "CASH OUT";
      default:
        return "BET";
    }
  };

  const getButtonClass = () => {
    switch (buttonState) {
      case BUTTON_STATES.IDLE:
        return "";
      case BUTTON_STATES.BET_PLACED:
        return styles.btnCancel;
      case BUTTON_STATES.WAITING:
        return styles.btnCancel;
      case BUTTON_STATES.FLYING:
        return styles.btnCashout;
      default:
        return "";
    }
  };

  return (
    <app-bet-control
      className={classnames(styles.betControl, styles.doubleBet)}
    >
      <div className={classnames(styles.control, flash && styles.flash)}>
        {/* Toggle between Bet and Auto */}
        <AutoBetToggle
          isAutoActive={isAutoActive}
          setIsAutoActive={setIsAutoActive}
          isBetActive={isBetActive}
          setIsBetActive={setIsBetActive}
        />

        {/* Manual Bet Controls */}
        <div className={classnames(styles.firstRow, styles.autoGameFeature)}>
          <div
            className={classnames(
              styles.betBlock,
              buttonState !== BUTTON_STATES.IDLE && styles.inActive
            )}
          >
            <app-spinner className={styles.spinner}>
              <div className={classnames(styles.spinner, styles.big)}>
                <div className={styles.button}>
                  <button
                    className={styles.minus}
                    style={{ color: "white" }}
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

          {/* Action Button */}

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
                {buttonState === BUTTON_STATES.WAITING && (
                  <span className={styles.waitingText}>
                    Waiting for next round
                  </span>
                )}
                {buttonState !== BUTTON_STATES.WAITING &&
                  buttonState !== BUTTON_STATES.BET_PLACED && (
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

        {/* Auto Section  */}
        <AutoSection betKey={betKey} isAutoActive={isAutoActive} />
      </div>
    </app-bet-control>
  );
};

const BetControls = () => {
  return (
    <div className={styles.betControls}>
      <app-bet-controls>
        <div className={styles.controls}>
          <BetInput betKey="bet1" />
          <BetInput betKey="bet2" />
        </div>
      </app-bet-controls>
    </div>
  );
};

export default BetControls;
