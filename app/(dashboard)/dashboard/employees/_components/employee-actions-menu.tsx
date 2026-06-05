"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmployeeActionsMenuProps {
  employeeId: string;
  isActive: boolean;
}

export function EmployeeActionsMenu({ employeeId, isActive }: EmployeeActionsMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    const action = isActive ? "pasife almak" : "aktif etmek";
    if (!confirm(`Bu çalışanı ${action} istediğinize emin misiniz?`)) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/employees/${employeeId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        toast.success(isActive ? "Çalışan pasife alındı." : "Çalışan aktif edildi.");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "İşlem başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/employees/${employeeId}/edit`}>
            Düzenle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/employees/${employeeId}/leaves`}>
            İzin Geçmişi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={isActive ? "text-destructive" : "text-emerald-600"}
          onClick={handleToggleActive}
        >
          {isActive ? "Pasif Yap" : "Aktif Et"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
