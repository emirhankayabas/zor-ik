"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
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

const features = [
  {
    icon: Users,
    title: "Gelişmiş Çalışan Yönetimi",
    desc: "Çalışanlarınızın özlük bilgilerini, sözleşmelerini ve kariyer geçmişini güvenli bir merkezde toplayın.",
  },
  {
    icon: Calendar,
    title: "Akıllı İzin Takibi",
    desc: "İzin taleplerini otomatik çakışma kontrolü ve iki kademeli onay akışıyla yönetin.",
  },
  {
    icon: BarChart3,
    title: "Derinlemesine Analitik",
    desc: "Şirketinizin demografik yapısını, izin trendlerini ve İK maliyetlerini görsel raporlarla izleyin.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli ve Uyumlu",
    desc: "KVKK uyumlu altyapı ve rol bazlı yetkilendirme ile verileriniz her zaman güvende.",
  },
  {
    icon: Globe,
    title: "Çoklu Dil Desteği",
    desc: "Global ekipleriniz için Türkçe ve İngilizce dil seçenekleriyle kusursuz kullanım.",
  },
  {
    icon: Zap,
    title: "Hızlı Entegrasyon",
    desc: "Mevcut verilerinizi kolayca içe aktarın ve aynı gün içinde çalışmaya başlayın.",
  },
];

const stats = [
  { value: "500+", label: "Aktif Şirket" },
  { value: "10K+", label: "Çalışan" },
  { value: "50K+", label: "İzin Talebi" },
  { value: "%99.9", label: "Çalışma Süresi" },
];

export default function HomeContent() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28">
        {/* Decorative background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            {/* Logo mark with glow */}
            <div className="relative mx-auto flex w-fit items-center justify-center animate-in fade-in zoom-in-50 duration-700">
              <div className="absolute size-28 rounded-full bg-primary/20 blur-2xl" />
              <Logo
                size={84}
                showText={false}
                priority
                markClassName="relative drop-shadow-xl"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-sm font-medium text-primary backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Zap className="size-4 fill-current" />
              <span>Yeni Nesil İK Yönetim Platformu</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-7xl">
              İşinizi Zorluklardan <br />
              <span className="bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Arındıran İK
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Zor İK ile çalışan yönetimi, izin takibi, bordro ve raporlama
              süreçlerinizi tek bir merkezden, saniyeler içinde yönetin.
              Karmaşıklığa son verin.
            </p>

            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link href={`/register`}>
                  Ücretsiz Deneyin
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-8 text-sm font-medium text-muted-foreground">
              {[
                "Kredi kartı gerekmez",
                "Sınırsız kullanıcı",
                "7/24 Teknik destek",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-background px-6 py-8 text-center"
              >
                <div className="text-3xl font-extrabold text-foreground md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y bg-muted/50 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Eksiksiz İK Deneyimi
            </h2>
            <p className="text-lg text-muted-foreground">
              İşletmenizin büyümesine odaklanmanız için tüm operasyonel yükü biz
              üstleniyoruz.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute left-1/2 top-1/2 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl bg-primary p-12 text-center text-primary-foreground md:p-20">
            <div className="absolute right-0 top-0 -mr-32 -mt-32 size-64 rounded-full bg-white/5" />
            <div className="absolute bottom-0 left-0 -mb-32 -ml-32 size-64 rounded-full bg-black/10" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Şirketinizi Geleceğe Hazırlayın
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
                Zor İK ile tanışan binlerce şirketten biri olun. Hemen ücretsiz
                hesabınızı oluşturun ve İK yönetiminin tadını çıkarın.
              </p>
              <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register">Şimdi Başla</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Link href="/login">Bize Ulaşın</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
