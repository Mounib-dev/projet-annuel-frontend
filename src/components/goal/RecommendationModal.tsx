/* eslint-disable @typescript-eslint/no-unused-vars */
import { X } from "lucide-react";
import { Goal } from "./GoalsList";
import ReactMarkdown from "react-markdown";

interface ConfirmRecommendationProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
}

export default function RecommendationModal({
  isOpen,
  onClose,
  goal,
}: ConfirmRecommendationProps) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="recommendation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-xl bg-white p-6 ring-1 shadow-lg ring-emerald-400 dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-400"
          aria-label="Fermer"
        >
          <X />
        </button>

        <h2 className="mb-4 text-lg font-bold text-emerald-700 dark:text-emerald-300">
          Recommandations
        </h2>

        <div
          className="scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent overflow-y-auto pr-2"
          style={{ maxHeight: "60vh" }}
        >
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="mb-4 text-2xl font-bold text-emerald-600 dark:text-emerald-300"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="mt-4 mb-2 text-xl font-semibold text-emerald-600 dark:text-emerald-300"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="mb-2 text-emerald-800 dark:text-emerald-200"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="mb-2 list-inside list-disc text-emerald-800 dark:text-emerald-200"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="mb-2 list-inside list-decimal text-emerald-800 dark:text-emerald-200"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong
                    className="font-semibold text-emerald-900 dark:text-emerald-200"
                    {...props}
                  />
                ),
                em: ({ node, ...props }) => (
                  <em
                    className="text-emerald-700 italic dark:text-emerald-300"
                    {...props}
                  />
                ),
              }}
            >
              {goal.recommendation
                ? `${goal.recommendation}`
                : "Vous n'avez pas encore de recommandations."}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
