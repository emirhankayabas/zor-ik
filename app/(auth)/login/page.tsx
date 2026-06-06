import type { Metadata } from "next";
import LoginForm from "@/app/(auth)/login/_components/login-form";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect(`/dashboard`);
  }

  return <LoginForm />;
}
