

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../components/auth/Login";

const loginMock = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

describe("Login component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  it("affiche le formulaire", () => {
    setup();
    expect(screen.getByText(/connexion à SmartFunds/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });

  it("affiche un message d'erreur en cas d'échec", async () => {
    loginMock.mockRejectedValueOnce(new Error("Invalid credentials"));

    setup();

    fireEvent.change(screen.getByPlaceholderText(/votre email/i), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });
});
