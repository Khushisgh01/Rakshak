import { Camera, Signal, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface CCTVFeed {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "alert";
}

const feeds: CCTVFeed[] = [
  { id: "CAM-001", name: "NH-48 Junction", location: "Sector 15", status: "alert" },
  { id: "CAM-002", name: "Ring Road Toll", location: "West Gate", status: "alert" },
  { id: "CAM-003", name: "MG Flyover East", location: "Lane 2-3", status: "online" },
  { id: "CAM-004", name: "Industrial Area", location: "Phase II Entry", status: "alert" },
  { id: "CAM-005", name: "Service Road C", location: "Block C", status: "online" },
  { id: "CAM-006", name: "Bypass KM 8", location: "Southbound", status: "offline" },
];

const statusStyles = {
  online: { dot: "bg-success", border: "border-border", label: "LIVE", labelStyle: "text-success" },
  offline: { dot: "bg-muted-foreground", border: "border-border opacity-60", label: "OFFLINE", labelStyle: "text-muted-foreground" },
  alert: { dot: "bg-destructive animate-pulse-slow", border: "border-destructive/30", label: "ALERT", labelStyle: "text-destructive" },
};

export function CCTVGrid() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">CCTV Live Feeds</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-success" /> 5 online</span>
          <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> 1 offline</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {feeds.map((feed) => {
          const style = statusStyles[feed.status];
          return (
            <button
              key={feed.id}
              onClick={() => setSelected(feed.id === selected ? null : feed.id)}
              className={`relative rounded-md border ${style.border} overflow-hidden transition-all hover:scale-[1.02] ${
                selected === feed.id ? "ring-1 ring-primary" : ""
              }`}
            >
              {/* Simulated camera feed */}
              <div className="aspect-video bg-secondary/50 bg-grid relative flex items-center justify-center">
                {feed.status === "offline" ? (
                  <WifiOff className="w-8 h-8 text-muted-foreground/30" />
                ) : (
                  <>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-px bg-primary/10 animate-scan" />
                    </div>
                    <Signal className="w-6 h-6 text-muted-foreground/20" />
                  </>
                )}
                {/* Status badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-[10px] font-bold font-mono ${style.labelStyle}`}>{style.label}</span>
                </div>
                <span className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground">{feed.id}</span>
              </div>
              <div className="p-2 text-left">
                <p className="text-xs font-medium text-foreground truncate">{feed.name}</p>
                <p className="text-[10px] text-muted-foreground">{feed.location}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
