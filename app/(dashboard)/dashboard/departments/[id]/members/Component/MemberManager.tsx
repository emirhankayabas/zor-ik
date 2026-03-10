"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Search,
  UserPlus,
  UserMinus,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CardDescription } from "@/components/ui/card";

interface Employee {
  id: string;
  departmentId: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface Props {
  department: {
    id: string;
    name: string;
    employees: Employee[];
  };
  allEmployees: Employee[];
  locale: string;
}

export default function MemberManager({
  department,
  allEmployees,
  locale,
}: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const filteredEmployees = allEmployees.filter(
    (emp) =>
      emp.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMemberChange = async (
    employeeId: string,
    action: "add" | "remove",
  ) => {
    setIsLoading(employeeId);
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: action === "add" ? department.id : null,
        }),
      });

      if (response.ok) {
        toast.success(action === "add" ? "Üye eklendi" : "Üye çıkarıldı");
        router.refresh();
      } else {
        toast.error("İşlem başarısız oldu");
      }
    } catch (error) {
      toast.error("Bağlantı hatası");
    } finally {
      setIsLoading(null);
    }
  };

  const currentMembers = allEmployees.filter(
    (emp) => emp.departmentId === department.id,
  );

  return (
    <div>
      <div>
        <div className="flex items-center justify-between space-y-2">
          <CardDescription>Arama & Filtreleme</CardDescription>
          <Badge variant="outline">
            {filteredEmployees.length} Çalışan Bulundu
          </Badge>
        </div>
        <div className="relative">
          <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
            <Search size="16" className="text-muted-foreground" />
          </span>

          <Input
            placeholder="İsim veya e-posta ile ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pb-4">
        <div className="space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <User size={16} className="text-primary" /> Mevcut Üyeler (
            {currentMembers.length})
          </h3>
          <div className="space-y-2 bg-muted/20 p-2 rounded-2xl border border-dashed min-h-75">
            {currentMembers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                <UserMinus size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-center">
                  Üye Bulunmuyor
                </p>
              </div>
            ) : (
              currentMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2 bg-background rounded-xl border group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-muted text-[10px] font-bold">
                        {emp.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">
                        {emp.user.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {emp.user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMemberChange(emp.id, "remove")}
                    disabled={!!isLoading}
                    className="text-muted-foreground"
                  >
                    {isLoading === emp.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <UserMinus size={14} />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <UserPlus size={16} className="text-primary" /> Diğer Çalışanlar (
            {
              filteredEmployees.filter(
                (emp) => emp.departmentId !== department.id,
              ).length
            }
            )
          </h3>
          <div className="space-y-3 bg-primary/5 p-2 rounded-2xl border border-primary/10 min-h-75">
            {filteredEmployees.filter(
              (emp) => emp.departmentId !== department.id,
            ).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                <Check size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-center">
                  Herkes Atandı
                </p>
              </div>
            ) : (
              filteredEmployees
                .filter((emp) => emp.departmentId !== department.id)
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-2 bg-background rounded-xl border shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-muted text-[10px] font-bold">
                          {emp.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">
                          {emp.user.name}
                          {emp.departmentId && (
                            <span className="ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                              Başka Birimde
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {emp.user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleMemberChange(emp.id, "add")}
                      disabled={!!isLoading}
                    >
                      {isLoading === emp.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserPlus size={14} />
                      )}
                    </Button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
