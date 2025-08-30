import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import React from "react";

vi.mock("../../api", () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from "../../api";
import CategoryForm from "../../components/category/CategoryForm";

describe.sequential("CategoryForm", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("affiche le champ Titre, la section Icône, les 5 radios et le bouton Ajouter", () => {
    render(<CategoryForm onAddCategory={vi.fn()} />);

    // Champ Titre
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();

    // Libellé 'Icône'
    expect(screen.getByText(/icône/i)).toBeInTheDocument();

    // Les 5 inputs radio
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);

    // Bouton "Ajouter"
    expect(
      screen.getByRole("button", { name: /ajouter/i }),
    ).toBeInTheDocument();
  });

  it("permet de sélectionner une icône (radio)", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onAddCategory={vi.fn()} />);

    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    await user.click(radios[1]); // ex: credit-card
    expect(radios[1].checked).toBe(true);
  });

  it("soumet: appelle l'API, onAddCategory, affiche le message de succès, et reset les champs", async () => {
    const user = userEvent.setup();
    const onAddCategory = vi.fn();

    (api.post as Mock).mockResolvedValueOnce({
      status: 201,
      data: { _id: "abc123", title: "Food" },
    });

    render(<CategoryForm onAddCategory={onAddCategory} />);

    const titleInput = screen.getByLabelText<HTMLInputElement>(/titre/i);
    await user.type(titleInput, "Food");

    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    await user.click(radios[1]); // credit-card
    expect(radios[1].checked).toBe(true);

    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith("/category/create", {
      title: "Food",
      icon: "credit-card",
    });

    await waitFor(() => expect(onAddCategory).toHaveBeenCalledTimes(1));

    const arg = (onAddCategory as unknown as Mock).mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        id: "abc123",
        title: "Food",
      }),
    );
    expect(React.isValidElement(arg.icon)).toBe(true);

    expect(
      screen.getByText(/catégorie ajoutée avec succès/i),
    ).toBeInTheDocument();

    // Fields reset
    expect(titleInput.value).toBe("");
    screen.getAllByRole<HTMLInputElement>("radio").forEach((r) => {
      expect(r.checked).toBe(false);
    });
  });

  it("gère l'erreur API en affichant une alerte et sans appeler onAddCategory", async () => {
    const user = userEvent.setup();
    const onAddCategory = vi.fn();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    (api.post as Mock).mockRejectedValueOnce(new Error("Boom"));

    render(<CategoryForm onAddCategory={onAddCategory} />);

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(api.post).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Erreur lors de la création de la catégorie.",
      );
    });

    expect(onAddCategory).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("empêche le rechargement de la page au submit (preventDefault)", () => {
    const onAddCategory = vi.fn();
    const { container } = render(
      <CategoryForm onAddCategory={onAddCategory} />,
    );

    (api.post as Mock).mockResolvedValueOnce({
      status: 201,
      data: { _id: "tmp", title: "" },
    });

    const form = container.querySelector("form")!;
    const canceled = fireEvent.submit(form);

    expect(canceled).toBe(false);
  });
});
