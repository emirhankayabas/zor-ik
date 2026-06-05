"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Clock,
    Send,
    UserCheck,
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
import { Input } from "@/components/ui/input";
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
import { getAttendanceCorrectionSchema, AttendanceCorrectionInput } from "@/lib/validations/employee";
import { toLocalDateString } from "@/lib/status-helpers";
import { useTranslations } from "next-intl";

export default function NewAttendanceCorrectionPage() {
    const t = useTranslations("attendance");
    const tCommon = useTranslations("common");
    const tValidation = useTranslations("validation");
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AttendanceCorrectionInput>({
        resolver: zodResolver(getAttendanceCorrectionSchema(tValidation)),
        defaultValues: {
            type: "BOTH",
        }
    });

    const correctionType = watch("type");

    // Fetch employee's working days
    useEffect(() => {
        fetch(apiUrl("/api/employees/me"))
            .then((r) => (r.ok ? r.json() : null))
            .then((emp) => {
                if (emp?.workingDays && Array.isArray(emp.workingDays)) {
                    setWorkingDays(emp.workingDays);
                }
            })
            .catch(() => {});
    }, []);

    // Disable non-working days in the date picker
    // JS Date.getDay(): 0=Sunday, 1=Monday, ... 6=Saturday
    const isDisabledDay = useCallback(
        (date: Date) => {
            const dayOfWeek = date.getDay();
            return !workingDays.includes(dayOfWeek);
        },
        [workingDays],
    );

    const onSubmit = async (data: AttendanceCorrectionInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(apiUrl("/api/attendance-corrections"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(
                    result.error || t("createError"),
                );
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/attendance");
                router.refresh();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-xl mx-auto mt-20">
                <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-none rounded-2xl">
                    <CardContent className="pt-12 pb-12 text-center space-y-4">
                        <div className="size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground">
                            {t("requestSent")}
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            {t("requestSentDesc")}
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
                    <Link href="/dashboard/attendance">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <CardTitle className="text-xl mb-0.5 font-medium">
                    {t("newTitle")}
                </CardTitle>
                <CardDescription>
                    {t("newSubtitle")}
                </CardDescription>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="flex items-center gap-x-4">
                        <UserCheck className="size-5 text-primary" />
                        <div>
                            <CardTitle>{t("requestDetails")}</CardTitle>
                            <CardDescription>
                                {t("requestDetailsDesc")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">{t("correctionType")} *</Label>
                                <Select
                                    defaultValue="BOTH"
                                    onValueChange={(value) => setValue("type", value as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("selectType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENTRY">{t("entryOnly")}</SelectItem>
                                        <SelectItem value="EXIT">{t("exitOnly")}</SelectItem>
                                        <SelectItem value="BOTH">{t("entryAndExit")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <ErrorMessage>{errors.type.message}</ErrorMessage>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">{tCommon("date")} *</Label>
                                <div className="relative">
                                    <DatePicker
                                        date={watch("date") ? new Date(watch("date")) : undefined}
                                        setDate={(date) => setValue("date", date ? toLocalDateString(date) : "")}
                                        placeholder={tCommon("selectDate")}
                                        disabledDays={isDisabledDay}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    {t("workingDaysOnly")}
                                </p>
                                {errors.date && (
                                    <ErrorMessage>{errors.date.message}</ErrorMessage>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(correctionType === "ENTRY" || correctionType === "BOTH") && (
                                <div className="space-y-2">
                                    <Label htmlFor="entryTime">{t("entryTime")} *</Label>
                                    <div className="relative">
                                        <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0 text-muted-foreground">
                                            <Clock size="16" />
                                        </span>
                                        <Input
                                            {...register("entryTime")}
                                            id="entryTime"
                                            type="time"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.entryTime && (
                                        <ErrorMessage>{errors.entryTime.message}</ErrorMessage>
                                    )}
                                </div>
                            )}

                            {(correctionType === "EXIT" || correctionType === "BOTH") && (
                                <div className="space-y-2">
                                    <Label htmlFor="exitTime">{t("exitTime")} *</Label>
                                    <div className="relative">
                                        <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0 text-muted-foreground">
                                            <Clock size="16" />
                                        </span>
                                        <Input
                                            {...register("exitTime")}
                                            id="exitTime"
                                            type="time"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.exitTime && (
                                        <ErrorMessage>{errors.exitTime.message}</ErrorMessage>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">{tCommon("reason")} *</Label>
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
                                {t("sendRequest")}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
