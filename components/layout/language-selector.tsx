"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const LOCALES = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
];

export function LanguageSelector() {
  const t = useTranslations("settings");
  const [locale, setLocale] = useState("tr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // İlk mount'ta istemci tarafı dil tercihini okur (SSR/hydration güvenli).
    // set-state-in-effect kuralı mount-guard pattern'inde kaçınılmazdır.
    const saved = localStorage.getItem("preferred-locale") || "tr";
    /* eslint-disable react-hooks/set-state-in-effect */
    setLocale(saved);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleChange = (value: string) => {
    setLocale(value);
    localStorage.setItem("preferred-locale", value);
    document.cookie = `preferred-locale=${value};path=/;max-age=31536000`;
    toast.success(t("languageUpdated"));
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="space-y-1">
        <p className="text-sm font-bold">{t("language")}</p>
        <p className="text-xs text-muted-foreground font-medium opacity-70">
          {t("languageDesc")}
        </p>
      </div>
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
