import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatCard({ label, value, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
