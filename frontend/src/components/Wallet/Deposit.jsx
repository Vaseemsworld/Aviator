import React, { useState } from "react";
import api from "../../api";

const Deposit = () => {
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    try {
      const response = await api.post("/users/deposit/", {
        amount: parseFloat(amount),
      });
      alert(`Deposit successful! New Balance: ${response.data.balance}`);
    } catch (error) {
      alert("Deposit failed. Try again.");
    }
  };

  return (
    <div>
      <h2>Deposit Funds</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleDeposit}>Deposit</button>
    </div>
  );
};

export default Deposit;
