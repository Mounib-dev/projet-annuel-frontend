// ChatBot.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import React from "react";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "TEST_TOKEN" }),
}));

vi.mock("../../hooks/useChatMessages", () => {
  const React = require("react") as typeof import("react");
  return {
    useChatMessages: () =>
      React.useState<import("../../types/chat").ChatMessage[]>([]),
  };
});

// 3) Important : stub de la base URL
const API_BASE = "http://localhost:3000/api/v1";
beforeEach(() => {
  (import.meta as any).env = {
    ...(import.meta as any).env,
    VITE_API_BASE_URL: API_BASE,
  };
});

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

import ChatBot from "../../components/chatbot/ChatBot";

describe.sequential("ChatBot", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("affiche l'en-tête, l'input et le bouton", () => {
    render(<ChatBot />);

    expect(screen.getByText(/finance chatbot/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/ask about finance/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("n'envoie rien si l'input est vide", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(global, "fetch" as any)
      .mockResolvedValueOnce({} as Response);

    render(<ChatBot />);
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("soumet avec le token et le bon payload; gère body null", async () => {
    const user = userEvent.setup();

    // Réponse sans body
    const fetchSpy = vi.spyOn(global, "fetch" as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: null,
    } as Response);

    render(<ChatBot />);

    const input = screen.getByPlaceholderText(/ask about finance/i);
    await user.type(input, "Hello bot");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = fetchSpy.mock.calls[0];

    expect(calledUrl).toBe(`${API_BASE}/chatbot/assistant`);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer TEST_TOKEN");

    const parsed = JSON.parse(options.body);
    expect(parsed.messages).toEqual([{ role: "user", content: "Hello bot" }]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });
  });

  it("preventDefault au submit", () => {
    const { container } = render(<ChatBot />);
    const form = container.querySelector("form")!;
    const canceled = fireEvent.submit(form);

    expect(canceled).toBe(false);
  });
});
