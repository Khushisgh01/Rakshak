import { Shield, ArrowLeft, AlertTriangle, Flame, Car, Zap, Clock, Phone, Send, Radio, Building2, Newspaper, Ambulance, Siren, Bell, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState } from "react";

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

const incidents: Incident[] = [
  { id: "INC-0847", type: "Multi-Vehicle Collision", location: "NH-48, KM 23.4 — Sector 15 Junction", time: "2 min ago", severity: "critical", icon: <AlertTriangle className="w-4 h-4" />, status: "dispatched", coordinates: "28.4595° N, 77.0266° E", cameraId: "CAM-001", description: "3-vehicle pileup detected. Smoke visible. 2 lanes blocked." },
  { id: "INC-0846", type: "Fire Detected", location: "Ring Road, Near Toll Plaza West", time: "8 min ago", severity: "critical", icon: <Flame className="w-4 h-4" />, status: "active", coordinates: "28.4612° N, 77.0183° E", cameraId: "CAM-002", description: "Active fire on vehicle. Spreading to roadside vegetation." },
  { id: "INC-0845", type: "Stalled Vehicle — Lane 2", location: "MG Road Flyover, Eastbound", time: "14 min ago", severity: "medium", icon: <Car className="w-4 h-4" />, status: "dispatched", coordinates: "28.4578° N, 77.0342° E", cameraId: "CAM-003", description: "Heavy vehicle stalled blocking lane 2. Moderate congestion." },
  { id: "INC-0844", type: "Explosion / Blast", location: "Industrial Area Phase II", time: "22 min ago", severity: "critical", icon: <Zap className="w-4 h-4" />, status: "dispatched", coordinates: "28.4633° N, 77.0098° E", cameraId: "CAM-004", description: "Explosion detected near chemical storage. Emergency response active." },
  { id: "INC-0843", type: "Minor Fender Bender", location: "Service Road, Block C", time: "35 min ago", severity: "low", icon: <Car className="w-4 h-4" />, status: "resolved", coordinates: "28.4551° N, 77.0415° E", cameraId: "CAM-005", description: "Minor collision. No injuries. Vehicles moved to shoulder." },
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

const Alerts = () => {
  const [selectedIncident, setSelectedIncident] = useState<string>(incidents[0].id);
  const [filter, setFilter] = useState<"all" | Severity>("all");

  const selected = incidents.find(i => i.id === selectedIncident) || incidents[0];
  const filtered = filter === "all" ? incidents : incidents.filter(i => i.severity === filter);

  // Mock dispatch data per incident
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
    "INC-0845": [
      { service: "Traffic Police Sector 12", type: "police", status: "acknowledged", time: "10 min ago", contact: "+91-112-POLICE" },
      { service: "Towing Service", type: "police", status: "notified", time: "12 min ago", contact: "+91-TOW" },
    ],
    "INC-0844": [
      { service: "Fire Station #1 — Hazmat", type: "fire", status: "en-route", time: "18 min ago", contact: "+91-112-HAZMAT" },
      { service: "City Hospital — Trauma", type: "hospital", status: "en-route", time: "19 min ago", contact: "+91-112-TRAUMA" },
      { service: "Police — Bomb Squad", type: "police", status: "en-route", time: "18 min ago", contact: "+91-112-BOMB" },
      { service: "All India News Wire", type: "media", status: "acknowledged", time: "20 min ago", contact: "breaking@ainw.com" },
      { service: "Industrial Safety Board", type: "police", status: "notified", time: "20 min ago", contact: "+91-ISB" },
    ],
    "INC-0843": [
      { service: "Traffic Police Sector 8", type: "police", status: "acknowledged", time: "30 min ago", contact: "+91-112-POLICE" },
    ],
  };

  const currentDispatches = dispatchData[selected.id] || [];
  const hospitalDispatches = currentDispatches.filter(d => d.type === "hospital" || d.type === "fire" || d.type === "police");
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Incident List */}
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
                {/* <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Camera</p>
                    <p className="font-mono text-foreground">{selected.cameraId}</p>
                  </div>
                </div> */}
                {/* <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Description</p>
                    <p className="text-foreground">{selected.description}</p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Dispatch Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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

              {/* Media / Journalist */}
              {/* <div className="rounded-lg border border-border bg-card">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-info" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Media & Press</h3>
                </div>
                <div className="divide-y divide-border">
                  {mediaDispatches.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">No media alerts for this incident</div>
                  ) : (
                    mediaDispatches.map((d, i) => {
                      const st = dispatchStatusStyles[d.status];
                      return (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                          <div className="text-info">{serviceIcon[d.type]}</div>
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
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-info/10 border border-info/20 text-info text-xs font-semibold hover:bg-info/20 transition-colors">
                    <Send className="w-3 h-3" />
                    Send Press Alert
                  </button>
                </div>
              </div> */}
            </div>

            {/* Dispatch Timeline */}
            {/* <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Dispatch Timeline</h3>
              <div className="space-y-3">
                {currentDispatches.map((d, i) => {
                  const st = dispatchStatusStyles[d.status];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-16 text-right">
                        <span className="text-[10px] font-mono text-muted-foreground">{d.time}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        d.status === "en-route" ? "bg-success" :
                        d.status === "acknowledged" ? "bg-warning" :
                        d.status === "notified" ? "bg-info" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm text-foreground">{d.service}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${st.bg} ${st.text}`}>
                          {d.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;
