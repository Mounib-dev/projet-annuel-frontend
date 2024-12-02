import React from "react";
import '../assets/transaction.css'
import { useForm, SubmitHandler } from "react-hook-form";

type TransactionData = {
  category: string;
  amount: number;
  description: string;
  date: string;
};

type TransactionFormProps = {
  onFormSubmit: (data: TransactionData) => void;
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onFormSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionData>();

  const handleFormSubmit: SubmitHandler<TransactionData> = (data) => {

    onFormSubmit(data);
    console.log('détails de la transaction', data);
    reset();
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Nouvelle Transaction</h2>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie
          </label>
          <select
            id="category"
            {...register("category", { required: "Ce champ est obligatoire" })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Sélectionnez une catégorie --</option>
            <option value="Salaire">Salaire</option>
            <option value="Charges">Charges</option>
            <option value="Achat">Achat</option>
            <option value="Prime">Prime</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Montant
          </label>
          <input
            type="number"
            id="amount"
            {...register("amount", {
              required: "Ce champ est obligatoire",
              min: { value: 0.01, message: "Le montant doit être supérieur à 0" },
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register("description", { required: "Ce champ est obligatoire" })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register("date", { required: "Ce champ est obligatoire" })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
