
import {
  validateField,
  validateForm,
} from "./validation";
import type { FormValues } from "./validation";

const validValues: FormValues = {
  fullName: "Samaya Quliyeva",
  email: "samaya@example.com",
  username: "samaya123",
  password: "Password123",
  confirmPassword: "Password123",
};

describe("Form validation", () => {
  test("accepts a valid email", () => {
    expect(
      validateField("email", "samaya@example.com", validValues)
    ).toBe("");
  });

  test("rejects an invalid email", () => {
    expect(
      validateField("email", "invalid-email", validValues)
    ).toBe("Please enter a valid email address.");
  });

  test("requires a full name", () => {
    expect(
      validateField("fullName", " ", validValues)
    ).toBe("Full name is required.");
  });

  test("rejects a short username", () => {
    expect(
      validateField("username", "ab", validValues)
    ).not.toBe("");
  });

  test("requires a strong password", () => {
    expect(
      validateField("password", "password", validValues)
    ).not.toBe("");
  });

  test("rejects passwords that do not match", () => {
    expect(
      validateField(
        "confirmPassword",
        "Different123",
        validValues
      )
    ).toBe("Passwords do not match.");
  });

  test("returns no errors for valid form values", () => {
    expect(validateForm(validValues)).toEqual({});
  });

  test("returns errors for an invalid form", () => {
    const invalidValues: FormValues = {
      ...validValues,
      email: "wrong-email",
      confirmPassword: "Different123",
    };

    const errors = validateForm(invalidValues);

    expect(errors.email).toBeTruthy();
    expect(errors.confirmPassword).toBeTruthy();
  });
});
