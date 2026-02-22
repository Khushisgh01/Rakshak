import { CircleDot } from "lucide-react";

interface SignalStatus {
  id: string;
  intersection: string;
  status: "normal" | "override" | "malfunction";
  currentPhase: "red" | "yellow" | "green";
  congestion: "low" | "moderate" | "high";
}

const signals: SignalStatus[] = [
  { id: "TS-001", intersection: "NH-48 × Sector 15", status: "override", currentPhase: "red", congestion: "high" },
  { id: "TS-002", intersection: "Ring Road × MG Link", status: "normal", currentPhase: "green", congestion: "moderate" },
  { id: "TS-003", intersection: "Bypass × Industrial", status: "override", currentPhase: "red", congestion: "high" },
  { id: "TS-004", intersection: "Service Rd × Block A", status: "normal", currentPhase: "green", congestion: "low" },
  { id: "TS-005", intersection: "MG Road × Civil Lines", status: "normal", currentPhase: "yellow", congestion: "moderate" },
  { id: "TS-006", intersection: "Outer Ring × Airport", status: "malfunction", currentPhase: "red", congestion: "high" },
];

const phaseColors = {
  red: "text-destructive",
  yellow: "text-warning",
  green: "text-success",
};

const congestionBadge = {
  low: "bg-success/15 text-success",
  moderate: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
};

const statusLabel = {
  normal: { text: "Normal", style: "text-success" },
  override: { text: "AI Override", style: "text-warning" },
  malfunction: { text: "Malfunction", style: "text-destructive" },
};

export function TrafficSignals() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Traffic Signal Control</h3>
      </div>
      <div className="divide-y divide-border">
        {signals.map((signal) => (
          <div key={signal.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
            <div className="flex gap-1">
              <CircleDot className={`w-4 h-4 ${signal.currentPhase === "red" ? phaseColors.red : "text-muted-foreground/30"}`} />
              <CircleDot className={`w-4 h-4 ${signal.currentPhase === "yellow" ? phaseColors.yellow : "text-muted-foreground/30"}`} />
              <CircleDot className={`w-4 h-4 ${signal.currentPhase === "green" ? phaseColors.green : "text-muted-foreground/30"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{signal.intersection}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[10px] text-muted-foreground">{signal.id}</span>
                <span className={`text-[10px] font-semibold ${statusLabel[signal.status].style}`}>
                  {statusLabel[signal.status].text}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${congestionBadge[signal.congestion]}`}>
              {signal.congestion}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
