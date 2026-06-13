"use client";

import { createQueryClient } from "@/lib/query-client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { useState, type ReactNode } from "react";

const theme = createTheme({
  cssVariables: true,
});

function HydrateAtoms({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: ReturnType<typeof createQueryClient>;
}) {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            <HydrateAtoms queryClient={queryClient}>{children}</HydrateAtoms>
          </JotaiProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
