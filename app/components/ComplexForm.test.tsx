
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplexForm from "./ComplexForm";
import {
  checkUsernameAvailability,
  submitRegistration,
} from "../lib/api";

jest.mock("../lib/api", () => ({
  checkUsernameAvailability: jest.fn(),
  submitRegistration: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();

  jest.mocked(checkUsernameAvailability).mockResolvedValue(true);

  jest.mocked(submitRegistration).mockResolvedValue({
    success: true,
    message: "Your account has been created successfully!",
  });
});

async function fillValidForm() {
  const user = userEvent.setup();

  await user.type(
    screen.getByLabelText(/full name/i),
    "Samaya Quliyeva"
  );

  await user.type(
    screen.getByLabelText(/email address/i),
    "samaya@example.com"
  );

  await user.type(
    screen.getByLabelText(/^username$/i),
    "samaya123"
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123"
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password123"
  );

  return user;
}

describe("ComplexForm", () => {
  test("renders all form fields", () => {
    render(<ComplexForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test("keeps submit disabled until the form is valid", () => {
    render(<ComplexForm />);

    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeDisabled();
  });

  test("allows submission when all fields are valid", async () => {
    render(<ComplexForm />);

    const user = await fillValidForm();

    expect(
      await screen.findByText("Username is available.")
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    expect(
      await screen.findByText(
        "Your account has been created successfully!"
      )
    ).toBeInTheDocument();

    expect(submitRegistration).toHaveBeenCalledTimes(1);
  });

  test("shows an error when submission fails", async () => {
    jest.mocked(submitRegistration).mockRejectedValueOnce(
      new Error("Network error. Please try again.")
    );

    render(<ComplexForm />);

    const user = await fillValidForm();

    expect(
      await screen.findByText("Username is available.")
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    expect(
      await screen.findByText("Network error. Please try again.")
    ).toBeInTheDocument();
  });
});
