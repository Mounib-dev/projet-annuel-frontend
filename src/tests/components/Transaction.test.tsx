import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

let balanceValue = 100;

const setBalanceSpy = vi.fn((next: number) => {
  balanceValue = next;
});

// Mock du hook useBalance
vi.mock("../../context/BalanceContext", () => ({
  useBalance: () => ({ balance: balanceValue, setBalance: setBalanceSpy }),
}));

vi.mock("../../components/transaction/TransactionsList", () => {
  const React = require("react");
  return {
    default: ({
      refreshKey,
      onCreate,
    }: {
      refreshKey: number;
      onCreate?: (t: any) => void;
    }) => (
      <div>
        <div>TransactionsList refreshKey={refreshKey}</div>
        <button
          onClick={() =>
            onCreate?.({ transactionType: "expense", amount: "50" })
          }
        >
          TriggerExpense50
        </button>
        <button
          onClick={() =>
            onCreate?.({ transactionType: "income", amount: "30" })
          }
        >
          TriggerIncome30
        </button>
      </div>
    ),
  };
});

import Transaction from "../../components/transaction/Transaction";

describe.sequential("Transaction (nouvelle version avec onCreate)", () => {
  beforeEach(() => {
    balanceValue = 100;
    setBalanceSpy.mockClear();
  });

  it("rend la liste (refreshKey=0) et les triggers du mock list", () => {
    render(<Transaction />);

    expect(
      screen.getByText(/TransactionsList refreshKey=0/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /TriggerExpense50/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /TriggerIncome30/i }),
    ).toBeInTheDocument();
  });

  it("onCreate(dépense) : diminue le solde et incrémente refreshKey", async () => {
    const user = userEvent.setup();
    balanceValue = 200;

    render(<Transaction />);

    await user.click(screen.getByRole("button", { name: /TriggerExpense50/i }));

    expect(setBalanceSpy).toHaveBeenCalledTimes(1);
    // 200 - 50
    expect(setBalanceSpy).toHaveBeenCalledWith(150);

    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();
  });

  it("onCreate(revenu) : augmente le solde et incrémente refreshKey", async () => {
    const user = userEvent.setup();
    balanceValue = 100;

    render(<Transaction />);

    await user.click(screen.getByRole("button", { name: /TriggerIncome30/i }));

    expect(setBalanceSpy).toHaveBeenCalledTimes(1);
    // 100 + 30
    expect(setBalanceSpy).toHaveBeenCalledWith(130);

    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();
  });

  it("enchaîne plusieurs onCreate et incrémente refreshKey à chaque fois", async () => {
    const user = userEvent.setup();
    balanceValue = 300;

    render(<Transaction />);

    // 1) dépense 50 -> 250
    await user.click(screen.getByRole("button", { name: /TriggerExpense50/i }));
    expect(setBalanceSpy).toHaveBeenCalledWith(250);
    expect(
      screen.getByText(/TransactionsList refreshKey=1/i),
    ).toBeInTheDocument();

    // 2) revenu 30 -> 280
    await user.click(screen.getByRole("button", { name: /TriggerIncome30/i }));
    expect(setBalanceSpy).toHaveBeenCalledWith(280);
    expect(
      screen.getByText(/TransactionsList refreshKey=2/i),
    ).toBeInTheDocument();
  });
});
