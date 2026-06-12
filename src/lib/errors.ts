type ApiErrorBody = {
  detail?: string;
  message?: string;
  error?: string;
  title?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "body" in error) {
    const apiError = error as { body?: ApiErrorBody; message?: string };
    return (
      apiError.body?.detail ||
      apiError.body?.message ||
      apiError.body?.error ||
      apiError.body?.title ||
      apiError.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
