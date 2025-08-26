import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import * as BalanceContext from "../../context/BalanceContext";
import api from "../../api";
import Transaction from "../../components/transaction/Transaction";

// Mock API
vi.mock("../../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock TransactionForm
vi.mock("../../components/transaction/TransactionForm", () => ({
  default: ({ onFormSubmit }: any) => (
    <button onClick={() =>
      onFormSubmit({
        description: "Test income",
        amount: "100",
        transactionType: "income",
        date: new Date().toISOString(),
        type: "income",
      })
    }>
      Submit Transaction
    </button>
  ),
}));

describe("Transaction component", () => {
  const mockSetBalance = vi.fn();

  beforeEach(() => {
    vi.spyOn(BalanceContext, "useBalance").mockReturnValue({
      balance: 500,
      setBalance: mockSetBalance,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches transactions on mount", async () => {
    (api.get as any).mockResolvedValueOnce({
      status: 200,
      data: [
        { description: "Tx1", amount: "50", type: "expense", date: "2024-06-01" },
      ],
    });

    render(<Transaction />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_BASE_URL}/transaction/list`
      );
    });
  });

  it("adds a transaction and updates balance", async () => {
    (api.get as any).mockResolvedValueOnce({ status: 200, data: [] });

    render(<Transaction />);

    // Clique sur le bouton mocké de TransactionForm
    fireEvent.click(screen.getByRole("button", { name: /submit transaction/i }));

    await waitFor(() => {
      expect(mockSetBalance).toHaveBeenCalledWith(600); // 500 + 100
    });
  });

  it("handles API error gracefully", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (api.get as any).mockRejectedValueOnce(new Error("API error"));

    render(<Transaction />);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        "Error fetching transactions:",
        expect.any(Error)
      );
    });

    errorSpy.mockRestore();
  });
});
