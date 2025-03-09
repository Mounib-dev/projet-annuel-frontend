import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  BicepsFlexed,
  Utensils,
  BusFront,
  Euro,
  Plus,
  Info,
  MoveUp,
  PiggyBank,
  Bitcoin,
  ShoppingBasket,
  Plane,
} from "lucide-react";
import DialogModal from "../utils/DialogModal";
import CategoryForm from "../category/CategoryForm";
import axios from "axios";

export type TransactionData = {
  transactionType: string;
  type?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
};

type CategoryMapping = {
  [key: string]: string;
};

const categoryMapping: CategoryMapping = {
  sport: "Sport",
  food: "Restaurant",
  transport: "Transport",
  groceryShop: "Courses",
  travel: "Voyage",
  salary: "Salaire",
  gain: "Gain",
  crypto: "Cryptomonnaie",
};

type TransactionFormProps = {
  onFormSubmit: (data: TransactionData) => void;
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onFormSubmit }) => {
  // const [transactionType, setTransactionType] = useState<string>("");
  // const [activeIcon, setActiveIcon] = useState<string | null>(null);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const transactionType = watch("transactionType");

  const handleTransactionChange = (value: string) => {
    setValue("transactionType", value, { shouldValidate: true });
  };

  const handleCategoryChange = (value: string) => {
    setValue("category", value, { shouldValidate: true });
    setSelectedCategory(value);
  };

  const handleFormSubmit: SubmitHandler<TransactionData> = async (data) => {
    // onFormSubmit(data);
    console.log(data);
    const newTransactionEndpoint = "transaction/create";
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/${newTransactionEndpoint}`,
      data,
    );
    if (response.status === 201) {
      onFormSubmit(data);
      reset();
    }
  };

  // const selectTransactionType = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log(e.target.value);
  //   setTransactionType(e.target.value);
  // };

  // const toggleIconClass = (iconName: string) => {
  //   setActiveIcon((prev) => (prev === iconName ? null : iconName));
  // };

  const receiveIconName = (data: string) => {
    console.log(data);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-md dark:bg-gray-800 dark:text-white">
        <DialogModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          hasCloseBtn={true}
        >
          <CategoryForm sendIconToTransactionForm={receiveIconName} />
        </DialogModal>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
            Nouvelle Transaction
          </h2>

          <div className="flex items-center justify-center gap-2">
            <label htmlFor="expense" className="cursor-pointer">
              <input
                type="radio"
                id="expense"
                value="expense"
                {...register("transactionType", {
                  required: "Le type de transaction est requis.",
                })}
                className="peer hidden"
                onChange={() => handleTransactionChange("expense")}
              />
              <div className="rounded-full border-2 border-green-500 px-3 py-2 text-green-400 transition peer-checked:border-none peer-checked:bg-green-700 peer-checked:text-white hover:text-zinc-200">
                Dépense
              </div>
            </label>
            <label htmlFor="income" className="cursor-pointer">
              <input
                type="radio"
                id="income"
                value="income"
                {...register("transactionType")}
                className="peer hidden"
                onChange={() => handleTransactionChange("income")}
              />
              <div className="rounded-full border-2 border-green-500 px-3 py-2 text-green-400 transition peer-checked:border-none peer-checked:bg-green-700 peer-checked:text-white hover:text-zinc-200">
                Revenu
              </div>
            </label>
          </div>

          {/* Error message for Transaction Type*/}
          {errors.transactionType && (
            <p className="text-sm text-red-500">
              {errors.transactionType.message}
            </p>
          )}

          {!transactionType && (
            <div className="flex gap-2 rounded-md border px-2 py-3 text-blue-400 transition">
              <Info />
              <p>Sélectionnez un type de transaction</p>
              <MoveUp className="animate-bounce" />
            </div>
          )}

          {transactionType && (
            <div>
              <label
                htmlFor=""
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Catégorie
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <label htmlFor="sport">
                  <input
                    type="radio"
                    id="sport"
                    value="sport"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    className="peer hidden"
                    onChange={() => handleCategoryChange("sport")}
                  />
                  <BicepsFlexed className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="food">
                  <input
                    type="radio"
                    id="food"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="food"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("food")}
                  />
                  <Utensils className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="transport">
                  <input
                    type="radio"
                    id="transport"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="transport"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("transport")}
                  />
                  <BusFront className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="groceryShop">
                  <input
                    type="radio"
                    id="groceryShop"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="groceryShop"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("groceryShop")}
                  />
                  <ShoppingBasket className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="travel">
                  <input
                    type="radio"
                    id="travel"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="travel"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("travel")}
                  />
                  <Plane className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="salary">
                  <input
                    type="radio"
                    id="salary"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="salary"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("salary")}
                  />
                  <Euro className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="gain">
                  <input
                    type="radio"
                    id="gain"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="gain"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("gain")}
                  />
                  <PiggyBank className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                <label htmlFor="crypto">
                  <input
                    type="radio"
                    id="crypto"
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    value="crypto"
                    className="peer hidden"
                    onChange={() => handleCategoryChange("crypto")}
                  />
                  <Bitcoin className="cursor-pointer transition-colors peer-checked:text-green-500" />
                </label>
                {/* Separator */}
                <div className="mx-2 h-6 w-0.25 bg-green-500"></div>
                <Plus
                  className="cursor-pointer rounded-full border text-green-500"
                  onClick={() => {
                    setModalOpen(true);
                  }}
                />
                Créer
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
              <p className="mt-2 text-xl text-green-500">
                {categoryMapping[`${selectedCategory}`]}
              </p>
            </div>
          )}

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
              <p className="mt-1 text-sm text-red-500">
                {errors.amount.message}
              </p>
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
    </>
  );
};

export default TransactionForm;
