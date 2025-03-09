import React, { useEffect, useState } from "react";
import TransactionForm from "./TransactionForm";
import api from "../../api";

import type { TransactionData } from "./TransactionForm";

const Transaction: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [amount, setAmount] = useState("");
  // const [submittedData, setSubmittedData] = useState<TransactionData | null>(
  //   null,
  // );

  const handleTransactionSubmit = (transaction: TransactionData) => {
    setTransactions([...transactions, transaction]);
    setCurrentPage(1);
  };

  const txPerPage = 5;
  const totalPages = Math.ceil(transactions.length / txPerPage);
  const startIndex = (currentPage - 1) * txPerPage;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + txPerPage,
  );

  const transactionsEndpoint = "transaction/list";
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/${transactionsEndpoint}`,
        );

        if (response.status === 200) {
          const retrievedTransactions = response.data;
          console.log(retrievedTransactions);
          setTransactions(retrievedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-lg p-4 shadow-md">
      <TransactionForm onFormSubmit={handleTransactionSubmit} />

      <h3 className="mt-5 mb-2 text-lg font-semibold dark:text-white">
        Transactions
      </h3>
      <ul className="space-y-2">
        {paginatedTransactions.map((tx, index) => (
          <li
            key={index}
            className={`flex justify-between rounded border p-2 ${tx.type === "expense" ? "dark:text-red-400" : "dark:text-green-500"}`}
          >
            <span>{tx.description}</span>
            <span>
              {tx.type === "expense" ? "-" : "+"}
              {tx.amount}€ (
              {tx.date.split("T")[0].split("-").reverse().join("/")})
            </span>
          </li>
        ))}
      </ul>
      {/* Pagination Controls */}
      {transactions.length > txPerPage && (
        <div className="mt-4 flex justify-between">
          <button
            className={`rounded px-4 py-2 ${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`rounded px-4 py-2 ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default Transaction;
