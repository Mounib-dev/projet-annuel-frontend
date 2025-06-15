import axios from "axios";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface Goal {
  _id: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  recommendationReady: boolean;
}

interface GoalsListProps {
  goals: Goal[];
  onGoalsFetched: (goals: Goal[]) => void;
  onGoalsUpdated: (goals: Goal) => void;
}

export default function GoalsList({
  goals,
  onGoalsFetched,
  onGoalsUpdated,
}: GoalsListProps) {
  // Fetching Goals
  useEffect(() => {
    async function fetchGoals() {
      try {
        const newGoalEndpoint = "goal/";
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/${newGoalEndpoint}`,
        );
        if (response.status !== 200)
          throw new Error("Erreur lors de la récupération des objectifs.");
        console.log(response.data);
        onGoalsFetched(response.data);
      } catch (error) {
        console.error(error);
        onGoalsFetched([]);
      }
    }
    fetchGoals();
  }, [onGoalsFetched]);

  // Goal actions
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editData, setEditData] = useState({
    description: "",
    targetAmount: 0,
    targetDate: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set information in form
  useEffect(() => {
    if (selectedGoal) {
      setEditData({
        description: selectedGoal.description,
        targetAmount: selectedGoal.targetAmount,
        targetDate: selectedGoal.targetDate.split("T")[0],
      });
    }
  }, [selectedGoal]);

  // Update
  const handleUpdate = async () => {
    if (!selectedGoal) return;
    try {
      const updateGoalEndpoint = `goal/${selectedGoal._id}`;
      const { description, targetAmount, targetDate } = editData;
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/${updateGoalEndpoint}`,
        { description, targetAmount, targetDate },
      );
      if (response.status !== 200)
        throw new Error("Erreur lors de la modification de l'objectif.");
      console.log(response.data);
      onGoalsUpdated(response.data);
      setSuccessMessage("Objectif modifié avec succès !");

      // Ferme la modale après un court délai
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedGoal(null);
      }, 1000); // tu peux ajuster ce délai
    } catch (error) {
      console.error(error);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selectedGoal) return;
    const res = await fetch(`/api/goals/${selectedGoal._id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSelectedGoal(null);
      // refreshGoals();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <div
            key={goal._id}
            className="relative rounded-xl border border-gray-300 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {/* Edit icon */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setSelectedGoal(goal)}
              title="modifier"
            >
              <Pencil size={18} />
            </button>

            {/* Content */}
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              {goal.description}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500 text-green-600 dark:border-green-400 dark:text-green-300">
                  <span className="text-lg font-bold">
                    {goal.targetAmount}€
                  </span>
                </div>
                <span className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Objectif
                </span>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium">Date cible</span>
                <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* AI recommendation icon */}
            <div className="mt-4 flex justify-start">
              <button
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Générer une recommandation"
              >
                <Sparkles size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* MODAL */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
            <h2 className="mb-4 text-lg font-bold">Modifier l'objectif</h2>
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-100 p-2 text-sm text-green-700 dark:bg-green-800 dark:text-green-200">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Montant cible (€)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
                  value={editData.targetAmount}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      targetAmount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Date cible</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
                  value={editData.targetDate}
                  onChange={(e) =>
                    setEditData({ ...editData, targetDate: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Annuler
                </button>

                <button
                  onClick={handleUpdate}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  Modifier
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
