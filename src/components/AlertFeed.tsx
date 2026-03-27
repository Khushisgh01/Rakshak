import { AlertTriangle, Flame, Car, Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";

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
  { id: "INC-0847", type: "Multi-Vehicle Collision", location: "NH-48, KM 23.4 — Sector 15 Junction", time: "2 min ago", severity: "critical", icon: <AlertTriangle className="w-5 h-5" />, status: "dispatched" },
  { id: "INC-0846", type: "Fire Detected", location: "Ring Road, Near Toll Plaza West", time: "8 min ago", severity: "critical", icon: <Flame className="w-5 h-5" />, status: "active" },
  { id: "INC-0845", type: "Stalled Vehicle — Lane 2", location: "MG Road Flyover, Eastbound", time: "14 min ago", severity: "medium", icon: <Car className="w-5 h-5" />, status: "dispatched" },
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
    <div className="rounded-lg border border-border bg-card flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Live Alerts</h3>
        </div>
        <div className="flex gap-1">
          {(["all", "critical", "high"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filtered.map((alert) => (
          <div key={alert.id} className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
            <div className="flex gap-4">
              {/* Left Side: Large Icon */}
              <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border ${severityBadge[alert.severity]}`}>
                {alert.icon}
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {alert.id}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-tight ${statusBadge[alert.status]}`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {alert.type}
                </h4>
                
                <p className="text-xs text-muted-foreground truncate italic">
                  {alert.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}