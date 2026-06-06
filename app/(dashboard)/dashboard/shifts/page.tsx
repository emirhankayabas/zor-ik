"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Clock,
  Plus,
  Users,
  Coffee,
  Star,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { getShiftSchema } from "@/lib/validations/employee";
import { useTranslations } from "next-intl";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ErrorMessage from "@/components/shared/error-message";



type ShiftFormValues = z.infer<ReturnType<typeof getShiftSchema>>;

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isDefault: boolean;
  _count: { employees: number };
}

export default function ShiftsPage() {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tv = useTranslations("validation");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(getShiftSchema(tv)),
    defaultValues: {
      breakMinutes: 60,
      isDefault: false,
    },
  });

  const fetchShifts = async () => {
    try {
      const response = await fetch(apiUrl("/api/shifts"));
      if (response.ok) {
        setShifts(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openCreateDialog = () => {
    setEditingShift(null);
    reset({ name: "", startTime: "", endTime: "", breakMinutes: 60, isDefault: false });
    setDialogOpen(true);
  };

  const openEditDialog = (shift: Shift) => {
    setEditingShift(shift);
    reset({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes,
      isDefault: shift.isDefault,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ShiftFormValues) => {
    setIsSubmitting(true);
    try {
      const isEdit = !!editingShift;
      const url = isEdit ? `/api/shifts/${editingShift.id}` : "/api/shifts";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(isEdit ? t("updated") : t("created"));
        setDialogOpen(false);
        setEditingShift(null);
        reset();
        await fetchShifts();
      } else {
        const err = await response.json();
        toast.error(err.error || tCommon("errorOccurred"));
      }
    } catch {
      toast.error(tCommon("errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/shifts/${deleteId}`), { method: "DELETE" });
      if (response.ok) {
        toast.success(t("deleted"));
        await fetchShifts();
      } else {
        const err = await response.json();
        toast.error(err.error || t("deleteError"));
      }
    } catch {
      toast.error(tCommon("errorOccurred"));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" /> {t("newShift")}
        </Button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingShift(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift ? t("editShift") : t("createShift")}
            </DialogTitle>
            <DialogDescription>
              {t("dialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>{t("shiftName")}</Label>
              <Input {...register("name")} placeholder={t("shiftNamePlaceholder") || "Örn: Gündüz"} />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("startTime")}</Label>
                <Input
                  type="time"
                  {...register("startTime")}
                  className="[&::-webkit-calendar-picker-indicator]:opacity-50"
                />
                {errors.startTime && (
                  <ErrorMessage>{errors.startTime.message}</ErrorMessage>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("endTime")}</Label>
                <Input
                  type="time"
                  {...register("endTime")}
                  className="[&::-webkit-calendar-picker-indicator]:opacity-50"
                />
                {errors.endTime && (
                  <ErrorMessage>{errors.endTime.message}</ErrorMessage>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("breakMinutes")}</Label>
              <Input
                {...register("breakMinutes", { valueAsNumber: true })}
                type="number"
                placeholder="60"
              />
              {errors.breakMinutes && (
                <ErrorMessage>{errors.breakMinutes.message}</ErrorMessage>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("isDefault")}
                onCheckedChange={(v) => setValue("isDefault", v)}
              />
              <Label>{t("defaultShift")}</Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              {editingShift ? tCommon("update") : tCommon("save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("deleting") : t("deleteShift")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {shifts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <Clock className="size-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">{t("noShifts")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("noShiftsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shifts.map((shift) => (
            <Card key={shift.id}>
              <CardHeader className="flex items-center justify-between">
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Clock className="size-4" />
                    </div>
                    <CardTitle>{shift.name}</CardTitle>
                    {shift.isDefault && (
                      <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                        <Star className="size-3 mr-1" />
                        {tCommon("default")}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(shift)}>
                      {tCommon("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteId(shift.id)}>
                      {t("deleteShift")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("workHours")}</span>
                    <span className="font-mono font-bold">
                      {shift.startTime} — {shift.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Coffee className="size-3" /> {t("break")}
                    </span>
                    <span className="font-medium">{shift.breakMinutes} {t("minutes")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3" /> {t("assigned")}
                    </span>
                    <Badge variant="secondary">{t("personCount", { count: shift._count.employees })}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
