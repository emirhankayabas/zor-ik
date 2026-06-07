import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: {
    template: "%s · Zor İK",
    default: "Zor İK — İK Yönetim Sistemi",
  },
  description:
    "Türk iş hukukuna uygun çok kiracılı İK platformu: çalışan, izin, bordro, PDKS ve onay yönetimi.",
  applicationName: "Zor İK",
  icons: { icon: "/logo-mark.png", shortcut: "/logo-mark.png", apple: "/logo-mark.png" },
};

interface Props {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <RootProvider>{children}</RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
