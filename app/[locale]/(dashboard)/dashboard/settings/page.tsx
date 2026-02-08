import { getServerAuthSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Bell, Palette, Building, Mail } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerAuthSession();

  if (!session) return null;

  return (
    <div className="flex flex-col gap-12 max-w-4xl px-4 pb-12">
      <div className="space-y-1">
        <CardTitle>Ayarlar</CardTitle>
        <CardDescription>
          Sistem tercihlerini ve hesap ayarlarını buradan yönetebilirsiniz.
        </CardDescription>
      </div>

      <div className="grid space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Palette className="size-4" />
              </div>
              <div>
                <CardTitle>Görünüm</CardTitle>
                <CardDescription>
                  Uygulamanın nasıl görüneceğini özelleştirin.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between mt-4 pb-4">
            <div className="space-y-1">
              <p className="text-sm font-bold">Tema Modu</p>
              <p className="text-xs text-muted-foreground font-medium opacity-70">
                Sistem genelinde koyu veya açık tema kullanımını belirleyin.
              </p>
            </div>

            <ModeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <User className="size-4" />
              </div>
              <div>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi ve profil fotoğrafınızı güncelleyin.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="companyName">Ad Soyad</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <User size="16" className="text-muted-foreground" />
                  </span>
                  <p className="text-sm border rounded-xl p-2 pl-8 bg-muted/20 border-border/40">
                    {session.user.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">E-posta Adresi</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Mail size="16" className="text-muted-foreground" />
                  </span>
                  <p className="text-sm border rounded-xl p-2 pl-8 bg-muted/20 border-border/40">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 pb-3">
              <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                <Shield className="size-4" />
              </div>
              <div>
                <CardTitle>Güvenlik</CardTitle>
                <CardDescription>
                  Şifre ve iki faktörlü doğrulama ayarları (Yakında).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 pb-3">
              <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                <Bell className="size-4" />
              </div>
              <div>
                <CardTitle>Bildirimler</CardTitle>
                <CardDescription>
                  E-posta ve sistem bildirimlerini yönetin (Yakında).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
