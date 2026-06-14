import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function persistReorder(
  resource: string,
  rows: { id: number | string }[],
  token: string,
) {
  const res = await fetch(`${BASE_URL}/api/reorder/${resource}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: rows.map((row) => String(row.id)) }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody as { error?: string }).error ?? "Failed to save order");
  }
}

export function useCrudReorder<T extends { id: number | string }>(
  resource: string,
  items: T[],
  setItems: (items: T[]) => void,
  token?: string | null,
) {
  return async (nextRows: T[]) => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    const previous = items;
    setItems(nextRows);
    try {
      await persistReorder(resource, nextRows, token);
    } catch (error: unknown) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Could not save order");
    }
  };
}
