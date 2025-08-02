import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import * as BalanceContext from "../../context/BalanceContext";
import api from "../../api";
import Transaction from "../../components/transaction/Transaction";

// ✅ Mock de l'API
vi.mock("../../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

// ✅ Mock du composant TransactionForm
vi.mock("../../components/transaction/TransactionForm", () => ({
  default: ({ onFormSubmit }: any) => (
    <button
      onClick={() =>
        onFormSubmit({
          description: "Test income",
          amount: "100",
          transactionType: "income",
          date: new Date().toISOString(),
          type: "income",
        })
      }
    >
      Submit Transaction
    </button>
  ),
}));

describe("Transaction Component", () => {
  const mockSetBalance = vi.fn();

  beforeEach(() => {
    vi.spyOn(BalanceContext, "useBalance").mockReturnValue({
      balance: 500,
      setBalance: mockSetBalance,
    });

    (api.get as any).mockResolvedValue({
      status: 200,
      data: [
        {
          description: "Initial expense",
          amount: "50",
          type: "expense",
          date: "2024-06-01T00:00:00.000Z",
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and displays transactions", async () => {
    render(<Transaction />);

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_BASE_URL}/transaction/list`
      )
    );

    expect(
      await screen.findByText("Initial expense")
    ).toBeInTheDocument();
  });

  it("adds a new transaction and updates balance", async () => {
    render(<Transaction />);

    // ✅ Assure que les données initiales sont chargées
    await waitFor(() =>
      expect(screen.getByText("Initial expense")).toBeInTheDocument()
    );

    // ✅ Utilise getByRole pour fiabilité
    const submitButton = screen.getByRole("button", {
      name: /submit transaction/i,
    });
    fireEvent.click(submitButton);

    // ✅ Attends l'ajout de la transaction simulée
    await waitFor(() => {
      expect(screen.getByText("Test income")).toBeInTheDocument();
    });

    // ✅ Vérifie la mise à jour de la balance
    expect(mockSetBalance).toHaveBeenCalledWith(600); // 500 + 100
  });

  it("displays pagination controls when needed", async () => {
    // Mock avec plus de 5 transactions
    (api.get as any).mockResolvedValue({
      status: 200,
      data: Array.from({ length: 7 }, (_, i) => ({
        description: `Tx ${i + 1}`,
        amount: "10",
        type: "income",
        date: "2024-06-01T00:00:00.000Z",
      })),
    });

    render(<Transaction />);

    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Suivant")).toBeEnabled();

    fireEvent.click(screen.getByText("Suivant"));

    await waitFor(() => {
      expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
  });
});
