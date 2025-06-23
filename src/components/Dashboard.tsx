import React, { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
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
  const [filter, setFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [manualBalance, setManualBalance] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
   const alertShown = useRef(false);
   const [showAlert, setShowAlert] = useState(false);
const [bigExpenseCount, setBigExpenseCount] = useState(0);


  useEffect(() => {
    api.get(`${import.meta.env.VITE_API_BASE_URL}/transaction/list`)
      .then(res => setTransactions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    api.get(`${import.meta.env.VITE_API_BASE_URL}/balance`)
      .then(res => setManualBalance(res.data?.amount ?? 0))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTransactions = filterTransactions(transactions, filter, selectedDate);
  const { income, expense, totalIncome, totalExpense,balance } = calculateTotals(filteredTransactions);

useEffect(() => {
  const bigExpenses = filteredTransactions.filter(
    tx => tx.type === "expense" && Number(tx.amount) > 150
  );
  if (bigExpenses.length > 0 && !alertShown.current) {
    setBigExpenseCount(bigExpenses.length);
    setShowAlert(true);
    alertShown.current = true;
  }
}, [filteredTransactions]);

 

  const summaryMessage = filteredTransactions.length === 0
    ? ""
    : balance! < 0
    ? "Vous avez dépensé plus que vos revenus. Attention à votre budget."
    : balance! < totalIncome * 0.2
    ? "Vos dépenses sont proches de vos revenus. Restez vigilant."
    : "Bonne gestion ! Vos revenus couvrent bien vos dépenses.";

  const summaryColor = balance! >= 0 ? "text-green-600" : "text-red-600";

  const currentLabel = filter === "day"
    ? format(selectedDate, "dd MMM yyyy")
    : filter === "week"
    ? `Semaine du ${format(selectedDate, "dd MMM yyyy")}`
    : filter === "month"
    ? format(selectedDate, "MMMM yyyy")
    : format(selectedDate, "yyyy");

  const lineChartData = filter === "year"
    ? getMonthlyStats(transactions, selectedDate)
    : filter === "month"
    ? Array.from(
        { length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() },
        (_, day) => {
          const currentDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day + 1);
          const txs = transactions.filter(tx => isSameDay(new Date(tx.date), currentDay));
          const inc = txs.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount), 0);
          const exp = txs.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount), 0);
          return { name: format(currentDay, "dd/MM"), Revenus: inc, Dépenses: exp };
        }
      )
    : [{ name: format(selectedDate, "dd/MM"), Revenus: totalIncome, Dépenses: totalExpense }];

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pieData = [...expense].sort((a, b) => b.amount - a.amount).slice(0, 5)
    .map(tx => ({ name: tx.description, value: Number(tx.amount) }));
  const COLORS = ["#D32F2F", "#F57C00", "#FBC02D", "#388E3C", "#1976D2"];

  return (
    <div className="dark:bg-gray-50 text-gray-900 min-h-screen overflow-x-hidden p-6">
   
{showAlert && (
  <div className="relative mb-6">
    <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-4 rounded-lg shadow-md flex justify-between items-center animate-slide-down">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm sm:text-base">
          Attention : {bigExpenseCount} dépense(s) dépassent 150 €.
        </span>
      </div>
      <button onClick={() => setShowAlert(false)} className="ml-4 text-red-700 hover:text-red-900 transition">
        ✕
      </button>
    </div>
  </div>
)}

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => exportPDF(paginatedTransactions, { totalIncome, totalExpense, balance: manualBalance! }, currentLabel)} className="dark:bg-green-400 dark:text-white px-5 py-2 rounded-lg">Exporter PDF</button>
            <button onClick={() => exportExcel(paginatedTransactions, { totalIncome, totalExpense, balance: manualBalance! }, currentLabel)} className="dark:bg-green-400 dark:text-white px-5 py-2 rounded-lg">Exporter Excel</button>
          </div>
        </header>

        <p className="text-sm italic dark:text-gray-600 mb-4 text-right">
          Heure actuelle : {format(currentTime, "HH:mm:ss")}
        </p>

        <section className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 rounded-lg border dark: bg-white">
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>

          <input type="date" value={format(selectedDate, "yyyy-MM-dd")} onChange={(e) => setSelectedDate(new Date(e.target.value))} className="px-4 py-2 rounded-lg border bg-white" />

          {filter === "month" && (
            <select value={selectedDate.getMonth()} onChange={(e) => setSelectedDate(new Date(selectedDate.getFullYear(), Number(e.target.value)))} className="px-4 py-2 rounded-lg border bg-white">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString("fr-FR", { month: "long" })}
                </option>
              ))}
            </select>
          )}
        </section>

        <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Période : {currentLabel}</h2>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-300 rounded-lg shadow-lg p-6 text-center">
            <span className="block font-bold mb-1">Revenus</span>
            <span className="text-3xl font-extrabold">{totalIncome.toFixed(2)} €</span>
          </div>
          <div className="bg-red-400 rounded-lg shadow-lg p-6 text-center">
            <span className="block font-bold mb-1">Dépenses</span>
            <span className="text-3xl font-extrabold">{totalExpense.toFixed(2)} €</span>
          </div>
          <div className="bg-blue-300 rounded-lg shadow-lg p-6 text-center">
            <span className="block font-bold mb-1">Solde</span>
            <span className="text-3xl font-extrabold">{manualBalance !== null ? manualBalance.toFixed(2) : "-" } €</span>
          </div>
        </section>

        {summaryMessage && (
          <section className={`mb-8 px-6 py-4 rounded-lg border-2 ${balance! >= 0 ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"}`}>
            <p className={`text-center font-semibold text-lg ${summaryColor}`}>{summaryMessage}</p>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <h3 className="text-xl font-semibold mb-4">Évolution Revenus vs Dépenses</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }} labelStyle={{ color: "#333" }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="Revenus" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Dépenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Top 5 Dépenses</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fill="#8884d8">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }} labelStyle={{ color: "#333" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 italic">Aucune dépense à afficher</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-between flex-wrap gap-4">
            Historique des Transactions
            
          </h3>

          {paginatedTransactions.length === 0 ? (
            <p className="text-center text-gray-500 italic">Aucun historique trouvé.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-300 rounded-md border border-gray-300 shadow-lg overflow-hidden">
                {paginatedTransactions.map((tx, idx) => (
                  <li
                    key={`${tx.id || idx}-${tx.date}`}
                    className={`flex justify-between items-center px-6 py-4 ${
                      tx.type === "expense"
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    } hover:bg-opacity-80 transition`}
                  >
                    <div className="font-semibold">{tx.description}</div>
                    <div className="text-sm tracking-wide flex gap-3 items-center">
                     <div className="text-sm tracking-wide flex gap-3 items-center">
  <span>{tx.type === "income" ? "+" : "-"}{Number(tx.amount).toFixed(2)} €</span>
  <span className="text-gray-500">{format(new Date(tx.date), "dd/MM/yyyy")}</span>
</div>

                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  ← Précédent
                </button>
                <span className="font-semibold text-gray-700">
                  Page {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white"
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