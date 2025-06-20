import { useState } from "react";
import styles from "./InfoBoard.module.css";
import classnames from "classnames";
import avatar from "../assets/av-1.png";

const InfoBoard = () => {
  const [isActive, setIsActive] = useState("all");
  const arr = [12, 42, 20, 100, 120, 1000, 34];
  return (
    <>
      <div className={classnames(styles.infoBoard, styles.pt2)}>
        <app-bets-widget>
          <div className={styles.betsBlock}>
            <div className={styles.betsBlockNav}>
              <app-navigation-switcher
                className={styles.navigationSwitcherWrapper}
              >
                <div className={styles.navigationSwitcher}>
                  <button
                    className={classnames(styles.tab, {
                      [styles.active]: isActive === "all",
                    })}
                    onClick={() => setIsActive("all")}
                  >
                    All Bets
                  </button>
                  <button
                    className={classnames(styles.tab, {
                      [styles.active]: isActive === "my",
                    })}
                    onClick={() => setIsActive("my")}
                  >
                    My Bets
                  </button>
                  <button
                    className={classnames(styles.tab, {
                      [styles.active]: isActive === "top",
                    })}
                    onClick={() => setIsActive("top")}
                  >
                    Top Bets
                  </button>
                </div>
              </app-navigation-switcher>
            </div>
            <app-all-bets-tab className={styles.dataList}>
              <div className={styles.dataItem}>
                <app-header className={styles.headerWrapper}>
                  <div
                    className={classnames(
                      styles.allBetsBlock,
                      styles.pb1,
                      styles.px2
                    )}
                  >
                    <div>
                      <div className={styles.textUpperCase}>ALL BETS</div>
                      <div>179</div>
                    </div>
                  </div>
                  <div className={styles.spacer}></div>
                  <div className={classnames(styles.legend, styles.mx2)}>
                    <span className={styles.user}>Player</span>
                    <span className={styles.bet}>Bet INR</span>
                    <span className={styles.x}>X</span>
                    <span className={styles.cashOut}>Cash out INR</span>
                  </div>
                </app-header>
                <virtual-scroll-viewport
                  className={styles.virtualScrollViewport}
                >
                  <div className={styles.contentWrapper}>
                    <div className={styles.listItemContainer}>
                      {arr.map((item, index) => (
                        <div className={styles.listItem} key={index}>
                          <div
                            className={classnames(
                              styles.column,
                              styles.playerColumn
                            )}
                          >
                            <img src={avatar} alt="img" />
                            <div
                              className={classnames(
                                styles.column,
                                styles.username
                              )}
                            >
                              d***3
                            </div>
                          </div>
                          <div
                            className={classnames(
                              styles.column,
                              styles.betColumn
                            )}
                          >
                            <div className={styles.betAmount}>{item}</div>
                          </div>
                          <div
                            className={classnames(
                              styles.column,
                              styles.xColumn
                            )}
                          >
                            1.98x
                          </div>
                          <div
                            className={classnames(
                              styles.column,
                              styles.winColumn
                            )}
                          >
                            19.8
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </virtual-scroll-viewport>
              </div>
            </app-all-bets-tab>
          </div>
        </app-bets-widget>
        <app-footer>
          <div className={classnames(styles.footer, styles.px2)}>
            <div className={styles.provablyFairBlock}>
              <span>This game is</span>
              <div className={styles.provablyFair}>
                <div className={styles.icon}></div>
                <span className={styles.textProvably}>Provably Fair</span>
              </div>
            </div>
          </div>
        </app-footer>
      </div>
    </>
  );
};

export default InfoBoard;
