// src/lib/apiClient.ts
/**
 * Simple wrapper around fetch for calling the backend API.
 * Reads the base URL from the NEXT_PUBLIC_API_URL environment variable.
 * Automatically includes JSON headers and parses JSON responses.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }
  return (await response.json()) as T;
}
