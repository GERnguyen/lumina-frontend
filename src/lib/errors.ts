type ApiErrorBody = {
  detail?: string;
  message?: string;
  error?: string;
  title?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: ApiErrorBody;
        status?: number;
        statusText?: string;
      };
      message?: string;
    };
    return (
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.response?.data?.title ||
      axiosError.message ||
      fallback
    );
  }

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
