import { MapPin } from "lucide-react";

const flaggedZones = [
  { id: 1, x: 25, y: 35, severity: "critical" as const, label: "NH-48 Collision" },
  { id: 2, x: 62, y: 22, severity: "critical" as const, label: "Ring Road Fire" },
  { id: 3, x: 45, y: 60, severity: "warning" as const, label: "MG Flyover Stall" },
  { id: 4, x: 78, y: 48, severity: "critical" as const, label: "Industrial Blast" },
  { id: 5, x: 35, y: 75, severity: "info" as const, label: "Service Road Minor" },
  { id: 6, x: 55, y: 40, severity: "warning" as const, label: "Bypass Smoke" },
];

const markerColors = {
  critical: "text-destructive drop-shadow-[0_0_8px_hsl(0_72%_55%/0.6)]",
  warning: "text-warning drop-shadow-[0_0_8px_hsl(38_92%_55%/0.5)]",
  info: "text-info drop-shadow-[0_0_6px_hsl(210_80%_55%/0.5)]",
};

const pulseColors = {
  critical: "bg-destructive/30",
  warning: "bg-warning/30",
  info: "bg-info/30",
};

export function IncidentMap() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Incident Map</h3>
        <span className="text-xs text-muted-foreground font-mono">6 flagged zones</span>
      </div>
      <div className="flex-1 relative bg-grid bg-secondary/30 min-h-[300px]">
        {/* Mock road grid lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="10" y1="30" x2="90" y2="30" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          <line x1="10" y1="70" x2="90" y2="70" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          <line x1="20" y1="10" x2="20" y2="90" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          <line x1="75" y1="10" x2="75" y2="90" stroke="hsl(220 15% 22%)" strokeWidth="0.5" />
          {/* Major roads */}
          <line x1="5" y1="40" x2="95" y2="40" stroke="hsl(220 15% 28%)" strokeWidth="1.2" />
          <line x1="40" y1="5" x2="40" y2="95" stroke="hsl(220 15% 28%)" strokeWidth="1.2" />
          <line x1="10" y1="85" x2="85" y2="15" stroke="hsl(220 15% 25%)" strokeWidth="0.8" />
        </svg>

        {/* Incident markers */}
        {flaggedZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute group cursor-pointer"
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className={`absolute inset-0 w-8 h-8 -m-2 rounded-full animate-ping ${pulseColors[zone.severity]}`} />
            <MapPin className={`w-5 h-5 relative z-10 ${markerColors[zone.severity]}`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              {zone.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
