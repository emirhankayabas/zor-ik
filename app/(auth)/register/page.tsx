import RegisterForm from "@/app/(auth)/register/_components/register-form";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}
export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerAuthSession();

  if (session) {
    redirect(`/dashboard`);
  }

  return <RegisterForm locale={locale} />;
}
