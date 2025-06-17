import { useContext, useEffect, useRef, useState } from "react";
import styles from "./RoundHistory.module.css";
import classnames from "classnames";
import { MdHistory } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import useSyncedRefWithRAF from "../hooks/useSyncedRefWithRAF";
import { EnginContext } from "../context/EnginContext";

const RoundHistory = () => {
  const { score, isLoadingRef } = useContext(EnginContext);
  const syncedIsLoading = useSyncedRefWithRAF(isLoadingRef);

  const generateRandomRound = () => {
    const rand = Math.random();
    if (rand < 0.8) {
      return +(1 + Math.random() * 2).toFixed(2);
    } else if (rand < 0.95) {
      return +(2 + Math.random() * 8).toFixed(2);
    } else {
      return +(10 + Math.random() * 290).toFixed(2);
    }
  };
  const roundArray = Array.from({ length: 40 }, generateRandomRound);

  const [results, setResults] = useState(roundArray);
  const [isArrowUp, setIsArrowUp] = useState(false);

  const prevIsLoadingRef = useRef(syncedIsLoading);
  const isFirstRender = useRef(true);

  const roundResult = score.current;
  const [newRoundIndex, setNewRoundIndex] = useState(null);

  const arrowButton = () => {
    setIsArrowUp((prev) => !prev);
  };

  const addNewResult = (newResult) => {
    setResults((prevResults) => {
      const updatedResult = [newResult, ...prevResults];
      setNewRoundIndex(0);
      return updatedResult.slice(0, 40);
    });

    setTimeout(() => {
      setNewRoundIndex(null);
    }, 1000);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const prevIsLoading = prevIsLoadingRef.current;

      if (prevIsLoading === false && syncedIsLoading === true) {
        if (roundResult !== undefined) {
          addNewResult(roundResult);
        }
      }
    }

    // Always update ref for next run
    prevIsLoadingRef.current = syncedIsLoading;
  }, [syncedIsLoading, roundResult]);

  const colors = [
    { r: 52, g: 180, b: 255 }, // Blue
    { r: 145, g: 62, b: 248 }, // Purple
    { r: 192, g: 23, b: 180 }, // Pink
  ];

  const getRoundColor = (num) => {
    if (num < 2) return `rgb(${colors[0].r}, ${colors[0].g}, ${colors[0].b})`;
    if (num < 10) return `rgb(${colors[1].r}, ${colors[1].g}, ${colors[1].b})`;
    return `rgb(${colors[2].r}, ${colors[2].g}, ${colors[2].b})`;
  };

  const renderPayouts = () => {
    return results.map((roundNum, index) => {
      const isNew = index === newRoundIndex;
      return (
        <div
          className={classnames(styles.payout, {
            [styles.animateSlideIn]: isNew,
          })}
          key={index}
        >
          <div
            className={styles.payoutValue}
            style={{ color: getRoundColor(roundNum) }}
          >
            {roundNum.toFixed(2)}x
          </div>
        </div>
      );
    });
  };
  return (
    <>
      <div className={styles.roundHistory}>
        <div className={classnames(styles.stats)}>
          <div className={styles.payoutWrapper}>
            <div className={styles.payoutBlock}>{renderPayouts()}</div>
          </div>

          <div className={styles.shadow}></div>
          <div className={styles.buttonBlock}>
            <div
              className={styles.dropdownToggle}
              style={isArrowUp ? { color: "red" } : {}}
            >
              <div className={styles.trigger} onClick={arrowButton}>
                <span className={styles.historyIcon}>
                  <MdHistory />
                </span>
                {isArrowUp ? (
                  <span className={styles.arrowUp}>
                    <IoMdArrowDropup />
                  </span>
                ) : (
                  <span className={styles.arrowDown}>
                    <IoMdArrowDropdown />
                  </span>
                )}
              </div>
            </div>
          </div>
          <app-stats-dropdown>
            <div
              className={classnames(styles.dropdownMenu, {
                [styles.show]: isArrowUp,
              })}
              style={{
                top: "0px",
                left: "0px",
                willChange: "transform",
                ...(isArrowUp
                  ? {
                      position: "absolute",
                      transform: "translate(-5px,22px)",
                    }
                  : {}),
              }}
            >
              <div className={styles.wrapper}>
                <div className={styles.header}>
                  <div
                    className={classnames(styles.text, styles.textUpperCase)}
                  >
                    Round History
                  </div>
                </div>
                <div className={styles.payoutBlock}>{renderPayouts()}</div>
              </div>
            </div>
          </app-stats-dropdown>
        </div>
      </div>
    </>
  );
};

export default RoundHistory;
