"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Calendar,
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
    CardFooter,
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
import ErrorMessage from "@/components/error-message";
import { attendanceCorrectionSchema, AttendanceCorrectionInput } from "@/lib/validations/employee";

export default function NewAttendanceCorrectionPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale || "tr";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AttendanceCorrectionInput>({
        resolver: zodResolver(attendanceCorrectionSchema),
        defaultValues: {
            type: "BOTH",
        }
    });

    const correctionType = watch("type");

    const onSubmit = async (data: AttendanceCorrectionInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/attendance-corrections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(
                    result.error || "Talep oluşturulurken bir hata oluştu",
                );
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${locale}/dashboard/attendance`);
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
                            Talep Gönderildi!
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            Giriş/çıkış düzeltme talebiniz onay sürecine alındı. Yönlendiriliyorsunuz...
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
                    <Link href={`/${locale}/dashboard/attendance`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <CardTitle className="text-xl mb-0.5 font-medium">
                    Yeni Giriş/Çıkış Düzeltme Talebi
                </CardTitle>
                <CardDescription>
                    Kart okutma veya basma işlemini yapamadığınız durumlar için düzeltme talebi oluşturun.
                </CardDescription>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="flex items-center gap-x-4">
                        <UserCheck className="size-5 text-primary" />
                        <div>
                            <CardTitle>Talep Detayları</CardTitle>
                            <CardDescription>
                                Tarih, saat ve düzeltme tipini belirtin.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Düzeltme Tipi *</Label>
                                <Select
                                    defaultValue="BOTH"
                                    onValueChange={(value) => setValue("type", value as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tip Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENTRY">Sadece Giriş</SelectItem>
                                        <SelectItem value="EXIT">Sadece Çıkış</SelectItem>
                                        <SelectItem value="BOTH">Giriş ve Çıkış</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <ErrorMessage>{errors.type.message}</ErrorMessage>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Tarih *</Label>
                                <div className="relative">
                                    <DatePicker
                                        date={watch("date") ? new Date(watch("date")) : undefined}
                                        setDate={(date) => setValue("date", date ? date.toISOString().split("T")[0] : "")}
                                        placeholder="Seçiniz"
                                    />
                                </div>
                                {errors.date && (
                                    <ErrorMessage>{errors.date.message}</ErrorMessage>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(correctionType === "ENTRY" || correctionType === "BOTH") && (
                                <div className="space-y-2">
                                    <Label htmlFor="entryTime">Giriş Saati *</Label>
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
                                    <Label htmlFor="exitTime">Çıkış Saati *</Label>
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
                            <Label htmlFor="reason">Talep Gerekçesi *</Label>
                            <Textarea
                                {...register("reason")}
                                id="reason"
                                placeholder="Örn: Kartımı evde unutmam sebebiyle giriş yapamadım..."
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
                        <AlertTitle>Hata Oluştu</AlertTitle>
                        <AlertDescription className="mt-1">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Vazgeç
                    </Button>
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Talebi Gönder
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
