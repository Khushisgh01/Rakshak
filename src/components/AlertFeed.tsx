import { AlertTriangle, Flame, Car, Clock, MapPin, Activity, ShieldAlert, Wind, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: string;
  location: string;
  time: string;
  date: string; // Added date field
  // icon: React.ReactNode;
  timestamp: number;
}

const incidentMapper: Record<string, string> = {
  "c": "Crash",
  "f": "Fire",
  "s": "Smoke",
  "cf": "Crash & Fire",
  "cs": "Crash & Smoke",
  "fs": "Fire & Smoke",
  "cfs": "Crash, Fire & Smoke",
  "o": "Other Incident",
};

const getCleanName = (code: string) => {
  if (!code) return "Unknown Alert";
  const cleanCode = code.toLowerCase().trim();
  return incidentMapper[cleanCode] || code;
};

const getDynamicStyle = (type: string = "") => {
  const t = type.toLowerCase();
  if (t.includes("fire")) {
    return "bg-orange-500/10 text-orange-500 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)] drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]";
  }
  if (t.includes("crash") || t.includes("collision") || t.includes("accident")) {
    return "bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]";
  }
  if (t.includes("smoke")) {
    return "bg-slate-500/10 text-slate-400 border-slate-500/50 shadow-[0_0_15px_rgba(148,163,184,0.3)] drop-shadow-[0_0_8px_rgba(148,163,184,0.7)]";
  }
  return "bg-primary/10 text-primary border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]";
};

const getIcon = (type: string = "") => {
  const t = type.toLowerCase();
  if (t.includes("fire")) return <Flame className="w-5 h-5" />;
  if (t.includes("crash") || t.includes("collision")) return <AlertTriangle className="w-5 h-5" />;
  if (t.includes("smoke")) return <Wind className="w-5 h-5" />;
  return <ShieldAlert className="w-5 h-5" />;
};

export function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const getReadableLocation = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
      const data = await response.json();
      const parts = data.display_name.split(',');
      return parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    } catch {
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [resManual, resCamera] = await Promise.all([
          fetch('http://localhost:8000/incident/get-all/'),
          fetch('http://localhost:8000/camera-incident/get-all/')
        ]);

        const dataManual = await resManual.json();
        const dataCamera = await resCamera.json();

        const processItems = async (items: any[], prefix: string) => {
          return await Promise.all((items || []).map(async (inc: any) => {
            // 1. Ensure type is a string
            const fullName = String(getCleanName(inc.incident_type));

            // 2. Safely handle dates
            const dateObj = inc.date_created ? new Date(inc.date_created) : new Date();
            const safeDate = isNaN(dateObj.getTime()) ? "Unknown Date" : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            const safeTime = isNaN(dateObj.getTime()) ? "--:--" : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // 3. Extract lat/lon safely
            const lat = inc.latitude || inc.camera_details?.latitude || 0;
            const lon = inc.longitude || inc.camera_details?.longitude || 0;

            // 4. Get location string
            const locationName = await getReadableLocation(Number(lat), Number(lon));

            return {
              id: String(`${prefix}-${inc.id}`),
              type: fullName,
              location: String(locationName), // Force string
              date: String(safeDate),         // Force string
              time: String(safeTime),         // Force string
              timestamp: dateObj.getTime() || Date.now()
            };
          }));
        };

        const manualMapped = await processItems(dataManual.incidents, 'CITIZEN');
        const cameraMapped = await processItems(dataCamera.camera_incidents, 'CAMERA');

        const combined = [...manualMapped, ...cameraMapped]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        setAlerts(combined);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-full shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_#ef4444]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Live Alerts</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border custom-scrollbar">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 hover:bg-secondary/30 transition-all duration-300 cursor-pointer group">
            <div className="flex gap-4">
              {/* Pass alert.type to getDynamicStyle and getIcon directly */}
              <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-500 ${getDynamicStyle(alert.type)}`}>
                {getIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {alert.id}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {alert.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {alert.type}
                </h4>

                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate italic">
                  <MapPin className="w-3 h-3 text-destructive/40" />
                  {alert.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}