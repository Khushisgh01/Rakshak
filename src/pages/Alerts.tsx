import { Shield, ArrowLeft, AlertTriangle, Flame, Car, Zap, Clock, Phone, Send, Radio, Building2, Newspaper, Ambulance, Siren, Bell, CheckCircle2, XCircle, MapPin, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

type Severity = "critical" | "high" | "medium" | "low";
type DispatchStatus = "pending" | "notified" | "acknowledged" | "en-route";

interface Incident {
  id: string;
  type: string;
  location: string;
  time: string;
  severity: Severity;
  icon: React.ReactNode;
  status: "active" | "dispatched" | "resolved";
  coordinates: string;
  cameraId: string;
  description: string;
}

interface DispatchEntry {
  service: string;
  type: "hospital" | "fire" | "police" | "media";
  status: DispatchStatus;
  time: string;
  contact: string;
}

// ── Backend helpers (from file 1) ──────────────────────────────────────────
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

const getSeverityFromType = (type: string): Severity => {
  const t = type.toLowerCase();
  if (t.includes("crash") && t.includes("fire")) return "critical";
  if (t.includes("fire") || t.includes("crash")) return "critical";
  if (t.includes("smoke")) return "medium";
  return "low";
};

const getStatusFromType = (type: string): "active" | "dispatched" | "resolved" => {
  return "active";
};

const getIconFromType = (type: string): React.ReactNode => {
  const t = type.toLowerCase();
  if (t.includes("fire")) return <Flame className="w-4 h-4" />;
  if (t.includes("crash") || t.includes("collision")) return <AlertTriangle className="w-4 h-4" />;
  if (t.includes("smoke")) return <Wind className="w-4 h-4" />;
  return <AlertTriangle className="w-4 h-4" />;
};

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
// ──────────────────────────────────────────────────────────────────────────

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

const dispatchStatusStyles: Record<DispatchStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-muted", text: "text-muted-foreground" },
  notified: { bg: "bg-info/20", text: "text-info" },
  acknowledged: { bg: "bg-warning/20", text: "text-warning" },
  "en-route": { bg: "bg-success/20", text: "text-success" },
};

const serviceIcon: Record<string, React.ReactNode> = {
  hospital: <Ambulance className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  police: <Siren className="w-4 h-4" />,
  media: <Newspaper className="w-4 h-4" />,
};

// Static dispatch data (kept as-is from file 2)
const dispatchData: Record<string, DispatchEntry[]> = {
  "INC-0847": [
    { service: "City Hospital — Trauma Unit", type: "hospital", status: "en-route", time: "1 min ago", contact: "+91-112-TRAUMA" },
    { service: "Apollo Emergency", type: "hospital", status: "notified", time: "2 min ago", contact: "+91-112-APOLLO" },
    { service: "Fire Station #4", type: "fire", status: "en-route", time: "1 min ago", contact: "+91-112-FIRE" },
    { service: "Traffic Police HQ", type: "police", status: "acknowledged", time: "2 min ago", contact: "+91-112-POLICE" },
    { service: "City News Bureau", type: "media", status: "notified", time: "2 min ago", contact: "press@citynews.com" },
    { service: "Road Safety Times", type: "media", status: "pending", time: "—", contact: "alert@rst.com" },
  ],
  "INC-0846": [
    { service: "Fire Station #2", type: "fire", status: "en-route", time: "5 min ago", contact: "+91-112-FIRE" },
    { service: "City Hospital — Burns", type: "hospital", status: "acknowledged", time: "6 min ago", contact: "+91-112-BURNS" },
    { service: "Traffic Police HQ", type: "police", status: "notified", time: "7 min ago", contact: "+91-112-POLICE" },
    { service: "National News Agency", type: "media", status: "notified", time: "8 min ago", contact: "tips@nna.com" },
  ],
};

const staticEmergencyServices: DispatchEntry[] = [
  { service: "City Hospital — Trauma Unit", type: "hospital", status: "en-route", time: "1 min ago", contact: "+91-112-TRAUMA" },
  { service: "Apollo Emergency", type: "hospital", status: "notified", time: "2 min ago", contact: "+91-112-APOLLO" },
  { service: "Fire Station #4", type: "fire", status: "en-route", time: "1 min ago", contact: "+91-112-FIRE" },
  { service: "Traffic Police HQ", type: "police", status: "acknowledged", time: "2 min ago", contact: "+91-112-POLICE" },
];
const Alerts = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<string>("");
  const [filter, setFilter] = useState<"all" | Severity>("all");

  // ── Fetch from backend (same logic as file 1) ──────────────────────────
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const [resManual, resCamera] = await Promise.all([
          fetch('http://localhost:8000/incident/get-all/'),
          fetch('http://localhost:8000/camera-incident/get-all/')
        ]);

        const dataManual = await resManual.json();
        const dataCamera = await resCamera.json();

        const processItems = async (items: any[], prefix: string) => {
          return await Promise.all((items || []).map(async (inc: any) => {
            const fullName = String(getCleanName(inc.incident_type));
            const dateObj = inc.date_created ? new Date(inc.date_created) : new Date();
            const safeTime = isNaN(dateObj.getTime()) ? "--:--" : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const lat = inc.latitude || inc.camera_details?.latitude || 0;
            const lon = inc.longitude || inc.camera_details?.longitude || 0;
            const locationName = await getReadableLocation(Number(lat), Number(lon));

            return {
              id: String(`${prefix}-${inc.id}`),
              type: fullName,
              location: locationName,
              time: safeTime,
              severity: getSeverityFromType(fullName),
              icon: getIconFromType(fullName),
              status: getStatusFromType(fullName),
              coordinates: `${Number(lat).toFixed(4)}° N, ${Number(lon).toFixed(4)}° E`,
              cameraId: inc.camera ? `CAM-${inc.camera}` : "N/A",
              description: inc.description || "Incident detected by system.",
            } as Incident;
          }));
        };

        const manualMapped = await processItems(dataManual.incidents || [], 'CITIZEN');
        const cameraMapped = await processItems(dataCamera.camera_incidents || [], 'CAMERA');

        const combined = [...manualMapped, ...cameraMapped]
          .sort((a, b) => b.time.localeCompare(a.time))
          .slice(0, 20);

        setIncidents(combined);
        if (combined.length > 0) setSelectedIncident(combined[0].id);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const selected = incidents.find(i => i.id === selectedIncident) || incidents[0];
  const filtered = filter === "all" ? incidents : incidents.filter(i => i.severity === filter);

  const currentDispatches = selected ? (dispatchData[selected.id] || []) : [];
  const hospitalDispatches = staticEmergencyServices;
  const mediaDispatches = currentDispatches.filter(d => d.type === "media");

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-slow" />
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">Detection & Alerts</h1>
              <p className="text-[10px] text-muted-foreground font-mono">EMERGENCY DISPATCH CENTER</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Bell className="w-3 h-3 text-destructive" />
              {incidents.filter(i => i.status === "active").length} active
            </span>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
              <Radio className="w-3 h-3" />
              Broadcast Alert
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            No incidents found.
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Emergency Services */}
          <div className="lg:col-span-4 rounded-lg border border-border bg-card flex flex-col max-h-[calc(100vh-120px)]">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Emergency Services</h3>
            </div>
            <div className="divide-y divide-border">
              {hospitalDispatches.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">No emergency dispatch for this incident</div>
              ) : (
                hospitalDispatches.map((d, i) => {
                  const st = dispatchStatusStyles[d.status];
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                      <div className="text-muted-foreground">{serviceIcon[d.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.service}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{d.contact}</span>
                          <span className="text-[10px] text-muted-foreground">{d.time}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${st.bg} ${st.text}`}>
                        {d.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 border-t border-border">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
                <Phone className="w-3 h-3" />
                Dispatch Additional Units
              </button>
            </div>
          </div>

          {/* Right: Detail + Dispatch */}
          <div className="lg:col-span-8 space-y-6">
            {/* Incident Detail */}
            {selected && (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">{selected.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${severityBadge[selected.severity]}`}>
                      {selected.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${statusBadge[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selected.type}</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {selected.time}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="text-foreground">{selected.location}</p>
                    <p className="font-mono text-xs text-muted-foreground">{selected.coordinates}</p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Incident List */}
            <div className="lg:col-span-4 rounded-lg border border-border bg-card flex flex-col max-h-[calc(100vh-120px)]">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Detected Incidents</h3>
                  <span className="font-mono text-xs text-muted-foreground">{incidents.length} total</span>
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
                {filtered.map((incident) => (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident.id)}
                    className={`w-full p-3 text-left hover:bg-secondary/50 transition-colors ${
                      selectedIncident === incident.id ? "bg-secondary/70 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-md p-1.5 mt-0.5 border ${severityBadge[incident.severity]}`}>
                        {incident.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge[incident.status]}`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{incident.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{incident.location}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {incident.time}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;