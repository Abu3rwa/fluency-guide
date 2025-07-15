import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Auth from "../../screens/Auth";

describe("Auth Screen", () => {
  it("renders login form by default", () => {
    render(<Auth />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i })
    ).toBeInTheDocument();
  });

  it("shows error on empty submit", () => {
    render(<Auth />);
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
});
