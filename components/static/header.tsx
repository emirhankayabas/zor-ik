import Link from "next/link";

import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { Logo } from "@/components/shared/logo";

export default async function Header() {
  const session = await getServerAuthSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={``} className="group">
          <Logo
            size={32}
            priority
            textClassName="text-xl"
            markClassName="transition-transform group-hover:scale-105"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Özellikler
          </Link>
          <Link
            href="#solutions"
            className="hover:text-foreground transition-colors"
          >
            Çözümler
          </Link>
          <Link
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Fiyatlandırma
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {session ? (
            <Button asChild size="sm" className="gap-2">
              <Link href={`/dashboard`}>
                <LayoutDashboard className="size-4" />
                Paneli Aç
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="gap-2">
              <Link href={`/login`}>
                <LogIn className="size-4" />
                Giriş Yap
              </Link>
            </Button>
          )}
          {!session && (
            <Button asChild size="sm">
              <Link href={`/register`}>Ücretsiz Başla</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
