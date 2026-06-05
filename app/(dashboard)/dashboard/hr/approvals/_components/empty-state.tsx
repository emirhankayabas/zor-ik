import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  message: string;
  icon?: LucideIcon;
}

export function EmptyState({ message, icon: Icon = CheckCircle2 }: Props) {
  return (
    <Card className="border-dashed py-12 text-center">
      <Icon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}
