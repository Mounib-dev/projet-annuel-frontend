import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  previousLabel = "Précédent",
  nextLabel = "Suivant",
}) => {
  const safeTotal = Math.max(1, totalPages || 0);
  const safeCurrent = clamp(currentPage || 1, 1, safeTotal);

  const atFirst = safeCurrent <= 1 || totalPages === 0;
  const atLast = safeCurrent >= safeTotal || totalPages === 0;

  const handlePrev = () => {
    const next = clamp(safeCurrent - 1, 1, safeTotal);
    if (next !== safeCurrent) onPageChange(next);
  };

  const handleNext = () => {
    const next = clamp(safeCurrent + 1, 1, safeTotal);
    if (next !== safeCurrent) onPageChange(next);
  };

  const baseBtn =
    "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm " +
    "border ring-1 ring-inset transition " +
    "border-slate-200 ring-slate-200 bg-white text-slate-700 " +
    "hover:bg-slate-50 hover:ring-slate-300 " +
    "focus:outline-none focus:ring-2 focus:ring-sky-400 " +
    "dark:border-slate-700 dark:ring-slate-700 dark:bg-slate-800 dark:text-slate-200 " +
    "dark:hover:bg-slate-750/50 dark:focus:ring-sky-500";

  const disabledBtn =
    "cursor-not-allowed opacity-50 hover:bg-white dark:hover:bg-slate-800";

  const iconBase = "h-5 w-5 shrink-0";

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-3 ${className}`}
    >
      {/* Précédent */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={atFirst}
        aria-disabled={atFirst}
        aria-label="Aller à la page précédente"
        className={`${baseBtn} ${atFirst ? disabledBtn : ""}`}
      >
        {/* Chevron gauche */}
        <svg
          className={iconBase}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="hidden sm:inline">{previousLabel}</span>
      </button>

      {/* Badge page / total */}
      <span
        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200 ring-inset select-none dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
        aria-live="polite"
        aria-atomic="true"
      >
        Page {safeCurrent} / {safeTotal}
      </span>

      {/* Suivant */}
      <button
        type="button"
        onClick={handleNext}
        disabled={atLast}
        aria-disabled={atLast}
        aria-label="Aller à la page suivante"
        className={`${baseBtn} ${atLast ? disabledBtn : ""}`}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        {/* Chevron droit */}
        <svg
          className={iconBase}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;
