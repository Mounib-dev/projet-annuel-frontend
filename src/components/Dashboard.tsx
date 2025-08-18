import { useEffect, useState } from "react";
import {
  isSameMonth,
  isSameWeek,
  isSameYear,
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  getISOWeek,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import api from "../api";
import { Transaction } from "../types/transaction";
import { FilterType, Totals } from "../types/dashboard";
import { exportPDF, exportExcel } from "../utils/exporters";
import Pagination from "../components/pagination/Pagination";

const ITEMS_PER_PAGE = 10;

/* --------- Helpers --------- */
const WEEK_OPTS = { weekStartsOn: 1 as const }; // Lundi

const filterTransactions = (
  transactions: Transaction[],
  filter: FilterType,
  selectedDate: Date,
): Transaction[] => {
  return transactions.filter((tx) => {
    const date = new Date(tx.date);
    switch (filter) {
      case "week":
        return isSameWeek(date, selectedDate, WEEK_OPTS);
      case "month":
        return isSameMonth(date, selectedDate);
      case "year":
        return isSameYear(date, selectedDate);
      default:
        return true;
    }
  });
};

const calculateTotals = (transactions: Transaction[]) => {
  const income = transactions.filter((tx) => tx.type === "income");
  const expense = transactions.filter((tx) => tx.type === "expense");
  const totalIncome = income.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const totalExpense = expense.reduce((acc, tx) => acc + Number(tx.amount), 0);
  return {
    income,
    expense,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

const getMonthlyStats = (transactions: Transaction[], selectedDate: Date) => {
  return Array.from({ length: 12 }, (_, i) => {
    const label = new Date(0, i).toLocaleString("fr-FR", { month: "short" });
    const monthTxs = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return (
        d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === i
      );
    });
    const income = monthTxs
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expense = monthTxs
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { name: label, Revenus: income, Dépenses: expense };
  });
};

const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, WEEK_OPTS);
  const end = endOfWeek(date, WEEK_OPTS);
  return { start, end };
};

const buildWeekSeries = (transactions: Transaction[], selectedDate: Date) => {
  const { start } = getWeekRange(selectedDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const txs = transactions.filter((tx) => isSameDay(new Date(tx.date), d));
    const income = txs
      .filter((tx) => tx.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = txs
      .filter((tx) => tx.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { name: format(d, "dd/MM"), Revenus: income, Dépenses: expense };
  });
};

const buildMonthSeries = (transactions: Transaction[], selectedDate: Date) => {
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  ).getDate();

  return Array.from({ length: daysInMonth }, (_, day) => {
    const currentDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day + 1,
    );
    const txs = transactions.filter((tx: Transaction) =>
      isSameDay(new Date(tx.date), currentDay),
    );
    const income = txs
      .filter((tx: Transaction) => tx.type === "income")
      .reduce((sum, tx: Transaction) => sum + Number(tx.amount), 0);
    const expense = txs
      .filter((tx: Transaction) => tx.type === "expense")
      .reduce((sum, tx: Transaction) => sum + Number(tx.amount), 0);
    return {
      name: format(currentDay, "dd/MM"),
      Revenus: income,
      Dépenses: expense,
    };
  });
};
/* -------------------------------------------- */

/* Tooltip customisé (format FR + €) */
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-lg border p-3 text-sm shadow"
      style={{
        backgroundColor: "var(--chart-tooltip-bg, #ffffff)",
        color: "var(--chart-tooltip-fg, #1f2937)",
        borderColor: "var(--chart-axis, #475569)",
      }}
    >
      {label !== undefined && <div className="mb-1 font-medium">{label}</div>}
      <ul className="space-y-0.5">
        {payload.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: item.color as string }}
            />
            <span className="opacity-80">{String(item.name)} :</span>
            <span className="font-semibold">
              {typeof item.value === "number"
                ? `${item.value.toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })} €`
                : String(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* Tranche active du camembert (compat Recharts) */
const renderActiveSlice = (props: unknown): JSX.Element => {
  const p = props as PieSectorDataItem & { fill?: string };

  const cx = (p.cx ?? 0) as number;
  const cy = (p.cy ?? 0) as number;
  const innerRadius = (p.innerRadius ?? 0) as number;
  const outerRadius = (p.outerRadius ?? 0) as number;
  const startAngle = (p.startAngle ?? 0) as number;
  const endAngle = (p.endAngle ?? 0) as number;
  const fill = (p.fill ?? "#000") as string;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--chart-axis, #475569)"
        strokeOpacity={0.15}
        strokeWidth={2}
      />
    </g>
  );
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activePieIndex, setActivePieIndex] = useState<number>(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/transaction/list`,
        );
        setTransactions(res.data as Transaction[]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);

  const filteredTransactions = filterTransactions(
    transactions,
    filter,
    selectedDate,
  );
  const { income, expense, totalIncome, totalExpense, balance } =
    calculateTotals(filteredTransactions);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const topExpenses = [...expense]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const pieData = topExpenses.map((tx) => ({
    name: tx.description,
    value: Number(tx.amount),
  }));

  const PIE_COLORS = [
    "var(--chart-pie-1, #f43f5e)",
    "var(--chart-pie-2, #fb923c)",
    "var(--chart-pie-3, #fbbf24)",
    "var(--chart-pie-4, #10b981)",
    "var(--chart-pie-5, #0ea5e9)",
  ];

  const currentLabel =
    filter === "week"
      ? (() => {
          const { start, end } = getWeekRange(selectedDate);
          return `Semaine du ${format(start, "dd/MM/yyyy", { locale: fr })} au ${format(
            end,
            "dd/MM/yyyy",
            { locale: fr },
          )}`;
        })()
      : filter === "month"
        ? format(selectedDate, "MMMM yyyy", { locale: fr })
        : format(selectedDate, "yyyy", { locale: fr });

  const lineChartData =
    filter === "year"
      ? getMonthlyStats(transactions, selectedDate)
      : filter === "month"
        ? buildMonthSeries(transactions, selectedDate)
        : buildWeekSeries(transactions, selectedDate);

  const handleFilterChange = (f: FilterType) => setFilter(f);

  const weekValue = (() => {
    const y = selectedDate.getFullYear();
    const ww = String(getISOWeek(selectedDate)).padStart(2, "0");
    return `${y}-W${ww}`;
  })();

  const handleWeekChange = (value: string) => {
    const [yStr, wStr] = value.split("-W");
    const year = Number(yStr);
    const week = Number(wStr);
    const jan4 = new Date(year, 0, 4);
    const jan4WeekStart = startOfWeek(jan4, WEEK_OPTS);
    const target = addDays(jan4WeekStart, (week - 1) * 7);
    setSelectedDate(target);
  };

  const monthValue = format(selectedDate, "yyyy-MM");
  const handleMonthChange = (value: string) => {
    const [yStr, mStr] = value.split("-");
    const year = Number(yStr);
    const month = Number(mStr) - 1;
    setSelectedDate(new Date(year, month, 1));
  };

  const yearValue = selectedDate.getFullYear();
  const handleYearChange = (value: string) => {
    const year = Number(value) || new Date().getFullYear();
    setSelectedDate(new Date(year, 0, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-slate-800 transition-colors duration-500 dark:bg-gray-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                exportPDF(
                  filteredTransactions,
                  {
                    income,
                    expense,
                    totalIncome,
                    totalExpense,
                    balance,
                  } as Totals,
                  currentLabel,
                )
              }
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white shadow hover:bg-emerald-700"
            >
              Exporter PDF
            </button>

            <button
              onClick={() =>
                exportExcel(
                  filteredTransactions,
                  {
                    income,
                    expense,
                    totalIncome,
                    totalExpense,
                    balance,
                  } as Totals,
                  currentLabel,
                )
              }
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white shadow hover:bg-emerald-700"
            >
              Exporter Excel
            </button>
          </div>
        </header>

        <p className="mb-4 text-right text-sm text-slate-600 italic dark:text-slate-400">
          Heure actuelle : {format(currentTime, "HH:mm:ss")}
        </p>

        {/* Filtres + date picker */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>

          {filter === "week" && (
            <input
              type="week"
              value={weekValue}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          )}

          {filter === "month" && (
            <input
              type="month"
              value={monthValue}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          )}

          {filter === "year" && (
            <input
              type="number"
              min={1970}
              max={9999}
              value={yearValue}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          )}
        </section>

        {/* Libellé période */}
        <h2 className="mb-6 text-xl font-semibold">Période : {currentLabel}</h2>

        {/* Totaux */}
        <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-emerald-700 ring-1 shadow-sm ring-emerald-200 ring-inset dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800">
            <span className="mb-1 text-lg font-bold">Revenus</span>
            <span className="text-3xl font-extrabold">
              {totalIncome.toFixed(2)} €
            </span>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-rose-50 p-6 text-rose-700 ring-1 shadow-sm ring-rose-200 ring-inset dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800">
            <span className="mb-1 text-lg font-bold">Dépenses</span>
            <span className="text-3xl font-extrabold">
              {totalExpense.toFixed(2)} €
            </span>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-sky-50 p-6 text-sky-700 ring-1 shadow-sm ring-sky-200 ring-inset dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800">
            <span className="mb-1 text-lg font-bold">Solde</span>
            <span className="text-3xl font-extrabold">
              {balance.toFixed(2)} €
            </span>
          </div>
        </section>

        {/* Résumé */}
        <section
          className={`mb-8 rounded-xl border px-6 py-4 ${
            balance >= 0
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30"
              : "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/30"
          }`}
        >
          <p
            className={`text-center text-lg font-semibold ${
              balance >= 0
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {balance < 0
              ? "Vous avez dépensé plus que vos revenus. Attention à votre budget."
              : balance < totalIncome * 0.2
                ? "Vos dépenses sont proches de vos revenus. Restez vigilant."
                : "Bonne gestion ! Vos revenus couvrent bien vos dépenses."}
          </p>
        </section>

        {/* Graphiques */}
        <section className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Line Chart */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">
              Évolution Revenus vs Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke="var(--chart-axis, #475569)" />
                <YAxis stroke="var(--chart-axis, #475569)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotoneX"
                  dataKey="Revenus"
                  stroke="var(--chart-income, #10b981)"
                  strokeWidth={2.75}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotoneX"
                  dataKey="Dépenses"
                  stroke="var(--chart-expense, #f43f5e)"
                  strokeWidth={2.75}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">Top 5 Dépenses</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={104}
                    paddingAngle={2}
                    labelLine={false}
                    activeIndex={activePieIndex}
                    activeShape={renderActiveSlice}
                    onMouseEnter={(_: unknown, idx: number) =>
                      setActivePieIndex(idx)
                    }
                    onMouseLeave={() => setActivePieIndex(-1)}
                    label={({ name, percent }) =>
                      `${name as string} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Aucune dépense à afficher
              </p>
            )}
          </div>
        </section>

        {/* Transactions */}
        <section id="transactions">
          <h3 className="mb-4 text-xl font-semibold">
            Historique des Transactions
          </h3>

          {paginatedTransactions.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400">
              Aucun historique trouvé.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-slate-300 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {paginatedTransactions.map((tx, idx) => (
                  <li
                    key={`${tx._id || idx}-${tx.date}`}
                    className={`flex justify-between px-6 py-4 ${
                      tx.type === "expense"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}
                  >
                    <div>{tx.description}</div>
                    <div>
                      {tx.amount.toFixed(2)} € -{" "}
                      {format(new Date(tx.date), "dd/MM/yyyy")}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
