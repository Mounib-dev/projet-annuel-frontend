import { useState } from "react";

import { X, ClipboardCheck, Loader2 } from "lucide-react";

interface ConfirmRecommendationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export default function ConfirmRecommendation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmRecommendationProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = (): void => {
    setSuccessMessage(null);
    onClose();
  };

  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
      setSuccessMessage("Recommandation générée avec succès !");
      // Fermer automatiquement après 2 secondes
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la génération:", error);

      setSuccessMessage(null);
    }
  };

  // Ne pas rendre le composant si isOpen est false
  if (!isOpen) return null;

  return (
    <>
      {/* Confirmation Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
          <h2 className="mb-4 text-lg font-bold">Confirmer la génération</h2>

          {successMessage && (
            <div className="mb-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                {successMessage}
              </div>
            </div>
          )}

          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Vous êtes sur le point de générer une recommandation par IA pour
            vous aider à atteindre votre objectif. Continuer ?
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              {isLoading ? "Génération..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
