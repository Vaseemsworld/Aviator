import { useState } from "react";
import styles from "./ResultHistory.module.css";
import classnames from "classnames";
import { MdHistory } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const ResultHistory = ({ history }) => {
  const [isArrowUp, setIsArrowUp] = useState(false);

  const arrowButton = () => {
    setIsArrowUp(!isArrowUp);
  };

  // const addNewResult = (newResult) => {
  //   setResults((prevResults) => {
  //     const updatedResult = [newResult, ...prevResults];
  //     return updatedResult.slice(0, 50);
  //   });
  // };

  return (
    <>
      <div className={styles.resultHistory}>
        <div className={classnames(styles.stats)}>
          <div className={styles.payoutWrapper}>
            <div className={styles.payoutBlock}>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>3.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>6.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>2.05x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>9.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>10.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>6.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.05x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.40x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.43x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.00x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.32x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>5.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>8.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.85x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>1.15x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>176.03x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>43.45x</div>
              </div>
              <div className={styles.payout}>
                <div className={styles.payoutValue}>89.45x</div>
              </div>
            </div>
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
                <div className={styles.payoutBlock}>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>3.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>6.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>2.05x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>9.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>10.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>6.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.05x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.40x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.43x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.00x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.32x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>5.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>8.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.85x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>1.15x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>176.03x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>43.45x</div>
                  </div>
                  <div className={styles.payout}>
                    <div className={styles.payoutValue}>89.45x</div>
                  </div>
                </div>
              </div>
            </div>
          </app-stats-dropdown>
        </div>
      </div>
    </>
  );
};

export default ResultHistory;
