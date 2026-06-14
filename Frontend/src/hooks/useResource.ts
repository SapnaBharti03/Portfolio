import { useQuery } from "@tanstack/react-query";
import { fetchResource, HOME_RESOURCE_KEYS } from "@/lib/api";
import { usePortfolioContext } from "@/contexts/PortfolioContext";

export function useResource<T>(resource: string) {
  const portfolio = usePortfolioContext();
  const homeKey = HOME_RESOURCE_KEYS[resource];

  const query = useQuery({
    queryKey: ["resource", resource],
    queryFn: () => fetchResource<T>(resource),
    staleTime: 5 * 60 * 1000,
    enabled: !portfolio || !homeKey,
  });

  if (portfolio && homeKey) {
    return {
      data: (portfolio.data?.[homeKey] ?? null) as T | null,
      loading: portfolio.loading,
      error: portfolio.error,
    };
  }

  return {
    data: (query.data ?? null) as T | null,
    loading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
}
