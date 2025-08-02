import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CategoryForm from "../../components/category/CategoryForm";

describe("CategoryForm", () => {
  it("affiche les champs du formulaire", () => {
    render(<CategoryForm sendIconToTransactionForm={vi.fn()} />);

    // Le champ titre
    expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument();

    // Le texte "Icône"
    expect(screen.getByText(/Icône/i)).toBeInTheDocument();

    // Les boutons radio avec aria-labels
    expect(screen.getByRole("radio", { name: /Martini/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Credit Card/i })).toBeInTheDocument();

    // Le bouton Ajouter
    expect(screen.getByRole("button", { name: /Ajouter/i })).toBeInTheDocument();
  });

  it("permet de sélectionner une icône", async () => {
    render(<CategoryForm sendIconToTransactionForm={vi.fn()} />);

    const martiniRadio = screen.getByRole("radio", { name: /Martini/i });
    const creditCardRadio = screen.getByRole("radio", { name: /Credit Card/i });

    await userEvent.click(martiniRadio);
    expect(martiniRadio).toBeChecked();

    await userEvent.click(creditCardRadio);
    expect(creditCardRadio).toBeChecked();
  });

  it("appelle sendIconToTransactionForm avec 'Test' au clic sur Ajouter", async () => {
    const mockSend = vi.fn();
    render(<CategoryForm sendIconToTransactionForm={mockSend} />);

    const submitButton = screen.getByRole("button", { name: /Ajouter/i });
    await userEvent.click(submitButton);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith("Test");
  });

 it("empêche le rechargement de la page au submit", () => {
  const mockSend = vi.fn();
  render(<CategoryForm sendIconToTransactionForm={mockSend} />);

  const form = screen.getByTestId("category-form");

  // Crée un event réel avec preventDefault espionné
  const event = new Event("submit", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "preventDefault", {
    value: vi.fn(),
    writable: true,
  });

  form.dispatchEvent(event);

  expect(event.preventDefault).toHaveBeenCalled();
});
});
