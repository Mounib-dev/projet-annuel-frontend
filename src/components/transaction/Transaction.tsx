import React, { useState } from "react";
import TransactionForm from "./TransactionForm";

type TransactionData = {
  category: string;
  amount: number;
  description: string;
  date: string;
};

const Transaction: React.FC = () => {
  const [submittedData, setSubmittedData] = useState<TransactionData | null>(
    null,
  );

  const handleTransactionSubmit = (data: TransactionData) => {
    setSubmittedData(data);
  };

  return (
    <div className="mt-5 flex flex-col items-center justify-center">
      <TransactionForm onFormSubmit={handleTransactionSubmit} />

      {submittedData && (
        <div className="mt-6 w-full max-w-lg rounded-md bg-white p-6 shadow-md dark:bg-gray-800 dark:text-white">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Détails de la transaction :
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            <strong>Catégorie :</strong> {submittedData.category}
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            <strong>Montant :</strong> {submittedData.amount} €
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            <strong>Description :</strong> {submittedData.description}
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            <strong>Date :</strong> {submittedData.date}
          </p>
        </div>
      )}
    </div>
  );
};

export default Transaction;
