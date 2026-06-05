"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { UserCircle } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Props {
  form: UseFormReturn<any>;
  departments: any[];
}

export function ProfileFields({ form, departments }: Props) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <UserCircle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{t("profileAndTask")}</CardTitle>
            <CardDescription>{t("profileAndTaskDesc")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>{t("fullName")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("positionTitle")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("department")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDepartmentPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{tCommon("unassigned")}</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("systemRole")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectRolePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">{tRoles("employeeStandard")}</SelectItem>
                    <SelectItem value="MANAGER">{tRoles("unitManager")}</SelectItem>
                    <SelectItem value="COMPANY_ADMIN">{tRoles("hrManager")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("newPassword")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder={t("newPasswordPlaceholder")}
                  />
                </FormControl>
                <FormDescription className="text-xs ml-2">
                  {t("currentPasswordKeep")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
