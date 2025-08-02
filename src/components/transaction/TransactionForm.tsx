import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
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
  Martini,
  CreditCard,
  HomeIcon,
  ShoppingCart,
  GiftIcon,
} from "lucide-react";

import DialogModal from "../utils/DialogModal";
import CategoryForm from "../category/CategoryForm";

export type TransactionData = {
  transactionType: string;
  type?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
};


const iconMap: Record<string, React.ReactNode> = {
  martini: <Martini />,
  "credit-card": <CreditCard />,
   "HomeIcon": <HomeIcon />,
  "shopping-cart": <ShoppingCart />,
  "GiftIcon": <GiftIcon />,
  sport: <BicepsFlexed />,
  food: <Utensils />,
  transport: <BusFront />,
  groceryShop: <ShoppingBasket />,
  travel: <Plane />,
  salary: <Euro />,
  gain: <PiggyBank />,
  crypto: <Bitcoin />,
};

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// 🎯 Catégories par défaut
const defaultCategories: Category[] = [
  { id: "sport", label: "Sport", icon: <BicepsFlexed /> },
  { id: "food", label: "Restaurant", icon: <Utensils /> },
  { id: "transport", label: "Transport", icon: <BusFront /> },
  { id: "groceryShop", label: "Courses", icon: <ShoppingBasket /> },
  { id: "travel", label: "Voyage", icon: <Plane /> },
  { id: "salary", label: "Salaire", icon: <Euro /> },
  { id: "gain", label: "Gain", icon: <PiggyBank /> },
  { id: "crypto", label: "Cryptomonnaie", icon: <Bitcoin /> },
];

type TransactionFormProps = {
  onFormSubmit: (data: TransactionData) => void;
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onFormSubmit }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

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
    const newTransactionEndpoint = "transaction/create";
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/${newTransactionEndpoint}`,
      data
    );
    if (response.status === 201) {
      onFormSubmit(data);
      reset();
    }
  };

  const handleAddCategory = (newCategory: {
    id: string;
    title: string;
    icon: React.ReactNode;
  }) => {
    setCategories((prev) => [
      ...prev,
      {
        id: newCategory.id,
        label: capitalizeFirst(newCategory.title),
        icon: newCategory.icon,
      },
    ]);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/category`
        );
        const categoriesFromAPI = response.data.map((cat: any) => ({
          id: cat._id || cat.id,
          label: capitalizeFirst(cat.title),
          icon: iconMap[cat.icon] || <Info />, 
        }));

        setCategories([...defaultCategories, ...categoriesFromAPI]);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
        setCategories([...defaultCategories]); 
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-md dark:bg-gray-800 dark:text-white">
      <DialogModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        hasCloseBtn={true}
      >
        <CategoryForm onAddCategory={handleAddCategory} />
      </DialogModal>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Nouvelle Transaction
        </h2>

        {/* Sélection Type de transaction */}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Catégorie
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {categories.map((cat) => (
                <label htmlFor={cat.id} key={cat.id}>
                  <input
                    type="radio"
                    id={cat.id}
                    value={cat.id}
                    {...register("category", {
                      required: "Vous devez choisir une catégorie",
                    })}
                    className="peer hidden"
                    onChange={() => handleCategoryChange(cat.id)}
                  />
                  <div className="cursor-pointer transition-colors peer-checked:text-green-500">
                    {cat.icon}
                  </div>
                </label>
              ))}

              {/* Ajouter nouvelle catégorie */}
              <div className="mx-2 h-6 w-0.5 bg-green-500"></div>
              <div
                className="flex cursor-pointer items-center gap-1 text-green-500"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="rounded-full border" />
                Créer
              </div>
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
            <p className="mt-2 text-xl text-green-500">
              {
                categories.find((cat) => cat.id === selectedCategory)?.label
              }
            </p>
          </div>
        )}

        {/* Montant */}
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

        {/* Description */}
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

        {/* Date */}
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
            <p className="mt-1 text-sm text-red-500">
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Bouton Submit */}
        <button
          type="submit"
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
