import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import React from "react";

vi.mock("recharts", () => {
  const React = require("react");
  const Passthrough: React.FC<any> = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    LineChart: Passthrough,
    PieChart: Passthrough,
    Pie: Passthrough,
    Line: Passthrough,
    XAxis: Passthrough,
    YAxis: Passthrough,
    Tooltip: Passthrough,
    Legend: Passthrough,
    Cell: Passthrough,
    Sector: Passthrough,
  };
});

// 2) Mock Pagination neutre
vi.mock("../../components/pagination/Pagination", () => {
  const React = require("react");
  return {
    default: ({
      currentPage,
      totalPages,
      onPageChange,
    }: {
      currentPage: number;
      totalPages: number;
      onPageChange: (n: number) => void;
    }) => (
      <div aria-label="pagination-mock">
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
          Prev
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </button>
      </div>
    ),
  };
});

vi.mock("../../utils/exporters", () => ({
  exportPDF: vi.fn(),
  exportExcel: vi.fn(),
}));

const API_BASE = "http://localhost:3000/api/v1";
beforeEach(() => {
  (import.meta as any).env = {
    ...(import.meta as any).env,
    VITE_API_BASE_URL: API_BASE,
  };
  vi.clearAllMocks();
});

import { exportPDF, exportExcel } from "../../utils/exporters";
import api from "../../api";
import Dashboard from "../../components/Dashboard";

type TxType = "income" | "expense";
type Tx = import("../../types/transaction").Transaction;

function tx(
  i: number,
  {
    type,
    amount,
    daysFromToday = 0,
    description,
  }: {
    type: TxType;
    amount: number;
    daysFromToday?: number;
    description?: string;
  },
): Tx {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const iso = d.toISOString();
  return {
    _id: `t${i}`,
    user: "u1",
    type,
    category: type === "income" ? "salary" : "food",
    amount,
    description: description ?? `${type}-${i}`,
    date: iso,
    createdAt: iso,
    updatedAt: iso,
  };
}

function makeMonthlyData(): Tx[] {
  const arr: Tx[] = [];
  for (let i = 1; i <= 7; i++)
    arr.push(
      tx(i, {
        type: "expense",
        amount: i * 10,
        daysFromToday: -i,
        description: `exp-${i}`,
      }),
    );
  for (let i = 1; i <= 5; i++)
    arr.push(
      tx(100 + i, {
        type: "income",
        amount: i * 100,
        daysFromToday: -i * 2,
        description: `inc-${i}`,
      }),
    );
  return arr;
}

describe.sequential("Dashboard", () => {
  it("charge les transactions, affiche les totaux et 10 éléments max sur la première page", async () => {
    const data = makeMonthlyData();
    const getSpy = vi.spyOn(api, "get").mockResolvedValueOnce({ data });

    render(<Dashboard />);

    expect(getSpy).toHaveBeenCalledWith(`${API_BASE}/transaction/list`);

    await screen.findByText(/dashboard/i);

    const totalIncome = data
      .filter((d) => d.type === "income")
      .reduce((a, t) => a + t.amount, 0);
    const totalExpense = data
      .filter((d) => d.type === "expense")
      .reduce((a, t) => a + t.amount, 0);
    const balance = totalIncome - totalExpense;

    expect(screen.getByText(`${totalIncome.toFixed(2)} €`)).toBeInTheDocument();
    expect(
      screen.getByText(`${totalExpense.toFixed(2)} €`),
    ).toBeInTheDocument();
    expect(screen.getByText(`${balance.toFixed(2)} €`)).toBeInTheDocument();

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBeLessThanOrEqual(10);

    expect(screen.getByLabelText("pagination-mock")).toBeInTheDocument();
    expect(screen.getByText(/Page 1 \/ \d+/)).toBeInTheDocument();
  });

  it("affiche le bon input selon le filtre (week/month/year)", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: makeMonthlyData() });
    const user = userEvent.setup();

    render(<Dashboard />);

    await screen.findByText(/dashboard/i);

    expect(screen.getByDisplayValue(/\d{4}-\d{2}/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "year");
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "week");
    expect(screen.getByDisplayValue(/\d{4}-W\d{2}/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "month");
    expect(screen.getByDisplayValue(/\d{4}-\d{2}/)).toBeInTheDocument();
  });

  it("Exporter PDF/Excel appelle les fonctions avec transactions filtrées + totaux + libellé", async () => {
    const data = makeMonthlyData();
    vi.spyOn(api, "get").mockResolvedValueOnce({ data });

    const user = userEvent.setup();
    render(<Dashboard />);

    await screen.findByText(/dashboard/i);

    // Click PDF
    await user.click(screen.getByRole("button", { name: /exporter pdf/i }));
    expect(
      (exportPDF as unknown as { mock: MockInstance }).mock.calls.length,
    ).toBe(1);

    let [filteredTx, totals, label] = (exportPDF as any).mock.calls[0];
    expect(Array.isArray(filteredTx)).toBe(true);
    expect(totals).toEqual(
      expect.objectContaining({
        totalIncome: expect.any(Number),
        totalExpense: expect.any(Number),
        balance: expect.any(Number),
      }),
    );
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);

    // Click Excel
    await user.click(screen.getByRole("button", { name: /exporter excel/i }));
    expect((exportExcel as any).mock.calls.length).toBe(1);

    [filteredTx, totals, label] = (exportExcel as any).mock.calls[0];
    expect(Array.isArray(filteredTx)).toBe(true);
    expect(typeof label).toBe("string");
  });

  it("affiche 'Aucun historique trouvé.' si l'API renvoie []", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    await screen.findByText(/dashboard/i);
    expect(screen.getByText(/aucun historique trouvé/i)).toBeInTheDocument();
  });
});
