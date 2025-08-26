import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CategoryForm from "../../components/category/CategoryForm";

// Mock de l'API pour éviter les vraies requêtes HTTP
vi.mock("../../api", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      status: 201,
      data: { _id: "123", title: "Test" }
    }))
  }
}));

describe("CategoryForm", () => {
  it("affiche les champs du formulaire", () => {
    render(<CategoryForm onAddCategory={vi.fn()} />);

    // Champ texte
    expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument();

    // Texte "Icône"
    expect(screen.getByText(/Icône/i)).toBeInTheDocument();

    // Bouton Ajouter
    expect(screen.getByRole("button", { name: /ajouter/i })).toBeInTheDocument();

    // Inputs radio (on compte juste le nombre)
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("permet de sélectionner une icône", async () => {
    render(<CategoryForm onAddCategory={vi.fn()} />);
    const user = userEvent.setup();

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]);
    expect(radios[0]).toBeChecked();

    await user.click(radios[1]);
    expect(radios[1]).toBeChecked();
  });

  it("appelle onAddCategory après submit", async () => {
    const mockAdd = vi.fn();
    render(<CategoryForm onAddCategory={mockAdd} />);
    const user = userEvent.setup();

    // Remplir titre
    await user.type(screen.getByLabelText(/Titre/i), "Test");

    // Sélectionner une icône
    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]);

    // Soumettre
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith({
      id: "123",
      title: "Test",
      icon: expect.anything()
    });
  });

  it("empêche le rechargement de la page au submit", () => {
    render(<CategoryForm onAddCategory={vi.fn()} />);

   // const form = screen.getByRole("form");
    const form = screen.getByTestId("category-form");
    const event = new Event("submit", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    form.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
