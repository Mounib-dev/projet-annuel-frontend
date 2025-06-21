
import React, { useEffect, useState } from "react";
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

const ITEMS_PER_PAGE = 10;

const filterTransactions = (transactions, filter, selectedDate) => {
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

const calculateTotals = (transactions) => {
  const income = transactions.filter(tx => tx.type === "income");
  const expense = transactions.filter(tx => tx.type === "expense");
  const totalIncome = income.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const totalExpense = expense.reduce((acc, tx) => acc + Number(tx.amount), 0);
  return {
    income,
    expense,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  };
};

const getMonthlyStats = (transactions, selectedDate) => {
  return Array.from({ length: 12 }, (_, i) => {
    const label = new Date(0, i).toLocaleString("fr-FR", { month: "short" });
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === i;
    });
    const income = monthTxs.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expense = monthTxs.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { name: label, Revenus: income, Dépenses: expense };
  });
};

const exportPDF = (filteredTransactions, totals, currentLabel) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Résumé Budgétaire - ${currentLabel}`, 10, 15);
  doc.setFontSize(12);
  doc.text(`Revenus: ${totals.totalIncome.toFixed(2)} €`, 10, 30);
  doc.text(`Dépenses: ${totals.totalExpense.toFixed(2)} €`, 10, 40);
  doc.text(`Solde: ${totals.balance.toFixed(2)} €`, 10, 50);

  const rows = filteredTransactions.map(tx => [tx.description, tx.type, tx.amount.toFixed(2), format(new Date(tx.date), "dd/MM/yyyy")]);
  autoTable(doc, {
    head: [["Description", "Type", "Montant (€)", "Date"]],
    body: rows,
    startY: 60,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(`budget-${currentLabel.replace(/\s/g, "_")}.pdf`);
};


const exportExcel = (filteredTransactions, totals, currentLabel) => {
  // Préparer les données à exporter (transactions)
  const wsData = [
    [`Résumé Budgétaire - ${currentLabel}`],
    [`Revenus: ${totals.totalIncome.toFixed(2)} €`],
    [`Dépenses: ${totals.totalExpense.toFixed(2)} €`],
    [`Solde: ${totals.balance.toFixed(2)} €`],
    [], // ligne vide avant le tableau
    ["Description", "Type", "Montant (€)", "Date"],
    ...filteredTransactions.map((tx) => [
      tx.description,
      tx.type,
      tx.amount.toFixed(2),
      format(new Date(tx.date), "dd/MM/yyyy"),
    ]),
  ];

  // Créer une feuille de calcul
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Créer un classeur et y insérer la feuille
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Budget");

  // Générer un fichier Excel binaire
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Sauvegarder avec file-saver
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `budget-${currentLabel.replace(/\s/g, "_")}.xlsx`);
};
const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/transaction/list`);
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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);

  const filteredTransactions = filterTransactions(transactions, filter, selectedDate);
  const { income, expense, totalIncome, totalExpense, balance } = calculateTotals(filteredTransactions);

  // Pagination logic for transactions list
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Top 5 expenses pie chart
  const topExpenses = [...expense].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const pieData = topExpenses.map(tx => ({ name: tx.description, value: Number(tx.amount) }));
  const COLORS = ["#D32F2F", "#F57C00", "#FBC02D", "#388E3C", "#1976D2"];

  // Résumé message & couleur
  const summaryMessage =
    balance < 0
      ? "Vous avez dépensé plus que vos revenus. Attention à votre budget."
      : balance < totalIncome * 0.2
      ? "Vos dépenses sont proches de vos revenus. Restez vigilant."
      : "Bonne gestion ! Vos revenus couvrent bien vos dépenses.";

  const summaryColor = balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

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
          { length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() },
          (_, day) => {
            const currentDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day + 1);
            const txs = transactions.filter(tx => isSameDay(new Date(tx.date), currentDay));
            const income = txs.filter(tx => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
            const expense = txs.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
            return { name: format(currentDay, "dd/MM"), Revenus: income, Dépenses: expense };
          }
        )
      : [
          {
            name: format(selectedDate, "dd/MM"),
            Revenus: totalIncome,
            Dépenses: totalExpense,
          },
        ];

  

  return (
    <div className={`${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen p-6 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r">
            Dashboard 
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => exportPDF(filteredTransactions, { totalIncome, totalExpense, balance }, currentLabel)}
              className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition"
              aria-label="Exporter PDF"
            >
              Exporter PDF
            </button>

             <button
              onClick={() =>
                exportExcel(filteredTransactions, { totalIncome, totalExpense, balance }, currentLabel)
              }
              className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition"
              aria-label="Exporter Excel"
            >
              Exporter Excel
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold px-5 py-2 rounded-lg shadow-lg transition"
              aria-label="Toggle Mode Sombre"
            >
              {darkMode ? "Mode Clair" : "Mode Sombre"}
            </button>
          </div>
        </header>

        {/* Current Time */}
        <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4 text-right">
          Heure actuelle : {format(currentTime, "HH:mm:ss")}
        </p>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            aria-label="Filtrer par période"
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
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            aria-label="Sélectionner la date"
          />
        </section>

        {/* Period Label */}
        <h2 className="text-xl font-semibold mb-6 text-center sm:text-left tracking-wide">
          Période : {currentLabel}
        </h2>

        {/* Totals */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-tr from-green-400 to-green-600 dark:from-green-700 dark:to-green-900 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <span className="text-white font-bold text-lg mb-1 tracking-widest">Revenus</span>
            <span className="text-white font-extrabold text-3xl">{totalIncome.toFixed(2)} €</span>
          </div>

          <div className="bg-gradient-to-tr from-red-400 to-red-600 dark:from-red-700 dark:to-red-900 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <span className="text-white font-bold text-lg mb-1 tracking-widest">Dépenses</span>
            <span className="text-white font-extrabold text-3xl">{totalExpense.toFixed(2)} €</span>
          </div>

          <div className="bg-gradient-to-tr from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <span className="text-white font-bold text-lg mb-1 tracking-widest">Solde</span>
            <span className="text-white font-extrabold text-3xl">{balance.toFixed(2)} €</span>
          </div>
        </section>

        {/* Summary message */}
        <section className={`mb-8 px-6 py-4 rounded-lg border-2 ${balance >= 0 ? "border-green-600 bg-green-50 dark:bg-green-900" : "border-red-600 bg-red-50 dark:bg-red-900"}`}>
          <p className={`text-center font-semibold text-lg ${summaryColor}`}>{summaryMessage}</p>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Line Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center md:text-left">Évolution Revenus vs Dépenses</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke={darkMode ? "#ddd" : "#333"} />
                <YAxis stroke={darkMode ? "#ddd" : "#333"} />
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? "#222" : "#fff", borderRadius: 8 }}
                  labelStyle={{ color: darkMode ? "#ddd" : "#333" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="Revenus"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Dépenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center md:text-left">Top 5 Dépenses</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fill="#8884d8"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: darkMode ? "#222" : "#fff", borderRadius: 8 }}
                    labelStyle={{ color: darkMode ? "#ddd" : "#333" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 italic">Aucune dépense à afficher</p>
            )}
          </div>
        </section>

        {/* Transactions list with pagination */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Historique des Transactions</h3>

          {paginatedTransactions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 italic">Aucun historique trouvé.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-300 dark:divide-gray-700 rounded-md border border-gray-300 dark:border-gray-700 shadow-lg overflow-hidden">
                {paginatedTransactions.map((tx, idx) => (
                  <li
                    key={`${tx.id || idx}-${tx.date}`}
                    className={`flex justify-between items-center px-6 py-4
                      ${tx.type === "expense" ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-400" : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400"}
                      hover:bg-opacity-80 transition rounded-sm`}
                  >
                    <div className="font-semibold">{tx.description}</div>
                    <div className="text-sm tracking-wide flex gap-3 items-center">
                      <span className="capitalize">{tx.type}</span>
                      <span>{tx.amount.toFixed(2)} €</span>
                      <span className="text-gray-500 dark:text-gray-400">{format(new Date(tx.date), "dd/MM/yyyy")}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  aria-label="Page précédente"
                >
                  ← Précédent
                </button>

                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Page {currentPage} / {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  aria-label="Page suivante"
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
