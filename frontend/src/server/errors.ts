// Reads a readable error message from a failed API response.
// The backend sends {"error": "..."}, DRF sends {"detail": "..."} and
// serializer validation errors look like {"field": ["message", ...]}.
export async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.error === "string") return data.error;
    if (typeof data?.detail === "string") return data.detail;

    if (data && typeof data === "object") {
      const [field, messages] = Object.entries(data)[0] ?? [];
      if (Array.isArray(messages) && typeof messages[0] === "string") {
        return `${field.replace(/_/g, " ")}: ${messages[0]}`;
      }
    }
  } catch {
    // The body wasn't JSON, so fall back to the generic message.
  }

  return fallback;
}
