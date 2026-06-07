"use client";

import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import ErrorMessage from "@/components/shared/error-message";
import {
  GENDER_VALUES,
  MARITAL_STATUS_VALUES,
  BLOOD_TYPE_VALUES,
  EDUCATION_LEVEL_VALUES,
  MILITARY_STATUS_VALUES,
  EMPLOYMENT_TYPE_VALUES,
  CONTRACT_TYPE_VALUES,
} from "@/lib/validations/employee";

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>;
}

/**
 * Çalışan özlük (personnel-file) alanları — yeni ve düzenleme formlarında
 * paylaşılır. FieldValues üzerinden gevşek tiplenir; native-select + register
 * kullanır, böylece FormProvider gerektirmez.
 *
 * Not: alt alanlar JSX bileşeni olarak DEĞİL, düz fonksiyon olarak üretilir
 * (inline component remount → input focus kaybı sorununu önlemek için).
 */
export function OzlukFields<T extends FieldValues>({ form }: Props<T>) {
  const t = useTranslations("employees");
  const {
    register,
    formState: { errors },
  } = form;

  const fieldName = (n: string) => n as Path<T>;
  const errorFor = (n: string) => {
    const message = (errors as Record<string, { message?: unknown }>)[n]
      ?.message;
    return message ? String(message) : null;
  };

  const textField = (
    field: string,
    opts?: { type?: string; placeholder?: string; full?: boolean },
  ) => {
    const err = errorFor(field);
    return (
      <div
        key={field}
        className={opts?.full ? "md:col-span-2 space-y-2" : "space-y-2"}
      >
        <Label htmlFor={field}>{t(`ozluk.${field}`)}</Label>
        <Input
          id={field}
          type={opts?.type ?? "text"}
          placeholder={opts?.placeholder}
          {...register(fieldName(field))}
        />
        {err && <ErrorMessage>{err}</ErrorMessage>}
      </div>
    );
  };

  const textareaField = (field: string) => (
    <div key={field} className="md:col-span-2 space-y-2">
      <Label htmlFor={field}>{t(`ozluk.${field}`)}</Label>
      <Textarea id={field} rows={2} {...register(fieldName(field))} />
    </div>
  );

  const enumField = (
    field: string,
    values: readonly string[],
    optionsKey: string,
  ) => {
    const err = errorFor(field);
    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field}>{t(`ozluk.${field}`)}</Label>
        <NativeSelect
          id={field}
          className="w-full"
          {...register(fieldName(field))}
        >
          <option value="">{t("ozluk.selectPlaceholder")}</option>
          {values.map((v) => (
            <option key={v} value={v}>
              {t(`ozluk.${optionsKey}.${v}`)}
            </option>
          ))}
        </NativeSelect>
        {err && <ErrorMessage>{err}</ErrorMessage>}
      </div>
    );
  };

  const sections = [
    {
      value: "identity",
      icon: IdCard,
      title: t("ozluk.sectionIdentity"),
      desc: t("ozluk.sectionIdentityDesc"),
      fields: [
        textField("nationalId", { placeholder: "12345678901" }),
        textField("birthDate", { type: "date" }),
        textField("birthPlace"),
        enumField("gender", GENDER_VALUES, "genderOptions"),
        enumField(
          "maritalStatus",
          MARITAL_STATUS_VALUES,
          "maritalStatusOptions",
        ),
        textField("nationality", { placeholder: "TC" }),
        enumField("bloodType", BLOOD_TYPE_VALUES, "bloodTypeOptions"),
      ],
    },
    {
      value: "contact",
      icon: Phone,
      title: t("ozluk.sectionContact"),
      desc: t("ozluk.sectionContactDesc"),
      fields: [
        textField("phone", { type: "tel", placeholder: "0555 555 55 55" }),
        textField("personalEmail", { type: "email" }),
        textField("addressCity"),
        textField("addressDistrict"),
        textareaField("addressLine"),
      ],
    },
    {
      value: "emergency",
      icon: LifeBuoy,
      title: t("ozluk.sectionEmergency"),
      desc: t("ozluk.sectionEmergencyDesc"),
      fields: [
        textField("emergencyName"),
        textField("emergencyPhone", { type: "tel" }),
        textField("emergencyRelation"),
      ],
    },
    {
      value: "bank",
      icon: Landmark,
      title: t("ozluk.sectionBank"),
      desc: t("ozluk.sectionBankDesc"),
      fields: [
        textField("iban", {
          placeholder: "TR00 0000 0000 0000 0000 0000 00",
          full: true,
        }),
      ],
    },
    {
      value: "education",
      icon: GraduationCap,
      title: t("ozluk.sectionEducation"),
      desc: t("ozluk.sectionEducationDesc"),
      fields: [
        enumField(
          "educationLevel",
          EDUCATION_LEVEL_VALUES,
          "educationLevelOptions",
        ),
        enumField(
          "militaryStatus",
          MILITARY_STATUS_VALUES,
          "militaryStatusOptions",
        ),
      ],
    },
    {
      value: "employment",
      icon: Briefcase,
      title: t("ozluk.sectionEmployment"),
      desc: t("ozluk.sectionEmploymentDesc"),
      fields: [
        enumField(
          "employmentType",
          EMPLOYMENT_TYPE_VALUES,
          "employmentTypeOptions",
        ),
        enumField("contractType", CONTRACT_TYPE_VALUES, "contractTypeOptions"),
        textField("contractStart", { type: "date" }),
        textField("contractEnd", { type: "date" }),
        textField("sgkRegistrationNo"),
        textField("terminationDate", { type: "date" }),
        textareaField("terminationReason"),
      ],
    },
  ];

  return (
    <Accordion type="multiple" className="w-full  border bg-card">
      {sections.map((s) => (
        <AccordionItem
          key={s.value}
          value={s.value}
          className="last:border-b-0"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                <s.icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {s.desc}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              {s.fields}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
