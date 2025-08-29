import React, { useState } from "react";
import TransactionForm from "./TransactionForm";
import { useBalance } from "../../context/BalanceContext";
import type { TransactionData } from "./TransactionForm";
import TransactionsList from "./TransactionsList";

const Transaction: React.FC = () => {
  const { balance, setBalance } = useBalance();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleTransactionSubmit = (transaction: TransactionData) => {
    if (transaction.transactionType === "expense") {
      setBalance(balance - +transaction.amount);
    } else if (transaction.transactionType === "income") {
      setBalance(balance + +transaction.amount);
    }
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      {/* Liste des transactions */}
      <div className="mt-6">
        <TransactionsList refreshKey={refreshKey} />
      </div>
      {/* Formulaire de création */}
      <div className="mx-auto my-3 max-w-md rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <TransactionForm onFormSubmit={handleTransactionSubmit} />
      </div>
    </>
  );
};

export default Transaction;
