import { AlertTriangle, Flame, Car, Zap, Clock } from "lucide-react";
import { useState } from "react";

type Severity = "critical" | "high" | "medium" | "low";

interface Alert {
  id: string;
  type: string;
  location: string;
  time: string;
  severity: Severity;
  icon: React.ReactNode;
  status: "active" | "dispatched" | "resolved";
}

const mockAlerts: Alert[] = [
  { id: "INC-0847", type: "Multi-Vehicle Collision", location: "NH-48, KM 23.4 — Sector 15 Junction", time: "2 min ago", severity: "critical", icon: <AlertTriangle className="w-4 h-4" />, status: "dispatched" },
  { id: "INC-0846", type: "Fire Detected", location: "Ring Road, Near Toll Plaza West", time: "8 min ago", severity: "critical", icon: <Flame className="w-4 h-4" />, status: "active" },
  { id: "INC-0845", type: "Stalled Vehicle — Lane 2", location: "MG Road Flyover, Eastbound", time: "14 min ago", severity: "medium", icon: <Car className="w-4 h-4" />, status: "dispatched" },
  { id: "INC-0844", type: "Explosion / Blast", location: "Industrial Area Phase II", time: "22 min ago", severity: "critical", icon: <Zap className="w-4 h-4" />, status: "dispatched" },
  { id: "INC-0843", type: "Minor Fender Bender", location: "Service Road, Block C", time: "35 min ago", severity: "low", icon: <Car className="w-4 h-4" />, status: "resolved" },
  { id: "INC-0842", type: "Smoke on Roadway", location: "Bypass Highway, KM 8.1", time: "41 min ago", severity: "high", icon: <Flame className="w-4 h-4" />, status: "resolved" },
];

const severityBadge: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

const statusBadge: Record<string, string> = {
  active: "bg-destructive/20 text-destructive",
  dispatched: "bg-warning/20 text-warning",
  resolved: "bg-success/20 text-success",
};

export function AlertFeed() {
  const [filter, setFilter] = useState<"all" | Severity>("all");

  const filtered = filter === "all" ? mockAlerts : mockAlerts.filter(a => a.severity === filter);

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-slow" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Live Alerts</h3>
        </div>
        <div className="flex gap-1">
          {(["all", "critical", "high", "medium"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filtered.map((alert) => (
          <div key={alert.id} className="p-3 hover:bg-secondary/50 transition-colors animate-slide-in">
            <div className="flex items-start gap-3">
              <div className={`rounded-md p-1.5 mt-0.5 border ${severityBadge[alert.severity]}`}>
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-muted-foreground">{alert.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge[alert.status]}`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{alert.type}</p>
                <p className="text-xs text-muted-foreground truncate">{alert.location}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {alert.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
