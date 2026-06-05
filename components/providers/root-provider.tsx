"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/shared/confirm-dialog";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ConfirmProvider>
          {children}
          <Toaster />
        </ConfirmProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
