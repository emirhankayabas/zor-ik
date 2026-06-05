import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel" };

export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
