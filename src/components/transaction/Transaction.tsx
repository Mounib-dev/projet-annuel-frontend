import React, { useState } from "react";
import { type TransactionData } from "./TransactionForm";
import { useBalance } from "../../context/BalanceContext";
import TransactionsList from "./TransactionsList";

const Transaction: React.FC = () => {
  const { balance, setBalance } = useBalance();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleTransactionSubmit = (transaction: TransactionData) => {
    if (transaction.transactionType === "expense") {
      setBalance(balance! - +transaction.amount);
    } else if (transaction.transactionType === "income") {
      setBalance(balance! + +transaction.amount);
    }
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      {/* Liste des transactions + bouton d’ouverture de popup dans la liste */}
      <div className="mt-6">
        <TransactionsList
          refreshKey={refreshKey}
          onCreate={handleTransactionSubmit}
        />
      </div>
    </>
  );
};

export default Transaction;
