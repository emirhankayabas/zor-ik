"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Loader2,
  Eye,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const RESOURCES = [
  { key: "employees", labelKey: "employees" },
  { key: "departments", labelKey: "departments" },
  { key: "salary", labelKey: "salary" },
  { key: "payroll", labelKey: "payroll" },
  { key: "reports", labelKey: "reports" },
  { key: "pdks", labelKey: "pdks" },
  { key: "settings", labelKey: "settings" },
  { key: "leave_approvals", labelKey: "leaveApprovals" },
  { key: "attendance_approvals", labelKey: "attendanceApprovals" },
];

const ROLES = [
  { key: "COMPANY_ADMIN", labelKey: "companyAdmin" },
  { key: "MANAGER", labelKey: "departmentManager" },
  { key: "EMPLOYEE", labelKey: "standardEmployee" },
] as const;

interface Permission {
  id: string;
  role: string;
  resource: string;
  canView: boolean;
  canEdit: boolean;
}

export default function PermissionsPage() {
  const t = useTranslations("permissions");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/permissions"));
      if (response.ok) {
        setPermissions(await response.json());
      }
    } catch (error) {
      console.error(t("loadError") || "Failed to fetch permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const getPermission = (role: string, resource: string) => {
    return permissions.find(
      (p) => p.role === role && p.resource === resource,
    );
  };

  const togglePermission = async (
    role: string,
    resource: string,
    field: "canView" | "canEdit",
    currentValue: boolean,
  ) => {
    const key = `${role}-${resource}-${field}`;
    setUpdating(key);

    const existing = getPermission(role, resource);
    const newData = {
      role,
      resource,
      canView: existing?.canView ?? false,
      canEdit: existing?.canEdit ?? false,
      [field]: !currentValue,
    };

    // If disabling view, also disable edit
    if (field === "canView" && currentValue) {
      newData.canEdit = false;
    }
    // If enabling edit, also enable view
    if (field === "canEdit" && !currentValue) {
      newData.canView = true;
    }

    try {
      const response = await fetch(apiUrl("/api/permissions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        await fetchPermissions();
      } else {
        toast.error(t("updateFailed"));
      }
    } catch {
      toast.error(tCommon("errorOccurred"));
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div>
        <CardTitle className="text-xl mb-0.5 font-medium flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </div>

      <Tabs defaultValue="COMPANY_ADMIN">
        <TabsList className="mb-6 bg-muted/50">
          {ROLES.map((role) => (
            <TabsTrigger key={role.key} value={role.key} className="px-6">
              {tRoles(role.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {ROLES.map((role) => (
          <TabsContent key={role.key} value={role.key}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("rolePermissions", { role: tRoles(role.labelKey) }) || `${tRoles(role.labelKey)} ${t("permissions")}`}
                </CardTitle>
                <CardDescription>
                  {t("configureDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">{t("module")}</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="size-3" /> {t("view")}
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Pencil className="size-3" /> {t("editing")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RESOURCES.map((resource) => {
                      const perm = getPermission(role.key, resource.key);
                      const canView = perm?.canView ?? false;
                      const canEdit = perm?.canEdit ?? false;

                      return (
                        <TableRow key={resource.key}>
                          <TableCell className="font-medium">
                            {t(`resources.${resource.labelKey}`)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={canView}
                                disabled={
                                  updating ===
                                  `${role.key}-${resource.key}-canView`
                                }
                                onCheckedChange={() =>
                                  togglePermission(
                                    role.key,
                                    resource.key,
                                    "canView",
                                    canView,
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={canEdit}
                                disabled={
                                  updating ===
                                  `${role.key}-${resource.key}-canEdit`
                                }
                                onCheckedChange={() =>
                                  togglePermission(
                                    role.key,
                                    resource.key,
                                    "canEdit",
                                    canEdit,
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
