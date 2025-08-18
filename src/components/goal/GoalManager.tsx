import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import GoalsList, { Goal } from "./GoalsList";
import api from "../../api";

interface GoalFormValues {
  description: string;
  targetAmount: number;
  targetDate: string;
  estimatedIncomeRange: {
    min: number;
    max: number;
  };
}

export default function GoalManager() {
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>();

  // ✅ Fetch géré dans le parent pour résoudre le bug F5
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/goal/`,
        );
        if (response.status !== 200) throw new Error("Erreur de récupération");

        setGoals(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des objectifs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const onSubmit = async (data: GoalFormValues) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/goal/`,
        data,
      );

      if (response.status !== 201)
        throw new Error("Erreur lors de la création de l'objectif.");

      reset();
      setShowForm(false);
      setGoals((prev) => [...prev, response.data]);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    }
  };

  const handleGoalsUpdated = useCallback((goal: Goal) => {
    setGoals((prev) => prev.map((g) => (g._id === goal._id ? goal : g)));
  }, []);

  const handleGoalsDeleted = useCallback((goal: Goal) => {
    setGoals((prev) => prev.filter((g) => g._id !== goal._id));
  }, []);

  return (
    <div className="relative min-h-screen p-4">
      {isLoading ? (
        <div className="mt-6 text-center text-gray-700 dark:text-white">
          Chargement...
        </div>
      ) : goals.length === 0 ? (
        <div className="mx-auto mt-5 max-w-xl rounded-xl border border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <p className="text-center text-lg text-gray-700 dark:text-white">
            Vous n'avez pas encore saisi d'objectifs.
          </p>
        </div>
      ) : (
        <GoalsList
          goals={goals}
          onGoalsUpdated={handleGoalsUpdated}
          onGoalsDeleted={handleGoalsDeleted}
        />
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        aria-label="Ajouter un objectif"
      >
        <Plus />
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-md dark:bg-gray-800 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Créer un objectif</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label>Description</label>
                <input
                  {...register("description", { required: true })}
                  className="w-full rounded border p-2 dark:bg-gray-700"
                />
                {errors.description && (
                  <p className="text-red-500">Ce champ est requis</p>
                )}
              </div>

              <div className="mb-4">
                <label>Montant cible (€)</label>
                <input
                  type="number"
                  {...register("targetAmount", { required: true, min: 1 })}
                  className="w-full rounded border p-2 dark:bg-gray-700"
                />
              </div>

              <div className="mb-4">
                <label>Date cible</label>
                <input
                  type="date"
                  {...register("targetDate", { required: true })}
                  className="w-full rounded border p-2 dark:bg-gray-700"
                />
              </div>

              <div className="mb-4">
                <label>Revenus estimés</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    {...register("estimatedIncomeRange.min", {
                      required: true,
                    })}
                    className="w-full rounded border p-2 dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    {...register("estimatedIncomeRange.max", {
                      required: true,
                    })}
                    className="w-full rounded border p-2 dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-gray-300 px-4 py-2 dark:border-gray-600 dark:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
