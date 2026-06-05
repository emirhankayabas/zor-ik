import type { Metadata } from "next";

export const metadata: Metadata = { title: "Departmanlar" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
