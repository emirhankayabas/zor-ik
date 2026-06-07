"use client";

import { useTranslations } from "next-intl";
import {
  IdCard,
  Phone,
  LifeBuoy,
  Landmark,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDateLocale } from "@/lib/status-helpers";

/** Serializable özlük data passed from server components (dates as ISO strings). */
export type OzlukData = Partial<Record<string, string | null>>;

type FieldKind = "text" | "date" | "enum";
interface FieldDef {
  key: string;
  kind: FieldKind;
  optionsKey?: string; // for enum
}

const SECTIONS: {
  value: string;
  icon: typeof IdCard;
  fields: FieldDef[];
}[] = [
  {
    value: "identity",
    icon: IdCard,
    fields: [
      { key: "nationalId", kind: "text" },
      { key: "birthDate", kind: "date" },
      { key: "birthPlace", kind: "text" },
      { key: "gender", kind: "enum", optionsKey: "genderOptions" },
      {
        key: "maritalStatus",
        kind: "enum",
        optionsKey: "maritalStatusOptions",
      },
      { key: "nationality", kind: "text" },
      { key: "bloodType", kind: "enum", optionsKey: "bloodTypeOptions" },
    ],
  },
  {
    value: "contact",
    icon: Phone,
    fields: [
      { key: "phone", kind: "text" },
      { key: "personalEmail", kind: "text" },
      { key: "addressCity", kind: "text" },
      { key: "addressDistrict", kind: "text" },
      { key: "addressLine", kind: "text" },
    ],
  },
  {
    value: "emergency",
    icon: LifeBuoy,
    fields: [
      { key: "emergencyName", kind: "text" },
      { key: "emergencyPhone", kind: "text" },
      { key: "emergencyRelation", kind: "text" },
    ],
  },
  {
    value: "bank",
    icon: Landmark,
    fields: [{ key: "iban", kind: "text" }],
  },
  {
    value: "education",
    icon: GraduationCap,
    fields: [
      {
        key: "educationLevel",
        kind: "enum",
        optionsKey: "educationLevelOptions",
      },
      {
        key: "militaryStatus",
        kind: "enum",
        optionsKey: "militaryStatusOptions",
      },
    ],
  },
  {
    value: "employment",
    icon: Briefcase,
    fields: [
      {
        key: "employmentType",
        kind: "enum",
        optionsKey: "employmentTypeOptions",
      },
      { key: "contractType", kind: "enum", optionsKey: "contractTypeOptions" },
      { key: "contractStart", kind: "date" },
      { key: "contractEnd", kind: "date" },
      { key: "sgkRegistrationNo", kind: "text" },
      { key: "terminationDate", kind: "date" },
      { key: "terminationReason", kind: "text" },
    ],
  },
];

interface Props {
  data: OzlukData;
  locale: string;
  /** Only render sections that contain at least one value (default true). */
  hideEmptySections?: boolean;
}

export function OzlukDisplay({
  data,
  locale,
  hideEmptySections = true,
}: Props) {
  const t = useTranslations("employees");

  const isEmpty = (v: string | null | undefined) =>
    v === null || v === undefined || v === "";

  const renderValue = (f: FieldDef): string => {
    const raw = data[f.key];
    if (isEmpty(raw)) return "—";
    if (f.kind === "date") return formatDateLocale(raw as string, locale);
    if (f.kind === "enum" && f.optionsKey)
      return t(`ozluk.${f.optionsKey}.${raw}`);
    return raw as string;
  };

  const sections = SECTIONS.filter(
    (s) => !hideEmptySections || s.fields.some((f) => !isEmpty(data[f.key])),
  );

  if (sections.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((s) => (
        <Card key={s.value}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                <s.icon className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t(`ozluk.section${cap(s.value)}`)}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(`ozluk.section${cap(s.value)}Desc`)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4">
            {s.fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] text-muted-foreground">
                  {t(`ozluk.${f.key}`)}
                </span>
                <span className="text-sm font-medium wrap-break-word">
                  {renderValue(f)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
