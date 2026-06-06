"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Layers,
    Clock,
    Send,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import ErrorMessage from "@/components/shared/error-message";
import { toLocalDateString } from "@/lib/status-helpers";

import { getLeaveRequestSchema } from "@/lib/validations/employee";
import { useTranslations } from "next-intl";

type LeaveFormValues = z.infer<ReturnType<typeof getLeaveRequestSchema>>;

export default function EditLeavePage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = use(params);
    const router = useRouter();
    const t = useTranslations("leaves");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("validation");

    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string }[]>([]);
    const [isFetchingLeaveTypes, setIsFetchingLeaveTypes] = useState(true);

    const {
        watch,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<LeaveFormValues>({
        resolver: zodResolver(getLeaveRequestSchema(tValidation)),
    });

    const startDate = watch("startDate");
    const endDate = watch("endDate");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch leave types
                const typesRes = await fetch(apiUrl("/api/leave-types"));
                const typesData = await typesRes.json();
                setLeaveTypes(typesData);
                setIsFetchingLeaveTypes(false);

                // Fetch leave request detail
                const requestRes = await fetch(apiUrl(`/api/leave-requests/${id}`));
                if (!requestRes.ok) {
                    router.push(`/dashboard/leaves`);
                    return;
                }
                const requestData = await requestRes.json();

                if (requestData.status !== "PENDING") {
                    setError(t("onlyPendingEditable"));
                    setTimeout(() => {
                        router.push(`/dashboard/leaves`);
                    }, 3000);
                    return;
                }

                // Pre-fill form
                reset({
                    leaveTypeId: requestData.leaveTypeId,
                    startDate: toLocalDateString(new Date(requestData.startDate)),
                    endDate: toLocalDateString(new Date(requestData.endDate)),
                    reason: requestData.reason,
                });
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(t("fetchError"));
            } finally {
                setIsPageLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, reset, router, locale]);

    const onSubmit = async (data: LeaveFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(apiUrl(`/api/leave-requests/${id}`), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || t("updateError"));
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/dashboard/leaves`);
                router.refresh();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-xl mx-auto mt-20">
                <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-none rounded-2xl">
                    <CardContent className="pt-12 pb-12 text-center space-y-4">
                        <div className="size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground">
                            {t("changesSaved")}
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            {t("changesSavedDesc")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href={`/dashboard/leaves`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <CardTitle className="text-xl mb-0.5 font-medium">
                    {t("editTitle")}
                </CardTitle>
                <CardDescription>
                    {t("editSubtitle")}
                </CardDescription>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="flex items-center gap-x-4">
                        <Clock className="size-5 text-primary" />
                        <div>
                            <CardTitle>{t("leaveDetails")}</CardTitle>
                            <CardDescription>
                                {t("leaveDetailsDesc")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-6 mt-8">
                        <div className="space-y-2">
                            <Label htmlFor="leaveTypeId">{t("leaveType")} *</Label>

                            <div className="relative">
                                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                                    <Layers size="16" className="text-muted-foreground" />
                                </span>

                                <Select
                                    onValueChange={(value) => setValue("leaveTypeId", value)}
                                    disabled={isFetchingLeaveTypes || leaveTypes.length === 0}
                                    defaultValue={watch("leaveTypeId")}
                                >
                                    <SelectTrigger className="pl-8">
                                        <SelectValue placeholder={t("selectLeaveType")} />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.leaveTypeId && (
                                <ErrorMessage>{errors.leaveTypeId.message}</ErrorMessage>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">{t("startDate")} *</Label>

                                <div className="relative">
                                    <DatePicker
                                        date={startDate ? new Date(startDate) : undefined}
                                        setDate={(date) => setValue("startDate", date ? toLocalDateString(date) : "")}
                                        placeholder={t("startDate")}
                                    />
                                </div>
                                {errors.startDate && (
                                    <ErrorMessage>{errors.startDate.message}</ErrorMessage>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">{t("endDate")} *</Label>

                                <div className="relative">
                                    <DatePicker
                                        date={endDate ? new Date(endDate) : undefined}
                                        setDate={(date) => setValue("endDate", date ? toLocalDateString(date) : "")}
                                        placeholder={t("endDate")}
                                    />
                                </div>
                                {errors.endDate && (
                                    <p className="text-xs font-bold text-destructive">
                                        {errors.endDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">{t("reason")} *</Label>
                            <Textarea
                                {...register("reason")}
                                id="reason"
                                placeholder={t("reasonPlaceholder")}
                                className="min-h-30"
                            />
                            {errors.reason && (
                                <ErrorMessage>{errors.reason.message}</ErrorMessage>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>{tCommon("errorOccurred")}</AlertTitle>
                        <AlertDescription className="mt-1">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        {tCommon("cancel")}
                    </Button>
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                {tCommon("saveChanges")}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
