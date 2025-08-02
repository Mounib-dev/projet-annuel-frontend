import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import BalanceModal from "../../components/balance/BalanceModal";
import api from "../../api";

vi.mock("../../api", () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

describe("BalanceModal", () => {
  const onSaveMock = vi.fn();
  const apiPostMock = api.post as ReturnType<typeof vi.fn>;

  it("désactive le bouton pendant le chargement", async () => {
    let resolvePromise!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    apiPostMock.mockReturnValue(promise);

    render(<BalanceModal open={true} onSave={onSaveMock} />);
    const input = screen.getByPlaceholderText(/saisissez votre solde/i);
    const button = screen.getByRole("button", { name: /enregistrer/i });

    fireEvent.change(input, { target: { value: "70" } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/enregistrement/i);

    resolvePromise();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent(/enregistrer/i);
    });
  });
});
