import React from "react";
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
    reset();
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-md dark:bg-gray-800 dark:text-white">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Nouvelle Transaction
        </h2>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Catégorie
          </label>
          <select
            id="category"
            {...register("category", { required: "Ce champ est obligatoire" })}
            className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Sélectionnez une catégorie --</option>
            <option value="Salaire" className="hover:bg-green-500">
              Salaire
            </option>
            <option value="Charges">Charges</option>
            <option value="Achat">Achat</option>
            <option value="Prime">Prime</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Montant
          </label>
          <input
            type="number"
            id="amount"
            {...register("amount", {
              required: "Ce champ est obligatoire",
              min: {
                value: 0.01,
                message: "Le montant doit être supérieur à 0",
              },
            })}
            className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register("description", {
              required: "Ce champ est obligatoire",
            })}
            rows={3}
            className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register("date", { required: "Ce champ est obligatoire" })}
            className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
