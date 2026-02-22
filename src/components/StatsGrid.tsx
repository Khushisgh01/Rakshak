import { AlertTriangle, Flame, Car, Construction, Activity, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  severity?: "default" | "critical" | "warning" | "success";
}

const severityStyles = {
  default: "border-border bg-card",
  critical: "border-destructive/30 bg-destructive/5 glow-destructive",
  warning: "border-warning/30 bg-warning/5 glow-warning",
  success: "border-success/30 bg-success/5 glow-success",
};

const iconBgStyles = {
  default: "bg-primary/10 text-primary",
  critical: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
};

export function StatCard({ title, value, change, trend, icon, severity = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${severityStyles[severity]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`rounded-md p-2 ${iconBgStyles[severity]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-foreground">{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1 text-xs">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-destructive" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-success" />}
          <span className={trend === "up" ? "text-destructive" : trend === "down" ? "text-success" : "text-muted-foreground"}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Incidents"
        value={7}
        change="+2 in last hour"
        trend="up"
        icon={<AlertTriangle className="w-4 h-4" />}
        severity="critical"
      />
      <StatCard
        title="Fire / Smoke"
        value={2}
        change="1 resolved"
        trend="down"
        icon={<Flame className="w-4 h-4" />}
        severity="warning"
      />
      <StatCard
        title="Stalled Vehicles"
        value={12}
        change="+3 today"
        trend="up"
        icon={<Car className="w-4 h-4" />}
        severity="default"
      />
      <StatCard
        title="System Uptime"
        value="99.7%"
        change="All cameras online"
        trend="neutral"
        icon={<Activity className="w-4 h-4" />}
        severity="success"
      />
    </div>
  );
}
