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
