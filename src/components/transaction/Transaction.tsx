import React, { useEffect, useState } from "react";
import TransactionForm from "./TransactionForm";
import api from "../../api";

import { useBalance } from "../../context/BalanceContext";

import type { TransactionData } from "./TransactionForm";

const Transaction: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const { balance, setBalance } = useBalance();

  const handleTransactionSubmit = (transaction: TransactionData) => {
    setTransactions([...transactions, transaction]);
    if (transaction.transactionType === "expense") {
      setBalance(balance - +transaction.amount);
    } else if (transaction.transactionType === "income") {
      setBalance(balance + +transaction.amount);
    }
  };

  const transactionsEndpoint = "transaction/list";
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/${transactionsEndpoint}`,
        );

        if (response.status === 200) {
          const retrievedTransactions = response.data;
          setTransactions(retrievedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="mx-auto mt-5 max-w-md rounded-lg p-4 shadow-md">
      <TransactionForm onFormSubmit={handleTransactionSubmit} />
    </div>
  );
};

export default Transaction;
