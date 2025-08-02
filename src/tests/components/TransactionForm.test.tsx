import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionForm from "../../components/transaction/TransactionForm";
import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

describe("TransactionForm", () => {
  const mockOnFormSubmit = vi.fn();

  beforeEach(() => {
    mockOnFormSubmit.mockClear();
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 201 });
  });

  it("submits form with valid data and calls API", async () => {
    render(<TransactionForm onFormSubmit={mockOnFormSubmit} />);

    fireEvent.click(screen.getByLabelText(/revenu/i));
    fireEvent.click(screen.getByLabelText("Salaire"));
    fireEvent.change(screen.getByLabelText(/montant/i), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Salaire Juin" } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2025-06-23" } });

    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
         expect.any(String),
        expect.objectContaining({
          transactionType: "income",
          category: "salary",
          amount: "1500",
          description: "Salaire Juin",
          date: "2025-06-23",
        }),
      );

      expect(mockOnFormSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: "income",
          category: "salary",
          amount: "1500",
          description: "Salaire Juin",
          date: "2025-06-23",
        }),
      );
    });
  });
});
