
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {
  validateField,
  validateForm,
} from "../lib/validation";
import type {
  FormErrors,
  FormValues,
} from "../lib/validation";
import {
  checkUsernameAvailability,
  submitRegistration,
} from "../lib/api";

const initialValues: FormValues = {
  fullName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
};

const fields: {
  name: keyof FormValues;
  label: string;
  type: string;
  placeholder: string;
  autocomplete: string;
}[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    placeholder: "Enter your full name",
    autocomplete: "name",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    placeholder: "you@example.com",
    autocomplete: "email",
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Choose a username",
    autocomplete: "username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Create a password",
    autocomplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    placeholder: "Enter your password again",
    autocomplete: "new-password",
  },
];

type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

export default function ComplexForm() {
  const [values, setValues] =
    useState<FormValues>(initialValues);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormValues, boolean>>
  >({});

  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>("idle");

  const [usernameRetry, setUsernameRetry] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const inputRefs = useRef<
    Partial<Record<keyof FormValues, HTMLInputElement | null>>
  >({});

  // Username yoxlamasini gecikme ile icra edirik.
  useEffect(() => {
    const username = values.username.trim();

    if (!touched.username || !username) {
      setUsernameStatus("idle");
      return;
    }

    const usernameError = validateField(
      "username",
      username,
      values
    );

    if (usernameError) {
      setUsernameStatus("idle");
      return;
    }

    let active = true;

    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const available =
          await checkUsernameAvailability(username);

        if (!active) return;

        setUsernameStatus(
          available ? "available" : "unavailable"
        );

        setErrors((previous) => ({
          ...previous,
          username: available
            ? ""
            : "This username is already taken.",
        }));
      } catch {
        if (!active) return;
        setUsernameStatus("error");
        setErrors((previous) => ({
          ...previous,
          username: "Could not check username. Please retry.",
        }));
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [values.username, touched.username, usernameRetry]);

  // Deyisiklik zamani yalniz toxunulmus saheleri yoxlayiriq.
  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FormValues;

    const nextValues = {
      ...values,
      [fieldName]: value,
    };

    setValues(nextValues);
    setSubmitError("");
    setSuccessMessage("");

    if (touched[fieldName]) {
      const error = validateField(
        fieldName,
        value,
        nextValues
      );

      setErrors((previous) => ({
        ...previous,
        [fieldName]: error,
      }));
    }

    // Sifre deyisende tesdiq sahesini de yeniden yoxlayiriq.
    if (fieldName === "password" && touched.confirmPassword) {
      setErrors((previous) => ({
        ...previous,
        confirmPassword: validateField(
          "confirmPassword",
          nextValues.confirmPassword,
          nextValues
        ),
      }));
    }

    if (fieldName === "username") {
      setUsernameStatus("idle");
      setErrors((previous) => ({
        ...previous,
        username: "",
      }));
    }
  };

  // Sahe terk edilende onun xetasini gosteririk.
  const handleBlur = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const fieldName = event.target.name as keyof FormValues;

    setTouched((previous) => ({
      ...previous,
      [fieldName]: true,
    }));

    const error = validateField(
      fieldName,
      event.target.value,
      values
    );

    setErrors((previous) => ({
      ...previous,
      [fieldName]: error,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    const validationErrors = validateForm(values);

    setTouched({
      fullName: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    setErrors(validationErrors);
    setShowSummary(true);

    const firstInvalidField = fields.find(
      (field) => Boolean(validationErrors[field.name])
    );

    if (firstInvalidField) {
      inputRefs.current[firstInvalidField.name]?.focus();
      return;
    }

    if (usernameStatus !== "available") {
      setSubmitError(
        "Please wait until your username has been verified."
      );
      inputRefs.current.username?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitRegistration();
      setSuccessMessage(result.message);
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setUsernameStatus("idle");
      setShowSummary(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Butun saheler ve username yoxlamasi ugurlu olmalidir.
  const allFieldsValid = fields.every(
    (field) =>
      validateField(
        field.name,
        values[field.name],
        values
      ) === ""
  );

 
const canSubmit =
  fields.every(
    (field) =>
      validateField(field.name, values[field.name], values) === ""
  ) &&
  usernameStatus === "available" &&
  !submitting;


  const visibleErrors = fields.filter(
    (field) => Boolean(errors[field.name])
  );

  const retryUsernameCheck = () => {
    setErrors((previous) => ({
      ...previous,
      username: "",
    }));
    setUsernameStatus("idle");
    setUsernameRetry((previous) => previous + 1);
  };

  return (
    <section className="form-card">
      <header className="form-heading">
        <span className="form-eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>
          Fill in your details below to create your account.
        </p>
      </header>

      {showSummary && visibleErrors.length > 0 && (
        <section
          className="error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
        >
          <h2 id="error-summary-title">
            Please correct the following errors:
          </h2>

          <ul>
            {visibleErrors.map((field) => (
              <li key={field.name}>
                <a
                  href={`#${field.name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    inputRefs.current[field.name]?.focus();
                  }}
                >
                  {field.label}: {errors[field.name]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {submitError && (
        <div className="form-message error-message" role="alert">
          <p>{submitError}</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSubmitError("");
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="form-message success-message" role="status">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {fields.map((field) => {
          const error = errors[field.name];
          const inputId = field.name;
          const errorId = `${field.name}-error`;

          return (
            <div className="form-field" key={field.name}>
              <label htmlFor={inputId}>
                {field.label}
              </label>

              <input
                ref={(element) => {
                  inputRefs.current[field.name] = element;
                }}
                id={inputId}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autocomplete}
                value={values[field.name]}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ||
                  (field.name === "username" &&
                    usernameStatus !== "idle")
                    ? errorId
                    : undefined
                }
              />

              {error && (
                <p id={errorId} className="field-error">
                  {error}
                </p>
              )}

              {field.name === "username" &&
                usernameStatus === "checking" && (
                  <p id={errorId} className="username-feedback" role="status">
                    Checking username availability...
                  </p>
                )}

              {field.name === "username" &&
                usernameStatus === "available" && (
                  <p id={errorId} className="field-success" role="status">
                    Username is available.
                  </p>
                )}

              {field.name === "username" &&
                usernameStatus === "unavailable" && (
                  <p id={errorId} className="field-error">
                    This username is already taken. Please choose another.
                  </p>
                )}

              {field.name === "username" &&
                usernameStatus === "error" && (
                  <div className="username-feedback">
                    <span>Username check failed.</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={retryUsernameCheck}
                    >
                      Try again
                    </button>
                  </div>
                )}
            </div>
          );
        })}

        <button
          type="submit"
          className="submit-button"
          disabled={!canSubmit}
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="form-footnote">
          All fields are required. Your username must be available.
        </p>
      </form>
    </section>
  );
}
