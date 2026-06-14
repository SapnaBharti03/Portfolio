import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHomeData, type HomeData } from "@/lib/api";

type PortfolioContextValue = {
  data: HomeData | null;
  loading: boolean;
  error: Error | null;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <PortfolioContext.Provider
      value={{
        data: query.data ?? null,
        loading: query.isLoading,
        error: (query.error as Error | null) ?? null,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  return useContext(PortfolioContext);
}
