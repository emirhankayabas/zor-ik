"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Mail,
  Clock,
  Save,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const TIMEZONES = [
  { value: "Europe/Istanbul" },
  { value: "Europe/Berlin" },
  { value: "Europe/London" },
  { value: "Europe/Paris" },
  { value: "Europe/Moscow" },
  { value: "America/New_York" },
  { value: "America/Chicago" },
  { value: "America/Denver" },
  { value: "America/Los_Angeles" },
  { value: "Asia/Dubai" },
  { value: "Asia/Tokyo" },
  { value: "Asia/Shanghai" },
  { value: "Australia/Sydney" },
];

const COUNTRIES = [
  { value: "TR" },
  { value: "DE" },
  { value: "US" },
  { value: "GB" },
  { value: "FR" },
  { value: "AE" },
  { value: "RU" },
  { value: "JP" },
  { value: "CN" },
  { value: "AU" },
  { value: "NL" },
  { value: "SA" },
];

interface CompanySettings {
  id: string;
  name: string;
  domain: string | null;
  emailDomain: string | null;
  timezone: string;
  locale: string;
  country: string;
  plan: string;
}

export default function CompanySettingsPage() {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [country, setCountry] = useState("TR");

  const isAdmin =
    session?.user?.role === "COMPANY_ADMIN" ||
    session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      fetch(apiUrl("/api/company-settings"))
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setSettings(data);
            setName(data.name || "");
            setEmailDomain(data.emailDomain || "");
            setTimezone(data.timezone || "Europe/Istanbul");
            setCountry(data.country || "TR");
          }
        })
        .catch(() => toast.error(t("loadError")))
        .finally(() => setIsLoading(false));
    }
  }, [status, isAdmin, router, t]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(apiUrl("/api/company-settings"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailDomain, timezone, country }),
      });

      if (response.ok) {
        toast.success(t("updateSuccess"));
        const updated = await response.json();
        setSettings(updated);
      } else {
        const err = await response.json();
        toast.error(err.error || t("updateFailed"));
      }
    } catch {
      toast.error(tCommon("errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pb-12">
      <div className="space-y-1">
        <CardTitle className="text-xl mb-0.5 font-medium">
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </div>

      {/* Şirket Bilgileri */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {t("companyInfo")}
              </CardTitle>
              <CardDescription>
                {t("companyInfoDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("companyName")}</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Building2 size="16" className="text-muted-foreground" />
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("companyName")}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("emailDomain")}</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Mail size="16" className="text-muted-foreground" />
                </span>
                <Input
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="@sirket.com.tr"
                  className="pl-8"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t("emailDomainHint")}
              </p>
            </div>

            {settings?.domain && (
              <div className="space-y-2">
                <Label>Domain</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Globe size="16" className="text-muted-foreground" />
                  </span>
                  <p className="text-sm border rounded-md p-2 pl-8 bg-muted/20 border-border/40">
                    {settings.domain}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("plan")}</Label>
              <p className="text-sm border rounded-md p-2 bg-muted/20 border-border/40 capitalize">
                {settings?.plan || "free"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bölgesel Ayarlar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Globe className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {t("regionalSettings")}
              </CardTitle>
              <CardDescription>
                {t("regionalSettingsDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="size-3 text-muted-foreground" />
                {t("country")}
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(`countries.${c.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-3 text-muted-foreground" />
                {t("timezone")}
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectTimezone")} />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {t(`timezones.${tz.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Save className="size-4 mr-2" />
          )}
          {t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
