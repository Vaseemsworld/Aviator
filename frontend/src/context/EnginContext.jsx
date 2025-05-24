import { createContext, useState, useRef, useEffect } from "react";

export const EnginContext = createContext();

const EnginProvider = ({ children }) => {
  const isLoadingRef = useRef(true);
  const score = useRef(1);
  const winningAmount = useRef(0);
  const [flash, setFlash] = useState(false);

  const [balance, setBalance] = useState(100.0);
  const [betState, setBetState] = useState({
    betAmount1: "10.00",
    betAmount2: "10.00",
    isBet1Placed: false,
    isBet2Placed: false,
    hasDeductedBalance1: false,
    hasDeductedBalance2: false,
    buttonState1: "IDLE",
    buttonState2: "IDLE",
  });
  const [alerts, setAlerts] = useState([]);
  const timeoutRef = useRef(new Map());
  const placeBet = (betKey, amount) => {
    const numericAmount = parseFloat(amount);
    if (balance < numericAmount) {
      setBetState((prev) => ({
        ...prev,
        [`buttonState${betKey}`]: "IDLE",
        [`isBet${betKey}Placed`]: false,
      }));
      return { error: "LOW_BALANCE" };
    }

    setBalance((prev) => prev - numericAmount);
    setBetState((prev) => ({
      ...prev,
      [`buttonState${betKey}`]: "BET_PLACED",
      [`hasDeductedBalance${betKey}`]: true,
      [`isBet${betKey}Placed`]: true,
    }));
  };

  const cancelBet = (betKey, amount) => {
    if (betState[`hasDeductedBalance${betKey}`]) {
      setBalance((prev) => prev + parseFloat(amount));
    }
    setBetState((prev) => ({
      ...prev,
      [`buttonState${betKey}`]: "IDLE",
      [`isBet${betKey}Placed`]: false,
      [`hasDeductedBalance${betKey}`]: false,
    }));
  };

  const cashOut = (
    betKey,
    amount,
    score,
    playWin,
    winningAmount,
    handleAlertMessage
  ) => {
    const winnings = parseFloat(amount) * score.current;
    setBalance((prev) => prev + winnings);
    winningAmount.current = winnings;
    playWin();
    handleAlertMessage("CASHOUT");
    setButtonState(betKey, "IDLE");
    setBetState((prev) => ({
      ...prev,
      [`buttonState${betKey}`]: "IDLE",
      [`isBet${betKey}Placed`]: false,
      [`hasDeductedBalance${betKey}`]: false,
    }));
  };

  const setButtonState = (betKey, state) => {
    setBetState((prev) => ({ ...prev, [`buttonState${betKey}`]: state }));
  };

  // useEffect(() => {
  //   if (syncedIsLoading) {
  //     if (buttonState === "WAITING") {
  //       if (!hasDeductedBalance && balance >= numValue) {
  //         setButtonState("BET_PLACED");
  //         setBalance((prev) => prev - numValue);
  //         setHasDeductedBalance(true);
  //       } else {
  //         handleAlertMessage("LOW_BALANCE");
  //         setButtonState("IDLE");
  //       }
  //     } else if (buttonState === "FLYING") {
  //       setButtonState("IDLE");
  //       setIsBetPlaced(false);
  //       setHasDeductedBalance(false);
  //     }
  //   } else {
  //     if (buttonState === "BET_PLACED") {
  //       setButtonState("FLYING");
  //       setIsBetPlaced(true);
  //     }
  //     setFlash(true);
  //     const timeout = setTimeout(() => {
  //       setFlash(false);
  //     }, 200);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [syncedIsLoading]);

  // const handleBetBtn = () => {
  //   switch (buttonState) {
  //     case "IDLE":
  //       if (syncedIsLoading) {
  //         if (balance >= numValue) {
  //           setButtonState("BET_PLACED");
  //           setBalance((prev) => prev - numValue);
  //           setHasDeductedBalance(true);
  //         } else {
  //           handleAlertMessage("LOW_BALANCE");
  //         }
  //       } else {
  //         setButtonState("WAITING");
  //       }
  //       break;
  //     case "BET_PLACED":
  //       if (syncedIsLoading) {
  //         if (hasDeductedBalance) {
  //           setBalance((prev) => prev + numValue);
  //           setHasDeductedBalance(false);
  //         }
  //       }
  //       setButtonState("IDLE");
  //       break;
  //     case "FLYING":
  //       if (!syncedIsLoading) {
  //         setBalance((prev) => prev + numValue * score.current);
  //         setButtonState("IDLE");
  //         setIsBetPlaced(false);
  //         winningAmount.current = numValue * score.current;
  //         playWin();
  //         handleAlertMessage("CASHOUT");
  //         setHasDeductedBalance(false);
  //       }
  //       break;
  //     case "WAITING":
  //       if (!syncedIsLoading) {
  //         setButtonState("IDLE");
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const addAlert = (alert) => {
    const id = Date.now() + Math.random();
    const alertWithId = { ...alert, id };

    // if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setAlerts((prev) => [...prev, alertWithId]);

    const timeoutId = setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      timeoutRef.current.delete();
    }, 3000);
    timeoutRef.current.set(id, timeoutId);
  };
  const handleAlertMessage = (state) => {
    if (state === "CASHOUT") {
      const message = `${winningAmount.current.toFixed(2)}`;
      addAlert({ type: "cashout", text: message });
    } else if (state === "LOW_BALANCE") {
      const message = `Insufficient Balance`;
      addAlert({ type: "error", text: message });
    }
  };

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRef.current.clear();
    };
  }, []);

  // useEffect(() => {
  //   if (timeoutRef.current) clearTimeout(timeoutRef.current);
  //   timeoutRef.current = null;
  //   setAlerts([]);
  // }, [isLoadingRef.current]);

  return (
    <EnginContext.Provider
      value={{
        isLoadingRef,
        score,
        balance,
        setBalance,
        flash,
        setFlash,
        betState,
        setBetState,
        placeBet,
        cancelBet,
        cashOut,
        setButtonState,
        alerts,
        handleAlertMessage,
        winningAmount,
      }}
    >
      {children}
    </EnginContext.Provider>
  );
};

export default EnginProvider;
