/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, beforeAll } from "vitest";
import Dashboard from "../../components/Dashboard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



// Mock global de ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});


// Mocks
vi.mock("../../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new ArrayBuffer(10)),
}));

vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

// Données simulées
const mockTransactions = [
  {
    id: 1,
    description: "Salaire",
    type: "income",
    amount: 2000,
    date: "2025-06-01",
  },
  {
    id: 2,
    description: "Loyer",
    type: "expense",
    amount: 800,
    date: "2025-06-02",
  },
  {
    id: 3,
    description: "Courses",
    type: "expense",
    amount: 200,
    date: "2025-06-03",
  },
];

const mockBalance = { amount: 1000 };

// Référence au mock de l'API
const api = (await import("../../api")).default;

beforeEach(() => {
  vi.clearAllMocks();

  (api.get as any).mockImplementation((url: string) => {
    if (url.includes("/transaction/list")) {
      return Promise.resolve({ data: mockTransactions });
    }
    if (url.includes("/balance")) {
      return Promise.resolve({ data: mockBalance });
    }
    return Promise.reject(new Error("Unknown API"));
  });
});

describe("Dashboard", () => {
 it("affiche le solde, revenus et dépenses", async () => {
  render(<Dashboard />);
  expect(await screen.findByText("Salaire")).toBeInTheDocument();
 expect(screen.getAllByText(/Revenus/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Dépenses/i)[0]).toBeInTheDocument();
  expect(screen.getByText(/Solde/i)).toBeInTheDocument();
  expect(screen.getByText("2000.00 €")).toBeInTheDocument();
  expect(screen.getAllByText("1000.00 €").length).toBeGreaterThanOrEqual(1);
});


  it("affiche l'alerte de grosses dépenses", async () => {
    render(<Dashboard />);
    expect(
      await screen.findByText(/Attention : 2 dépense\(s\) dépassent 150/i)
    ).toBeInTheDocument();
  });

  it("change de filtre et met à jour la vue", async () => {
    render(<Dashboard />);
    const select = screen.getByDisplayValue("Mois");
    fireEvent.change(select, { target: { value: "year" } });
    expect(await screen.findByText(/Période : 2025/)).toBeInTheDocument();
  });

  it("test de l'export Excel", async () => {
    render(<Dashboard />);
    const exportButton = await screen.findByText("Exporter Excel");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("pagination fonctionne correctement", async () => {
    render(<Dashboard />);
    const nextButton = await screen.findByText("Suivant →");
    fireEvent.click(nextButton);
    const pageIndicator = screen.getByText(/Page \d+ \/ \d+/);
    expect(pageIndicator).toBeInTheDocument();
  });

  it("affiche un message si aucune transaction", async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/transaction/list")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("/balance")) {
        return Promise.resolve({ data: { amount: 0 } });
      }
      return Promise.reject("Unknown endpoint");
    });

    render(<Dashboard />);
    expect(
      await screen.findByText(/Aucun historique trouvé/i)
    ).toBeInTheDocument();
  });
});
