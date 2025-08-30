import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

vi.mock("../../api", () => ({
  default: { get: vi.fn() },
}));

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("../../components/utils/DialogModal", () => {
  const React = require("react");
  return {
    default: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
    }) => (isOpen ? <div data-testid="dialog-modal">{children}</div> : null),
  };
});

vi.mock("../../components/category/CategoryForm", () => {
  const React = require("react");
  return {
    default: ({ onAddCategory }: { onAddCategory: (c: any) => void }) => (
      <div>
        <button
          onClick={() =>
            onAddCategory({
              id: "newcat",
              title: "loisirs",
              icon: <span data-testid="newcat-icon" />,
            })
          }
        >
          AddMockCategory
        </button>
      </div>
    ),
  };
});

import api from "../../api";
import axios from "axios";
import TransactionForm from "../../components/transaction/TransactionForm";

const API_BASE = "http://localhost:3000/api/v1";
const apiCats = [
  { _id: "c1", title: "cinema", icon: "food" },
  { _id: "c2", title: "bus", icon: "transport" },
];
const defaultCatsCount = 8;
const countCategoryRadios = () =>
  document.querySelectorAll<HTMLInputElement>(
    'input[name="category"][type="radio"]',
  ).length;

async function waitForCategoryRadio(value: string) {
  await waitFor(() => {
    const el = document.querySelector<HTMLInputElement>(
      `input[name="category"][type="radio"][value="${value}"]`,
    );
    expect(el).not.toBeNull();
  });
  return document.querySelector<HTMLInputElement>(
    `input[name="category"][type="radio"][value="${value}"]`,
  )!;
}

describe.sequential("TransactionForm", () => {
  beforeEach(() => {
    (import.meta as any).env = {
      ...(import.meta as any).env,
      VITE_API_BASE_URL: API_BASE,
    };

    (api.get as unknown as vi.Mock).mockReset();
    (axios.post as unknown as vi.Mock).mockReset();

    (api.get as unknown as vi.Mock).mockResolvedValue({
      data: apiCats,
    });
  });

  it("charge les catégories (défaut + API) et affiche le sélecteur après choix du type", async () => {
    render(<TransactionForm onFormSubmit={vi.fn()} />);

    const user = userEvent.setup();

    await user.click(screen.getByText(/Dépense/i));

    expect(await screen.findByText(/Catégorie/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(countCategoryRadios()).toBe(defaultCatsCount + apiCats.length);
    });
  });

  it("valide les champs requis avant soumission", async () => {
    render(<TransactionForm onFormSubmit={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    const requiredMsgs = await screen.findAllByText(
      /Ce champ est obligatoire/i,
    );
    expect(requiredMsgs.length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByText(/Dépense/i));
    await screen.findByText(/Catégorie/i);

    const sportRadio = await waitForCategoryRadio("sport");
    await user.click(sportRadio);

    await user.type(screen.getByLabelText(/Description/i), "Test");

    const amount = screen.getByLabelText(/Montant/i);
    await user.type(amount, "0");
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    expect(
      await screen.findByText(/Le montant doit être supérieur à 0/i),
    ).toBeInTheDocument();
  });

  it("ouvre le modal, ajoute une nouvelle catégorie via CategoryForm et l’affiche", async () => {
    render(<TransactionForm onFormSubmit={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByText(/Dépense/i));
    await screen.findByText(/Catégorie/i);

    await waitFor(() => {
      expect(countCategoryRadios()).toBe(defaultCatsCount + apiCats.length);
    });
    const categoriesBefore = countCategoryRadios();

    await user.click(screen.getByText(/Créer/i));
    expect(screen.getByTestId("dialog-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /AddMockCategory/i }));

    await waitFor(() => {
      expect(countCategoryRadios()).toBe(categoriesBefore + 1);
    });

    const newCatRadio = await waitForCategoryRadio("newcat");
    await user.click(newCatRadio);

    expect(await screen.findByText("Loisirs")).toBeInTheDocument();
  });

  it("si l’API catégories échoue, seules les catégories par défaut sont présentes", async () => {
    (api.get as unknown as vi.Mock).mockRejectedValueOnce(new Error("Boom"));

    render(<TransactionForm onFormSubmit={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByText(/Revenu/i));
    await screen.findByText(/Catégorie/i);

    await waitFor(() => {
      expect(countCategoryRadios()).toBe(defaultCatsCount); // 8
    });
  });
});
