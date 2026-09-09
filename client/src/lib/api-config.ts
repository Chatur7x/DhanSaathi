import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 10000,
      retry: 2,
    },
  },
});

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";
// Day-2 market-data service (cache + retry + per-ticker scheduler).
// Live-markets page uses this first, falling back to API_URL/WS_URL.
export const MARKET_URL = process.env.NEXT_PUBLIC_MARKET_URL || "http://localhost:5001";
