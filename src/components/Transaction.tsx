import React, { useState } from "react";
import TransactionForm from "./TransactionForm";

type TransactionData = {
    category: string;
    amount: number;
    description: string;
    date: string;
};

const Transaction: React.FC = () => {
    const [submittedData, setSubmittedData] = useState<TransactionData | null>(null);

    const handleTransactionSubmit = (data: TransactionData) => {
        setSubmittedData(data);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col p-4">
            <TransactionForm onFormSubmit={handleTransactionSubmit} />

            {submittedData && (
                <div className="mt-6 w-full max-w-lg bg-white p-4 shadow-md rounded-md space-y-4">
                    <h3 className="text-xl font-bold mb-4">Détails de la transaction :</h3>
                    <p><strong>Catégorie :</strong> {submittedData.category}</p>
                    <p><strong>Montant :</strong> {submittedData.amount} €</p>
                    <p><strong>Description :</strong> {submittedData.description}</p>
                    <p><strong>Date :</strong> {submittedData.date}</p>
                </div>
            )}
        </div>
    );
};

export default Transaction;
