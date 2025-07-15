import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

function ProblemChild() {
  throw new Error("Test error");
}

test("ErrorBoundary catches errors and displays fallback UI", () => {
  render(
    <ErrorBoundary>
      <ProblemChild />
    </ErrorBoundary>
  );
  expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  expect(screen.getByText(/Test error/i)).toBeInTheDocument();
});
