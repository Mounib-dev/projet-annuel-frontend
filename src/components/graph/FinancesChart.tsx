import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ThemeToggle from "../layout/ThemeToggle";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

import { Sheet, FileText } from "lucide-react";

const COLORS = ["#4CAF50", "#00C49F", "#8BC34A", "#388E3C"];

export default function FinanceChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("mois");
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [categories, setCategories] = useState([]);

  const displayedData = selectedPeriod === "mois" ? monthlyData : yearlyData;

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/transaction/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setMonthlyData(formatMonthly(data));
        setYearlyData(formatYearly(data));
        setCategories(formatCategories(data));
      })
      .catch((err) => {
        console.error("Erreur chargement transactions :", err);
      });
  }, []);

  const monthOrder = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc."
  ];

  const formatMonthly = (transactions) => {
    const map = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = date.toLocaleString("fr-FR", { month: "short" });
      if (!map[key]) map[key] = { mois: key, revenus: 0, dépenses: 0 };
      if (t.type === "income") map[key].revenus += t.amount;
      else map[key].dépenses += t.amount;
    });
    const result = Object.values(map).map((d) => ({
      ...d,
      solde: d.revenus - d.dépenses,
    }));
    return result.sort(
      (a, b) => monthOrder.indexOf(a.mois) - monthOrder.indexOf(b.mois)
    );
  };

  const formatYearly = (transactions) => {
    const map = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = date.getFullYear().toString();
      if (!map[key]) map[key] = { mois: key, revenus: 0, dépenses: 0 };
      if (t.type === "income") map[key].revenus += t.amount;
      else map[key].dépenses += t.amount;
    });
    return Object.values(map)
      .map((d) => ({
        ...d,
        solde: d.revenus - d.dépenses,
      }))
      .sort((a, b) => parseInt(a.mois) - parseInt(b.mois));
  };

  const formatCategories = (transactions) => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      if (!map[t.category]) map[t.category] = 0;
      map[t.category] += t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(displayedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistiques");
    XLSX.writeFile(wb, "statistiques.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Statistiques Financières", 20, 10);
    const tableColumn = ["Mois/Année", "Revenus", "Dépenses", "Solde"];
    const tableRows = displayedData.map(({ mois, revenus, dépenses, solde }) => [
      mois,
      revenus,
      dépenses,
      solde,
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("statistiques.pdf");
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl p-6 shadow-lg dark:bg-gray-900 dark:text-white">
      <ThemeToggle />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Revenus et Dépenses</h2>
      </div>

      <div className="mb-4 flex space-x-4">
        <button
          className={`rounded px-4 py-2 ${selectedPeriod === "mois" ? "bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-700 dark:text-white"}`}
          onClick={() => setSelectedPeriod("mois")}
        >
          Mois
        </button>
        <button
          className={`rounded px-4 py-2 ${selectedPeriod === "année" ? "bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-700 dark:text-white"}`}
          onClick={() => setSelectedPeriod("année")}
        >
          Année
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={displayedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="mois" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip wrapperStyle={{ backgroundColor: "#333", color: "#fff" }} />
            <Legend
              formatter={(value) => {
                if (value === "revenus") return "Revenus";
                if (value === "dépenses") return "Dépenses";
                return value;
              }}
            />
            <Bar dataKey="revenus" fill="#4CAF50" barSize={40} radius={[10, 10, 0, 0]} />
            <Bar dataKey="dépenses" fill="#F44336" barSize={40} radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayedData}>
            <XAxis dataKey="mois" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip wrapperStyle={{ backgroundColor: "#333", color: "#fff" }} />
            <Legend formatter={(value) => (value === "solde" ? "Solde" : value)} />
            <Line type="monotone" dataKey="solde" stroke="#FFC107" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6">
  <h3 className="text-lg font-semibold">Répartition des Dépenses</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={categories}
        dataKey="value"
        nameKey="name"
        outerRadius={100}  
        label
      >
        {categories.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip wrapperStyle={{ backgroundColor: "#333", color: "#fff" }} />
    </PieChart>
  </ResponsiveContainer>
</div>


      <div className="mt-6 flex space-x-4">
        <button
          onClick={downloadExcel}
          className="flex rounded bg-green-500 px-4 py-2 text-white"
        >
          <div className="flex">Télécharger Excel <Sheet className="ml-2" /></div>
        </button>
        <button
          onClick={downloadPDF}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          <div className="flex">Télécharger PDF <FileText className="ml-2" /></div>
        </button>
      </div>
    </div>
  );
}
