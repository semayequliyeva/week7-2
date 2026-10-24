
export type FormValues = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

// Her sahenin daxil edilen melumatini ayrica yoxlayiriq.
export const validateField = (
  name: keyof FormValues,
  value: string,
  values: FormValues
): string => {
  const trimmedValue = value.trim();

  switch (name) {
    case "fullName":
      if (!trimmedValue) {
        return "Full name is required.";
      }

      if (trimmedValue.length < 3) {
        return "Full name must contain at least 3 characters.";
      }

      return "";

    case "email":
      if (!trimmedValue) {
        return "Email is required.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return "Please enter a valid email address.";
      }

      return "";

    case "username":
      if (!trimmedValue) {
        return "Username is required.";
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedValue)) {
        return "Username must contain 3-20 letters, numbers or underscores.";
      }

      return "";

    case "password":
      if (!value) {
        return "Password is required.";
      }

      if (value.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
        return "Password must include uppercase, lowercase and a number.";
      }

      return "";

    case "confirmPassword":
      if (!value) {
        return "Please confirm your password.";
      }

      if (value !== values.password) {
        return "Passwords do not match.";
      }

      return "";

    default:
      return "";
  }
};

// Submit zamani butun sahələri yoxlayiriq.
export const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  (Object.keys(values) as (keyof FormValues)[]).forEach((name) => {
    const error = validateField(name, values[name], values);

    if (error) {
      errors[name] = error;
    }
  });

  return errors;
};

// Formun gonderilmesine yalniz xeta olmadigi halda icaze veririk.
export const isFormValid = (errors: FormErrors): boolean => {
  return Object.keys(errors).length === 0;
};
