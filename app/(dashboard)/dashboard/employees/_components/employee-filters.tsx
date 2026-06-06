"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Building, Briefcase, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Department {
    id: string;
    name: string;
}

interface EmployeeFiltersProps {
    departments: Department[];
    roles: string[];
}

export function EmployeeFilters({ departments, roles }: EmployeeFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [departmentId, setDepartmentId] = useState(searchParams.get("dept") || "all");
    const [role, setRole] = useState(searchParams.get("role") || "all");

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());

            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === "all") {
                    newSearchParams.delete(key);
                } else {
                    newSearchParams.set(key, value);
                }
            }

            return newSearchParams.toString();
        },
        [searchParams]
    );

    // URL (searchParams) dış kaynağıyla senkronizasyon — ör. geri/ileri navigasyonu.
    // set-state-in-effect: dış sistemle senkron bilinçli; kural devre dışı.
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setSearch(searchParams.get("q") || "");
        setDepartmentId(searchParams.get("dept") || "all");
        setRole(searchParams.get("role") || "all");
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [searchParams]);

    // Debounced search update
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentQ = searchParams.get("q") || "";
            if (search !== currentQ) {
                const query = createQueryString({ q: search || null });
                router.push(`${pathname}?${query}`);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search, pathname, router, createQueryString, searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        if (key === "dept") setDepartmentId(value);
        if (key === "role") setRole(value);

        const query = createQueryString({ [key]: value });
        router.push(`${pathname}?${query}`);
    };

    const clearFilters = () => {
        setSearch("");
        setDepartmentId("all");
        setRole("all");
        router.push(pathname);
    };

    const hasActiveFilters = search || departmentId !== "all" || role !== "all";

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0 pointer-events-none">
                    <Search size="16" className="text-muted-foreground" />
                </span>
                <Input
                    type="text"
                    placeholder="İsim veya e-posta ile ara..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                <Select
                    value={departmentId}
                    onValueChange={(val) => handleFilterChange("dept", val)}
                >
                    <SelectTrigger>
                        <Building className="size-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Departman" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Departmanlar</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={role}
                    onValueChange={(val) => handleFilterChange("role", val)}
                >
                    <SelectTrigger>
                        <Briefcase className="size-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Roller</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r} value={r}>
                                {r === "COMPANY_ADMIN" ? "Admin" : r === "MANAGER" ? "Yönetici" : "Personel"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                    >
                        <X className="size-4 mr-1" /> Temizle
                    </Button>
                )}
            </div>
        </div>
    );
}
