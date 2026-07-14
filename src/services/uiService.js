const BASE_URL = "http://127.0.0.1:8000/api";

export async function getLogo() {
  const response = await fetch(`${BASE_URL}/automation/ui-logo`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Logo");
  }

  const result = await response.json();
  return result?.logo ?? null;
}
