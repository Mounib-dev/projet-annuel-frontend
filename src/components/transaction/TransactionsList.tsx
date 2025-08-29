import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { useBalance } from "../../context/BalanceContext";
import type { TransactionData } from "./TransactionForm";
import {
  Pencil,
  Trash2,
  X,
  Save,
  Info,
  BicepsFlexed,
  Utensils,
  BusFront,
  Euro,
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

/** Types **/
type TransactionItem = TransactionData & {
  _id: string;
  type: string;
};

type CategoryFromApi = {
  _id: string;
  title: string;
  icon: string;
};

/** Available icons **/
const iconMap: Record<string, React.ReactNode> = {
  martini: <Martini />,
  "credit-card": <CreditCard />,
  HomeIcon: <HomeIcon />,
  "shopping-cart": <ShoppingCart />,
  GiftIcon: <GiftIcon />,
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

/**Default Categories **/
const defaultCategories: {
  id: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "sport", label: "Sport", icon: <BicepsFlexed /> },
  { id: "food", label: "Restaurant", icon: <Utensils /> },
  { id: "transport", label: "Transport", icon: <BusFront /> },
  { id: "groceryShop", label: "Courses", icon: <ShoppingBasket /> },
  { id: "travel", label: "Voyage", icon: <Plane /> },
  { id: "salary", label: "Salaire", icon: <Euro /> },
  { id: "gain", label: "Gain", icon: <PiggyBank /> },
  { id: "crypto", label: "Cryptomonnaie", icon: <Bitcoin /> },
];

function truncate(text: string, max = 36) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl dark:bg-gray-800 dark:text-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Fermer"
          >
            <X />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

type Props = {
  refreshKey?: number;
};

const TransactionsList: React.FC<Props> = ({ refreshKey = 0 }) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<
    { id: string; label: string; icon: React.ReactNode }[]
  >([]);
  const [editItem, setEditItem] = useState<TransactionItem | null>(null);
  const [form, setForm] = useState<TransactionData | null>(null);
  const { balance, setBalance } = useBalance();

  /** Fetch categories  **/
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<CategoryFromApi[]>(
          `${import.meta.env.VITE_API_BASE_URL}/category`,
        );
        const catsFromApi = (res.data || []).map((c) => ({
          id: c._id,
          label: capitalizeFirst(c.title),
          icon: iconMap[c.icon] || <Info />,
        }));
        setCategories([...defaultCategories, ...catsFromApi]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // fallback
        setCategories([...defaultCategories]);
      }
    };
    fetchCategories();
  }, []);

  /** Fetch transactions **/
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactionsEndpoint = "transaction/list";
      const res = await api.get<TransactionItem[]>(
        `${import.meta.env.VITE_API_BASE_URL}/${transactionsEndpoint}`,
      );
      const items = Array.isArray(res.data) ? res.data : [];

      items.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      });
      setTransactions(items);
    } catch (e) {
      console.error("Error fetching transactions:", e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const applyBalanceDeltaForUpdate = (
    oldTx: TransactionItem,
    newTx: TransactionData,
  ) => {
    const oldType = oldTx.transactionType as "expense" | "income";
    const newType = newTx.transactionType as "expense" | "income";
    const oldAmount = Number(oldTx.amount);
    const newAmount = Number(newTx.amount);

    let delta = 0;
    if (oldType === newType) {
      if (oldType === "expense") {
        delta = oldAmount - newAmount;
      } else {
        delta = newAmount - oldAmount;
      }
    } else {
      delta += oldType === "expense" ? oldAmount : -oldAmount;

      delta += newType === "expense" ? -newAmount : newAmount;
    }
    setBalance(balance + delta);
  };

  const applyBalanceDeltaForDelete = (tx: TransactionItem) => {
    const type = tx.transactionType as "expense" | "income";
    const amt = Number(tx.amount);
    const delta = type === "expense" ? amt : -amt;
    setBalance(balance + delta);
  };

  /** Open modal **/
  const openEdit = (item: TransactionItem) => {
    setEditItem(item);
    setForm({
      transactionType: item.type,
      category: item.category,
      amount: Number(item.amount),
      description: item.description,
      date: item.date ? item.date.slice(0, 10) : "",
    });
  };

  /** PUT update **/
  const handleSave = async () => {
    if (!editItem || !form) return;
    try {
      const endpoint = `transaction/${editItem._id}`;
      await api.patch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`, form);

      // Update list locally + update balance state via its hook/context
      applyBalanceDeltaForUpdate(editItem, form);
      const updated = transactions.map((t) =>
        t._id === editItem._id ? { ...t, ...form } : t,
      );
      // sort again by date
      updated.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      });
      setTransactions(updated);
      setEditItem(null);
      setForm(null);
    } catch (e) {
      console.error("Erreur lors de la mise à jour:", e);
    }
  };

  /** DELETE **/
  const handleDelete = async () => {
    if (!editItem) return;
    try {
      const endpoint = `transaction/${editItem._id}`;
      const response = await api.delete(
        `${import.meta.env.VITE_API_BASE_URL}/${endpoint}`,
      );

      if (response.status === 204) {
        applyBalanceDeltaForDelete(editItem);
        setTransactions((prev) => prev.filter((t) => t._id !== editItem._id));
        setEditItem(null);
        setForm(null);
      }
    } catch (e) {
      console.error("Erreur lors de la suppression:", e);
    }
  };

  /** UI helpers **/
  const categoryIconFor = (categoryId: string) => {
    const fromList =
      categories.find((c) => c.id === categoryId) ||
      defaultCategories.find((c) => c.id === categoryId);
    if (fromList) return fromList.icon;

    if (iconMap[categoryId]) return iconMap[categoryId];

    return <Info />;
  };

  const isEmpty = !loading && transactions.length === 0;

  const editModal = useMemo(
    () => (
      <Modal
        isOpen={!!editItem}
        onClose={() => {
          setEditItem(null);
          setForm(null);
        }}
        title="Modifier la transaction"
      >
        {form && (
          <div className="space-y-4">
            {/* Type de transaction */}
            <div className="flex items-center justify-center gap-2">
              <label htmlFor="expense" className="cursor-pointer">
                <input
                  type="radio"
                  id="expense"
                  value="expense"
                  checked={form.transactionType === "expense"}
                  onChange={() =>
                    setForm({ ...form, transactionType: "expense" })
                  }
                  className="peer hidden"
                />
                <div className="rounded-full border-2 border-emerald-500 px-3 py-2 text-emerald-400 transition peer-checked:border-none peer-checked:bg-emerald-700 peer-checked:text-white hover:text-zinc-200">
                  Dépense
                </div>
              </label>
              <label htmlFor="income" className="cursor-pointer">
                <input
                  type="radio"
                  id="income"
                  value="income"
                  checked={form.transactionType === "income"}
                  onChange={() =>
                    setForm({ ...form, transactionType: "income" })
                  }
                  className="peer hidden"
                />
                <div className="rounded-full border-2 border-emerald-500 px-3 py-2 text-emerald-400 transition peer-checked:border-none peer-checked:bg-emerald-700 peer-checked:text-white hover:text-zinc-200">
                  Revenu
                </div>
              </label>
            </div>

            {/* Catégories */}
            <div>
              <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Catégorie
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {categories.map((cat) => (
                  <label key={cat.id} htmlFor={`edit-cat-${cat.id}`}>
                    <input
                      type="radio"
                      id={`edit-cat-${cat.id}`}
                      value={cat.id}
                      checked={form.category === cat.id}
                      onChange={() => setForm({ ...form, category: cat.id })}
                      className="peer hidden"
                    />
                    <div className="cursor-pointer transition-colors peer-checked:text-emerald-500">
                      {cat.icon}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Montant
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-2 w-full rounded-md border bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                onClick={handleDelete}
                type="button"
                className="flex items-center justify-center gap-2 rounded-md border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 />
                Supprimer
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditItem(null);
                    setForm(null);
                  }}
                  type="button"
                  className="rounded-md px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  <Save />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editItem, form, categories, balance],
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
        <h2 className="mb-4 text-xl font-semibold">Transactions récentes</h2>

        {loading && (
          <p className="text-gray-500 dark:text-gray-400">Chargement…</p>
        )}

        {isEmpty && (
          <div className="py-10 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Aucune transaction pour le moment.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="mt-3 inline-block rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              Ajouter une transaction
            </a>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="bg- flex items-center gap-3 px-1 py-3 sm:px-2"
              >
                {/* Icône catégorie */}
                <div className="shrink-0">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    {categoryIconFor(t.category)}
                  </div>
                </div>

                {/* Contenu */}
                <div className="min-w-0 flex-1">
                  {/* Description (tronquée) */}
                  <p className="font-medium text-gray-900 dark:text-white">
                    {truncate(t.description, 48)}
                  </p>

                  {/* Infos ligne 2 */}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span
                      className={
                        t.type === "expense"
                          ? "rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800"
                          : "rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/20"
                      }
                    >
                      {t.type === "expense" ? "Dépense" : "Revenu"}
                    </span>
                    <span className="tabular-nums">
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Montant */}
                <div className="text-right">
                  <div
                    className={
                      "text-base font-semibold sm:text-lg " +
                      (t.type === "expense"
                        ? "text-rose-700 dark:text-rose-300"
                        : "text-emerald-600 dark:text-emerald-400")
                    }
                  >
                    {t.type === "expense" ? "-" : "+"}
                    {Number(t.amount).toFixed(2)}€
                  </div>
                </div>

                {/* Edit */}
                <button
                  onClick={() => openEdit(t)}
                  className="ml-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Modifier"
                  title="Modifier"
                >
                  <Pencil />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editModal}
    </div>
  );
};

export default TransactionsList;
