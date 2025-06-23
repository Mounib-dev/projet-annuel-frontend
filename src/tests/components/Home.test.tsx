/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../../components/Home";

// Mock Recharts components
vi.mock("recharts", () => ({
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  CartesianGrid: (props: any) => (
    <div data-testid="cartesian-grid" {...props} />
  ),
}));

describe("Home", () => {
  it("renders the main heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Home", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the chart heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "My Line Chart", level: 2 }),
    ).toBeInTheDocument();
  });

  it("renders the theme-aware text div", () => {
    render(<Home />);

    expect(
      screen.getByText(/This will have different backgrounds and text colors/),
    ).toBeInTheDocument();
  });

  it("renders the chart description", () => {
    render(<Home />);

    expect(
      screen.getByText(
        "Data visualization example using Recharts and Tailwind CSS.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the LineChart component", () => {
    render(<Home />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("renders chart components with correct structure", () => {
    render(<Home />);

    // Check that all chart components are rendered
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
  });

  it("renders chart with correct dimensions", () => {
    render(<Home />);

    const chart = screen.getByTestId("line-chart");
    expect(chart).toHaveAttribute("width", "500");
    expect(chart).toHaveAttribute("height", "300");
  });

  it("applies correct CSS classes to chart container", () => {
    render(<Home />);

    const chartContainer = screen.getByText("My Line Chart").closest("div");
    expect(chartContainer).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "rounded-lg",
      "bg-white",
      "p-6",
      "shadow-lg",
    );
  });
});
