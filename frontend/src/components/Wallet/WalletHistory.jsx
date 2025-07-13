import React, { useContext, useEffect, useState } from "react";
import api from "../../api";
import styles from "./Wallet.module.css";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import classnames from "classnames";
import Wallet from "./Wallet";
import { EnginContext } from "../../context/EnginContext";
import { useAuth } from "../../context/AuthContext";
import { fetchBalance } from "../../utils/fetchBalance";

const WalletHistory = ({ onClose }) => {
  const { type, openDeposit, openWithdraw } = useContext(EnginContext);
  const [transactions, setTransactions] = useState([]);
  const [filteredTxs, setFilteredTxs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 25;

  const getBalance = async () => {
    const token = localStorage.getItem("access");
    const bal = await fetchBalance({ token });
    if (bal !== null) setBalance(bal);
  };

  const fetchInitialTransactions = async () => {
    try {
      const res = await api.get(`/wallet/history/?offset=0&limit=${limit}`);
      const initialTxs = res.data.results || [];
      setTransactions(initialTxs);
      setFilteredTxs(initialTxs);
      setOffset(limit);
      if (initialTxs.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch wallet history", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/wallet/history/?offset=${offset}&limit=${limit}`
      );
      const newTxs = res.data.results || [];
      if (newTxs.length < limit) setHasMore(false);
      setTransactions((prev) => [...prev, ...newTxs]);
      setOffset((prev) => prev + limit);
    } catch (err) {
      console.error("Error fetching more transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialTransactions();
    getBalance();
  }, []);

  useEffect(() => {
    const allowedTypes =
      type === "bets" ? ["BET", "WIN", "CANCEL"] : ["DEPOSIT", "WITHDRAW"];

    let filtered = transactions.filter((tx) =>
      allowedTypes.includes(tx.type.toUpperCase())
    );

    if (filter !== "ALL") {
      filtered = filtered.filter((tx) => tx.type.toUpperCase() === filter);
    }

    setFilteredTxs(filtered);
  }, [filter, transactions, type]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY + 100 >=
        document.documentElement.offsetHeight
      ) {
        loadMoreTransactions();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, loading, hasMore]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const getLabelClass = (label) => {
    const lower = label.toLowerCase();
    if (lower === "withdraw" || lower === "bet") return styles.red;
    if (lower === "deposit" || lower === "win" || lower === "cancelled")
      return styles.green;
    return "";
  };

  const formatType = (type) => {
    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return { label: "Deposit", icon: <FaArrowDown color="green" /> };
      case "WITHDRAW":
        return { label: "Withdraw", icon: <FaArrowUp color="red" /> };
      case "BET":
        return { label: "Bet", icon: <FaArrowUp color="red" /> };
      case "WIN":
        return { label: "Win", icon: <FaArrowDown color="green" /> };
      case "CANCEL":
        return { label: "Cancelled", icon: <FaArrowDown color="green" /> };
      default:
        return { label: type, icon: null };
    }
  };

  return (
    <Wallet
      title={type === "bets" ? "Bet History" : "Transaction History"}
      onClose={onClose}
    >
      <div className={styles.walletHistoryContainer}>
        <div className={styles.headerContent}>
          {type !== "bets" && (
            <>
              <h3>
                Total Balance: <span>₹{balance}</span>
              </h3>
              <div className={styles.actionBtns}>
                <button className={styles.depositBtn} onClick={openDeposit}>
                  Deposit
                </button>
                <button className={styles.withdrawBtn} onClick={openWithdraw}>
                  Withdraw
                </button>
              </div>
              <div className={styles.tabs}>
                {["ALL", "DEPOSIT", "WITHDRAW"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={classnames(styles.tabButton, {
                      [styles.activeTab]: filter === tab,
                    })}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {loading && transactions.length === 0 ? (
          <p>Loading...</p>
        ) : filteredTxs.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <>
            <ul className={styles.transactionList}>
              {filteredTxs.map((tx, index) => {
                const { label, icon } = formatType(tx.type);
                return (
                  <li key={index} className={styles.transactionItem}>
                    <div className={styles.txType}>
                      {icon} <span>{label}</span>
                    </div>
                    <div className={styles.txDetails}>
                      <span className={styles.timestamp}>
                        <span className={styles.time}>
                          {new Date(tx.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className={styles.date}>
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </span>
                      <span
                        className={classnames(
                          styles.amount,
                          getLabelClass(label)
                        )}
                      >
                        {label === "Bet" || label === "Withdraw" ? "-" : "+"}
                        {tx.amount}
                      </span>

                      {type !== "bets" && (
                        <>
                          <span
                            className={classnames(styles.status, {
                              [styles.pending]: tx.status === "pending",
                              [styles.success]: tx.status === "success",
                              [styles.rejected]: tx.status === "rejected",
                            })}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                          {tx.status === "rejected" && tx.rejection_reason && (
                            <span className={styles.rejectionReason}>
                              Reason: {tx.rejection_reason}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {loading && <p>Loading more...</p>}
            {!hasMore && filteredTxs.length < 0 && <p>No more transactions.</p>}
          </>
        )}
      </div>
    </Wallet>
  );
};

export default WalletHistory;
