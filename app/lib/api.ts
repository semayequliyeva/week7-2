
type ApiResult = {
  success: boolean;
  message: string;
};

// Asinxron emeliyyati simulyasiya edirik.
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Username-in istifade ucun bos olub-olmadigini yoxlayiriq.
export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  await delay(700);

  const unavailableUsernames = [
    "admin",
    "testuser",
    "support",
  ];

  return !unavailableUsernames.includes(
    username.trim().toLowerCase()
  );
};

// Qeydiyyati simulyasiya edirik.
export const submitRegistration =
  async (): Promise<ApiResult> => {
    await delay(1200);

    return {
      success: true,
      message: "Your account has been created successfully!",
    };
  };
