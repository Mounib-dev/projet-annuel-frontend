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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-xl bg-white p-6 ring-1 shadow-lg ring-green-400 dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-600 hover:text-green-700 dark:text-green-300 dark:hover:text-green-400"
          aria-label="Fermer"
        >
          <X />
        </button>

        <h2 className="mb-4 text-lg font-bold text-green-700 dark:text-green-300">
          Recommandations
        </h2>

        <div
          className="scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent overflow-y-auto pr-2"
          style={{ maxHeight: "60vh" }}
        >
          <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="mb-4 text-2xl font-bold text-green-600 dark:text-green-300"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="mt-4 mb-2 text-xl font-semibold text-green-600 dark:text-green-300"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="mb-2 text-green-800 dark:text-green-200"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="mb-2 list-inside list-disc text-green-800 dark:text-green-200"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="mb-2 list-inside list-decimal text-green-800 dark:text-green-200"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong
                    className="font-semibold text-green-900 dark:text-green-200"
                    {...props}
                  />
                ),
                em: ({ node, ...props }) => (
                  <em
                    className="text-green-700 italic dark:text-green-300"
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
