import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Transaction } from "../types/transaction";
import { Totals } from "../types/dashboard";

export const exportPDF = (
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

export const exportExcel = (
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
