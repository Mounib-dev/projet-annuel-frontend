import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

let balanceValue = 100;

const setBalanceSpy = vi.fn((next: number) => {
  balanceValue = next;
});

vi.mock("../../context/BalanceContext", () => ({
  useBalance: () => ({ balance: balanceValue, setBalance: setBalanceSpy }),
}));

vi.mock("../../components/transaction/TransactionForm", () => {
  const React = require("react");
  return {
    default: ({ onFormSubmit }: { onFormSubmit: (t: any) => void }) => (
      <div>
        <button
          onClick={() =>
            onFormSubmit({ transactionType: "expense", amount: "50" })
          }
        >
          SubmitExpense50
        </button>
        <button
          onClick={() =>
            onFormSubmit({ transactionType: "income", amount: "30" })
          }
        >
          SubmitIncome30
        </button>
      </div>
    ),
  };
});

vi.mock("../../components/transaction/TransactionsList", () => {
  const React = require("react");
  return {
    default: ({ refreshKey }: { refreshKey: number }) => (
      <div>TransactionsList refreshKey={refreshKey}</div>
    ),
  };
});

import Transaction from "../../components/transaction/Transaction";

describe.sequential("Transaction", () => {
  beforeEach(() => {
    balanceValue = 100;
    setBalanceSpy.mockClear();
  });

  it("rend la liste (refreshKey=0) et le formulaire mocké", () => {
    render(<Transaction />);

    expect(
      screen.getByText(/TransactionsList refreshKey=0/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /SubmitExpense50/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /SubmitIncome30/i }),
    ).toBeInTheDocument();
  });

  it("soumission d'une dépense diminue le solde et incrémente refreshKey", async () => {
    const user = userEvent.setup();
    balanceValue = 200;

    render(<Transaction />);

    await user.click(screen.getByRole("button", { name: /SubmitExpense50/i }));

    expect(setBalanceSpy).toHaveBeenCalledTimes(1);
    expect(setBalanceSpy).toHaveBeenCalledWith(150);

    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();
  });

  it("soumission d'un revenu augmente le solde et incrémente refreshKey", async () => {
    const user = userEvent.setup();
    balanceValue = 100;

    render(<Transaction />);

    await user.click(screen.getByRole("button", { name: /SubmitIncome30/i }));

    expect(setBalanceSpy).toHaveBeenCalledTimes(1);
    expect(setBalanceSpy).toHaveBeenCalledWith(130);

    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();
  });

  it("enchaîne plusieurs soumissions et incrémente refreshKey à chaque fois", async () => {
    const user = userEvent.setup();
    balanceValue = 300;

    render(<Transaction />);

    // 1) dépense 50 -> 250
    await user.click(screen.getByRole("button", { name: /SubmitExpense50/i }));
    expect(setBalanceSpy).toHaveBeenCalledWith(250);
    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();

    // 2) revenu 30 -> 280
    await user.click(screen.getByRole("button", { name: /SubmitIncome30/i }));
    expect(setBalanceSpy).toHaveBeenCalledWith(280);
    expect(
      screen.getByText(/TransactionsList refreshKey=2/i),
    ).toBeInTheDocument();
  });
});
