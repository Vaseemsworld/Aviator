import { createContext, useState, useRef, useEffect, useReducer } from "react";
import useSoundEffects from "../hooks/useSoundEffects";

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

const EngineProvider = ({ children }) => {
  const isLoadingRef = useRef(true);
  const score = useRef(1);
  const winningAmount = useRef(0);
  const [flash, setFlash] = useState(false);

  const [betState, dispatchBet] = useReducer(betReducer, initialState);
  const [alerts, setAlerts] = useState([]);

  const timeoutRef = useRef(new Map());

  const [activePage, setActivePage] = useState(null);
  const openDeposit = () => setActivePage("deposit");
  const openWithdraw = () => setActivePage("withdraw");
  const closePage = () => setActivePage(null);

  const { playWin } = useSoundEffects();

  const placeBet = (betKey, amount) => {
    dispatchBet({
      type: ACTIONS.PLACE_BET,
      betKey,
      payload: { amount },
    });
  };

  const cancelBet = (betKey, amount) => {
    if (betState[betKey].hasDeductedBalance) {
      dispatchBet({
        type: ACTIONS.ADD_BALANCE,
        payload: parseFloat(amount),
      });
    }
    dispatchBet({
      type: ACTIONS.RESET_BET,
      betKey,
      payload: getDefaultBetState(),
    });
  };

  const cashOut = (betKey, amount, score) => {
    const winnings = parseFloat(amount) * score.current;
    dispatchBet({
      type: ACTIONS.ADD_BALANCE,
      payload: winnings,
    });
    winningAmount.current = winnings;
    playWin();
    handleAlertMessage("CASHOUT");
    dispatchBet({
      type: ACTIONS.RESET_BET,
      betKey,
      payload: getDefaultBetState(),
    });
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
        closePage,
        openDeposit,
        openWithdraw,
      }}
    >
      {children}
    </EnginContext.Provider>
  );
};

export default EngineProvider;
