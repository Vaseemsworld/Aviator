import { createContext, useState, useRef, useEffect, useReducer } from "react";
import useSoundEffects from "../hooks/useSoundEffects";
import { toast } from "react-toastify";
import api from "../api";
import { fetchBalance } from "../utils/fetchBalance";

export const EnginContext = createContext();

const BUTTON_STATES = {
  IDLE: "IDLE",
  BET_PLACED: "BET_PLACED",
  WAITING: "WAITING",
  FLYING: "FLYING",
};
const ACTIONS = {
  // Bet Actions
  PLACE_BET: "PLACE_BET",
  CANCEL_BET: "CANCEL_BET",
  RESET_BET: "RESET_BET",
  UPDATE_BET: "UPDATE_BET",
  SET_BET_AMOUNT: "SET_BET_AMOUNT",
  SET_BUTTON_STATE: "SET_BUTTON_STATE",
  SET_BET_PLACED: "SET_BET_PLACED",
  SET_HAS_DEDUCTED_BALANCE: "SET_HAS_DEDUCTED_BALANCE",
  SET_AUTO_BET: "SET_AUTO_BET",
  SET_AUTO_CASHOUT: "SET_AUTO_CASHOUT",

  // Balance actions
  DEDUCT_BALANCE: "DEDUCT_BALANCE",
  ADD_BALANCE: "ADD_BALANCE",
  SET_BALANCE: "SET_BALANCE",
};

const initialState = {
  balance: 100.0,
  bet1: {
    betAmount: "10.00",
    isPlaced: false,
    hasDeductedBalance: false,
    autoBet: false,
    autoCashout: false,
    buttonState: BUTTON_STATES.IDLE,
  },
  bet2: {
    betAmount: "10.00",
    isPlaced: false,
    hasDeductedBalance: false,
    autoBet: false,
    autoCashout: false,
    buttonState: BUTTON_STATES.IDLE,
  },
  alert: null,
};
const getDefaultBetState = () => ({
  buttonState: BUTTON_STATES.IDLE,
  isPlaced: false,
  hasDeductedBalance: false,
});
const betReducer = (state, action) => {
  const betKey = action.betKey || "bet1";
  let balance = state.balance;
  switch (action.type) {
    case ACTIONS.PLACE_BET:
      const { amount } = action.payload;
      const numericAmount = parseFloat(amount || "0");

      if (numericAmount > state.balance) {
        return {
          ...state,
          [betKey]: {
            ...state[betKey],
            ...getDefaultBetState(),
          },
          alert: "LOW_BALANCE",
        };
      }
      balance -= numericAmount;
      return {
        ...state,
        balance: balance,
        [betKey]: {
          ...state[betKey],
          betAmount: amount,
          isPlaced: true,
          hasDeductedBalance: true,
          buttonState: BUTTON_STATES.BET_PLACED,
        },
      };
    case ACTIONS.SET_BET_AMOUNT:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          betAmount: action.payload,
        },
      };
    case ACTIONS.SET_BUTTON_STATE:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          buttonState: action.payload,
        },
      };
    case ACTIONS.SET_BET_PLACED:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          isPlaced: action.payload,
        },
      };
    case ACTIONS.SET_HAS_DEDUCTED_BALANCE:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          hasDeductedBalance: action.payload,
        },
      };
    case ACTIONS.UPDATE_BET:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          ...(action.payload || {
            buttonState: BUTTON_STATES.BET_PLACED,
            isPlaced: true,
            hasDeductedBalance: true,
          }),
        },
      };
    case ACTIONS.RESET_BET:
      return {
        ...state,
        [betKey]: {
          ...state[betKey],
          ...(action.payload || getDefaultBetState()),
        },
      };
    case ACTIONS.SET_AUTO_BET:
      return {
        ...state,
        [betKey]: { ...state[betKey], autoBet: action.payload },
      };
    case ACTIONS.SET_AUTO_CASHOUT:
      return {
        ...state,
        [betKey]: { ...state[betKey], autoCashout: action.payload },
      };

    // balance operations
    case ACTIONS.DEDUCT_BALANCE:
      return {
        ...state,
        balance: state.balance - parseFloat(action.payload),
      };
    case ACTIONS.ADD_BALANCE:
      return {
        ...state,
        balance: state.balance + parseFloat(action.payload),
      };
    case ACTIONS.SET_BALANCE:
      return {
        ...state,
        balance: parseFloat(action.payload),
      };
    default:
      return state;
  }
};

const EngineProvider = ({ children, initialBalance = 0 }) => {
  const isLoadingRef = useRef(true);
  const score = useRef(1);
  const winningAmount = useRef(0);
  const [flash, setFlash] = useState(false);

  const [betState, dispatchBet] = useReducer(betReducer, {
    ...initialState,
    balance: initialBalance,
  });
  const [alerts, setAlerts] = useState([]);

  const timeoutRef = useRef(new Map());

  const [activePage, setActivePage] = useState(null);
  const [type, setType] = useState(null);
  const openDeposit = () => setActivePage("deposit");
  const openWithdraw = () => setActivePage("withdraw");
  const openWalletHistory = (type) => {
    setActivePage("walletHistory");
    if (type === "bets") {
      setType("bets");
    } else if (type === "transactions") {
      setType("transactions");
    } else {
      setType(null);
    }
  };
  const openContactUs = () => {
    console.log("called"), setActivePage("contact");
  };

  const closePage = () => {
    setActivePage(null);
    setType(null);
  };

  const { playWin } = useSoundEffects();

  // const getBalance = async () => {
  //   try {
  //     const token = localStorage.getItem("access");
  //     if (!token) return;

  //     const res = await api.get("/wallet/balance/", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     dispatchBet({ type: ACTIONS.SET_BALANCE, payload: res.data.balance });
  //   } catch (err) {
  //     console.error("Failed to fetch balance", err);
  //   }
  // };
  const getBalance = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    const balance = await fetchBalance({ token });
    if (balance !== null) {
      dispatchBet({ type: ACTIONS.SET_BALANCE, payload: balance });
    }
  };

  const placeBet = async (betKey, amount) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        toast.error("You need to be logged in to place a bet.");
        return { success: false, error: "Not authenticated" };
      }
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) {
        console.error("Enter a valid bet");
        return { success: false, error: "Invalid amount" };
      }
      const currentBalance = await fetchBalance({ token });
      if (amt > currentBalance) {
        dispatchBet({
          type: ACTIONS.RESET_BET,
          betKey,
          payload: getDefaultBetState(),
        });
        handleAlertMessage("LOW_BALANCE");
        return { success: false, error: "Insufficient balance" };
      }

      const res = await api.post(
        "/wallet/bet/",
        { amount: amt, bet_key: betKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatchBet({
        type: ACTIONS.PLACE_BET,
        betKey,
        payload: { amount: amt },
      });
      if (res.data?.balance !== undefined) {
        dispatchBet({
          type: ACTIONS.SET_BALANCE,
          payload: res.data.balance,
        });
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Bet placement failed",
      };
    }
  };
  const cancelBet = async (betKey, amount) => {
    if (betState[betKey].hasDeductedBalance) {
      try {
        const token = localStorage.getItem("access");
        const res = await api.post(
          "/wallet/cancel/",
          { amount: parseFloat(amount), bet_key: betKey },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        dispatchBet({
          type: ACTIONS.SET_BALANCE,
          payload: res.data.balance,
        });

        dispatchBet({
          type: ACTIONS.RESET_BET,
          betKey,
          payload: getDefaultBetState(),
        });
      } catch (err) {
        const error = err.response?.data?.detail || "Cancel bet failed";
        return error;
      }
    }
  };

  const cashOut = async (betKey, amount, score) => {
    const multiplier = score.current;
    const winnings = parseFloat(amount) * multiplier;

    try {
      const token = localStorage.getItem("access");
      const res = await api.post(
        "/wallet/win/",
        {
          amount: winnings.toFixed(2),
          bet_key: betKey,
          multiplier: multiplier.toFixed(2),
          base_bet: parseFloat(amount).toFixed(2),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatchBet({
        type: ACTIONS.SET_BALANCE,
        payload: res.data.balance,
      });
      winningAmount.current = winnings;
      playWin();
      handleAlertMessage("CASHOUT");
      dispatchBet({
        type: ACTIONS.RESET_BET,
        betKey,
        payload: getDefaultBetState(),
      });
    } catch (err) {
      const error = err.response?.data?.detail || "Cashout failed";
      return error;
    }
  };

  const addAlert = (alert) => {
    const id = Date.now() + Math.random();
    const alertWithId = { ...alert, id };

    setAlerts((prev) => [...prev, alertWithId]);

    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, entering: false } : a))
      );
    }, 300);

    const timeoutId = setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, leaving: true } : a))
      );
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        timeoutRef.current.delete(id);
      }, 500);
    }, 3000);
    timeoutRef.current.set(id, timeoutId);
  };
  const handleAlertMessage = (state) => {
    if (state === "CASHOUT") {
      const message = `${winningAmount.current.toFixed(2)}`;
      const scoreAtCashout = score.current.toFixed(2);
      addAlert({ type: "cashout", text: message, score: scoreAtCashout });
    } else if (state === "LOW_BALANCE") {
      const message = `Insufficient Balance`;
      addAlert({ type: "error", text: message });
    }
  };

  useEffect(() => {
    getBalance();
    const timeOutRefCurrent = timeoutRef.current;
    return () => {
      timeOutRefCurrent.forEach((timeout) => clearTimeout(timeout));
      timeOutRefCurrent.clear();
    };
  }, []);

  return (
    <EnginContext.Provider
      value={{
        isLoadingRef,
        score,
        flash,
        setFlash,
        betState,
        ACTIONS,
        BUTTON_STATES,
        placeBet,
        cancelBet,
        cashOut,
        alerts,
        handleAlertMessage,
        dispatchBet,
        activePage,
        type,
        closePage,
        openDeposit,
        openWithdraw,
        openWalletHistory,
        openContactUs,
      }}
    >
      {children}
    </EnginContext.Provider>
  );
};

export default EngineProvider;
