
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../../components/auth/Register";
import { BrowserRouter } from "react-router-dom";


beforeAll(() => { 
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
// Wrapper pour permettre l'utilisation de <Link>
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("Register Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders all input fields", () => {
    render(<Register />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText("Votre prénom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre nom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Créer un mot de passe"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirmez votre mot de passe"),
    ).toBeInTheDocument();
  });

  it("shows alert when passwords do not match", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Register />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("Votre prénom"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Votre nom"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Votre email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Créer un mot de passe"), {
      target: { value: "password123" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Confirmez votre mot de passe"),
      {
        target: { value: "differentPass" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Les mots de passe ne correspondent pas.",
      );
    });
  });

  it("submits form and shows success message", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
    global.fetch = mockFetch as any;

    render(<Register />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("Votre prénom"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Votre nom"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Votre email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Créer un mot de passe"), {
      target: { value: "password123" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Confirmez votre mot de passe"),
      {
        target: { value: "password123" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(
        screen.getByText(
          "Inscription réussie ! vous pouvez à présent vous connecter",
        ),
      ).toBeInTheDocument();
    });
  });
});
