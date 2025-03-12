import { useState } from "react";
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

const monthlyData = [
  { month: "Jan", revenue: 4000, expenses: 2400, balance: 1600 },
  { month: "Feb", revenue: 3000, expenses: 1398, balance: 1602 },
  { month: "Mar", revenue: 5000, expenses: 2800, balance: 2200 },
  { month: "Apr", revenue: 4780, expenses: 3908, balance: 872 },
  { month: "May", revenue: 5890, expenses: 4800, balance: 1090 },
  { month: "Jun", revenue: 4390, expenses: 3800, balance: 590 },
  { month: "Jul", revenue: 6490, expenses: 4300, balance: 2190 },
];

const yearlyData = [
  { month: "2020", revenue: 50000, expenses: 30000, balance: 20000 },
  { month: "2021", revenue: 60000, expenses: 35000, balance: 25000 },
  { month: "2022", revenue: 70000, expenses: 40000, balance: 30000 },
  { month: "2023", revenue: 80000, expenses: 50000, balance: 30000 },
];

const categories = [
  { name: "Alimentation", value: 1200 },
  { name: "Transport", value: 800 },
  { name: "Loisirs", value: 600 },
  { name: "Santé", value: 400 },
];

const COLORS = ["#4CAF50", "#00C49F", "#8BC34A", "#388E3C"];

export default function FinanceChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("mois");
  const displayedData = selectedPeriod === "mois" ? monthlyData : yearlyData;

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
    const tableRows = displayedData.map(
      ({ month, revenue, expenses, balance }) => [
        month,
        revenue,
        expenses,
        balance,
      ],
    );
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
          <BarChart
            data={displayedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              wrapperStyle={{ backgroundColor: "#333", color: "#fff" }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#4CAF50"
              barSize={40}
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="#F44336"
              barSize={40}
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayedData}>
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              wrapperStyle={{ backgroundColor: "#333", color: "#fff" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#FFC107"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <h3 className="mt-6 text-lg font-semibold">Répartition des Dépenses</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categories}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {categories.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip wrapperStyle={{ backgroundColor: "#333", color: "#fff" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={downloadExcel}
          className="flex rounded bg-green-500 px-4 py-2 text-white"
        >
          <div className="flex">
            {" "}
            Télécharger Excel
            <Sheet className="ml-2" />
          </div>
        </button>
        <button
          onClick={downloadPDF}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          <div className="flex">
            {" "}
            Télécharger PDF
            <FileText className="ml-2" />
          </div>
        </button>
      </div>
    </div>
  );
}
