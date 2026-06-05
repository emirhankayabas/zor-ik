"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomeContent() {
  return (
    <div className="flex flex-col">
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Zap className="size-4 fill-current" />
              <span>Yeni Nesil İK Yönetim Platformu</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              İşinizi Zorluklardan <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
                Arındıran İK
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Zor İK ile çalışan yönetimi, izin takibi ve raporlama
              süreçlerinizi tek bir merkezden, saniyeler içinde yönetin.
              Karmaşıklığa son verin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button asChild size="lg">
                <Link href={`/register`}>
                  Ücretsiz Deneyin
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Kredi kartı gerekmez
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Sınırsız kullanıcı
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                7/24 Teknik destek
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Eksiksiz İK Deneyimi
            </h2>
            <p className="text-muted-foreground text-lg">
              İşletmenizin büyümesine odaklanmanız için tüm operasyonel yükü biz
              üstleniyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Users className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Gelişmiş Çalışan Yönetimi
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Çalışanlarınızın tüm bilgilerini, belgelerini ve kariyer
                geçmişini güvenli bir merkezde toplayın.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Calendar className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">Akıllı İzin Takibi</h3>
              <p className="text-muted-foreground leading-relaxed">
                İzin taleplerini otomatik çakışma kontrolü ile yönetin.
                Ekibinizin uygunluk durumunu anlık görün.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <BarChart3 className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">Derinlemesine Analitik</h3>
              <p className="text-muted-foreground leading-relaxed">
                Şirketinizin demografik yapısını, izin trendlerini ve İK
                maliyetlerini görselleştirilmiş raporlarla izleyin.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <ShieldCheck className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">Güvenli ve Uyumlu</h3>
              <p className="text-muted-foreground leading-relaxed">
                KVKK uyumlu altyapı ve gelişmiş yetkilendirme sistemi ile
                verileriniz her zaman güvende.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Globe className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">Çoklu Dil Desteği</h3>
              <p className="text-muted-foreground leading-relaxed">
                Global ekipleriniz için Türkçe ve İngilizce dil seçenekleriyle
                kusursuz kullanım sağlayın.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative p-8 bg-background border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Zap className="size-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hızlı Entegrasyon</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mevcut verilerinizi kolayca içe aktarın ve aynı gün içinde
                çalışmaya başlayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground  p-12 md:p-20 text-center space-y-4 rounded-4xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32" />

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight relative z-10">
              Şirketinizi Geleceğe Hazırlayın
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto relative z-10">
              Zor İK ile tanışan binlerce şirketten biri olun. Hemen ücretsiz
              hesabınızı oluşturun ve İK yönetiminin tadını çıkarın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Şimdi Başla</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Bize Ulaşın</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
