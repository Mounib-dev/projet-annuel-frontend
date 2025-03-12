import React, { useState } from "react";
import api from "../../api";

interface BalanceModalProps {
  open: boolean;
  onSave: (balance: number) => void;
}

const BalanceModal: React.FC<BalanceModalProps> = ({ open, onSave }) => {
  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setError("Veuillez entrer un solde valide.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/balance/create`,
        { amount: parsedBalance },
      );

      if (response.status !== 201) {
        throw new Error("Échec de l'enregistrement du solde");
      }

      onSave(parsedBalance);
    } catch (err) {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Entrez votre solde
        </h2>
        <input
          type="number"
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-green-400"
          placeholder="Saisissez votre solde"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-500 dark:hover:bg-green-600"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;
