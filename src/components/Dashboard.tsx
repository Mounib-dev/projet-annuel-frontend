import { useEffect, useState } from "react";
import {
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  format,
} from "date-fns";
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
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../api";
import { Transaction } from "../types/transaction";
import { FilterType, Totals } from "../types/dashboard";

const ITEMS_PER_PAGE = 10;

const filterTransactions = (
  transactions: Transaction[],
  filter: FilterType,
  selectedDate: Date,
): Transaction[] => {
  return transactions.filter((tx) => {
    const date = new Date(tx.date);
    switch (filter) {
      case "day":
        return isSameDay(date, selectedDate);
      case "week":
        return isSameWeek(date, selectedDate);
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

const exportPDF = (
  filteredTransactions: Transaction[],
  totals: Totals,
  currentLabel: string,
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Résumé Budgétaire - ${currentLabel}`, 10, 15);
  doc.setFontSize(12);
  doc.text(`Revenus: ${totals.totalIncome.toFixed(2)} €`, 10, 30);
  doc.text(`Dépenses: ${totals.totalExpense.toFixed(2)} €`, 10, 40);
  doc.text(`Solde: ${totals.balance.toFixed(2)} €`, 10, 50);

  const rows = filteredTransactions.map((tx) => [
    tx.description,
    tx.type,
    tx.amount.toFixed(2),
    format(new Date(tx.date), "dd/MM/yyyy"),
  ]);
  autoTable(doc, {
    head: [["Description", "Type", "Montant (€)", "Date"]],
    body: rows,
    startY: 60,
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`budget-${currentLabel.replace(/\s/g, "_")}.pdf`);
};

const exportExcel = (
  filteredTransactions: Transaction[],
  totals: Totals,
  currentLabel: string,
) => {
  const wsData = [
    [`Résumé Budgétaire - ${currentLabel}`],
    [`Revenus: ${totals.totalIncome.toFixed(2)} €`],
    [`Dépenses: ${totals.totalExpense.toFixed(2)} €`],
    [`Solde: ${totals.balance.toFixed(2)} €`],
    [],
    ["Description", "Type", "Montant (€)", "Date"],
    ...filteredTransactions.map((tx) => [
      tx.description,
      tx.type,
      tx.amount.toFixed(2),
      format(new Date(tx.date), "dd/MM/yyyy"),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Budget");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `budget-${currentLabel.replace(/\s/g, "_")}.xlsx`);
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState<FilterType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/transaction/list`,
        );
        setTransactions(res.data);
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

  // Détecter le thème global (dark mode activé ?)
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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
  const COLORS = ["#D32F2F", "#F57C00", "#FBC02D", "#388E3C", "#1976D2"];

  const summaryMessage =
    balance < 0
      ? "Vous avez dépensé plus que vos revenus. Attention à votre budget."
      : balance < totalIncome * 0.2
        ? "Vos dépenses sont proches de vos revenus. Restez vigilant."
        : "Bonne gestion ! Vos revenus couvrent bien vos dépenses.";

  const summaryColor =
    balance >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  const currentLabel =
    filter === "day"
      ? format(selectedDate, "dd MMM yyyy")
      : filter === "week"
        ? `Semaine du ${format(selectedDate, "dd MMM yyyy")}`
        : filter === "month"
          ? format(selectedDate, "MMMM yyyy")
          : format(selectedDate, "yyyy");

  const lineChartData =
    filter === "year"
      ? getMonthlyStats(transactions, selectedDate)
      : filter === "month"
        ? Array.from(
            {
              length: new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0,
              ).getDate(),
            },
            (_, day) => {
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
            },
          )
        : [
            {
              name: format(selectedDate, "dd/MM"),
              Revenus: totalIncome,
              Dépenses: totalExpense,
            },
          ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                exportPDF(
                  filteredTransactions,
                  { income, expense, totalIncome, totalExpense, balance },
                  currentLabel,
                )
              }
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white shadow hover:bg-green-700"
            >
              Exporter PDF
            </button>

            <button
              onClick={() =>
                exportExcel(
                  filteredTransactions,
                  { income, expense, totalIncome, totalExpense, balance },
                  currentLabel,
                )
              }
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white shadow hover:bg-green-700"
            >
              Exporter Excel
            </button>
          </div>
        </header>

        <p className="mb-4 text-right text-sm text-gray-600 italic dark:text-gray-400">
          Heure actuelle : {format(currentTime, "HH:mm:ss")}
        </p>

        {/* Filters */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>

          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
        </section>

        {/* Period Label */}
        <h2 className="mb-6 text-xl font-semibold">Période : {currentLabel}</h2>

        {/* Totals */}
        <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg bg-green-600 p-6 shadow dark:bg-green-700">
            <span className="mb-1 text-lg font-bold">Revenus</span>
            <span className="text-3xl font-extrabold">
              {totalIncome.toFixed(2)} €
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-red-600 p-6 shadow dark:bg-red-700">
            <span className="mb-1 text-lg font-bold">Dépenses</span>
            <span className="text-3xl font-extrabold">
              {totalExpense.toFixed(2)} €
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-blue-600 p-6 shadow dark:bg-blue-700">
            <span className="mb-1 text-lg font-bold">Solde</span>
            <span className="text-3xl font-extrabold">
              {balance.toFixed(2)} €
            </span>
          </div>
        </section>

        {/* Summary */}
        <section
          className={`mb-8 rounded-lg border px-6 py-4 ${
            balance >= 0
              ? "border-green-600 bg-green-100 dark:bg-green-900"
              : "border-red-600 bg-red-100 dark:bg-red-900"
          }`}
        >
          <p className={`text-center text-lg font-semibold ${summaryColor}`}>
            {summaryMessage}
          </p>
        </section>

        {/* Charts */}
        <section className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Line Chart */}
          <div>
            <h3 className="mb-4 text-xl font-semibold">
              Évolution Revenus vs Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke={isDarkMode ? "#ddd" : "#333"} />
                <YAxis stroke={isDarkMode ? "#ddd" : "#333"} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#222" : "#fff",
                    color: isDarkMode ? "#ddd" : "#333",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Revenus" stroke="#10b981" />
                <Line type="monotone" dataKey="Dépenses" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-semibold">Top 5 Dépenses</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#222" : "#fff",
                      color: isDarkMode ? "#ddd" : "#333",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>Aucune dépense à afficher</p>
            )}
          </div>
        </section>

        {/* Transactions */}
        <section id="trasactions">
          <h3 className="mb-4 text-xl font-semibold">
            Historique des Transactions
          </h3>

          {paginatedTransactions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Aucun historique trouvé.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-300 rounded border dark:divide-gray-700 dark:border-gray-700">
                {paginatedTransactions.map((tx, idx) => (
                  <li
                    key={`${tx._id || idx}-${tx.date}`}
                    className={`flex justify-between px-6 py-4 ${
                      tx.type === "expense"
                        ? "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-400"
                        : "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-400"
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

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`rounded px-4 py-2 ${
                    currentPage === 1
                      ? "bg-gray-300"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  ← Précédent
                </button>
                <span>
                  Page {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`rounded px-4 py-2 ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-300"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  Suivant →
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
