import type { Metadata } from "next";
import RegisterForm from "@/app/(auth)/register/_components/register-form";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default async function RegisterPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect(`/dashboard`);
  }

  return <RegisterForm />;
}
