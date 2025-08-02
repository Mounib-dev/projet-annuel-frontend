// ChatBot.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatBot from "../../components/chatbot/ChatBot";
import React from "react";

// Mock AuthContext
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-token",
  }),
}));

// Mock scroll behavior
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

describe("ChatBot component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders chatbot UI correctly", () => {
    render(<ChatBot />);
    expect(screen.getByText("💰 Finance Chatbot")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about finance...")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("allows typing in input field", () => {
    render(<ChatBot />);
    const input = screen.getByPlaceholderText("Ask about finance...");
    fireEvent.change(input, { target: { value: "Hello bot" } });
    expect(input.value).toBe("Hello bot");
  });

  it("sends a message and displays user message", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        const payload = JSON.stringify({ text: "Hello from bot" });
        controller.enqueue(new TextEncoder().encode(`data: ${payload}\n`));
        controller.close();
      },
    });

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        body: mockStream,
      }),
    ));

    render(<ChatBot />);

    const input = screen.getByPlaceholderText("Ask about finance...");
    const button = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("You:")).toBeInTheDocument();
      expect(screen.getByText("Bot:")).toBeInTheDocument();
      expect(screen.getByText(/Hello from bot/)).toBeInTheDocument();
    });
  });

  it("disables send button while loading", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: "..." })}\n`));
        controller.close();
      },
    });

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        body: mockStream,
      }),
    ));

    render(<ChatBot />);
    const input = screen.getByPlaceholderText("Ask about finance...");
    const button = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test loading" } });
    fireEvent.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
