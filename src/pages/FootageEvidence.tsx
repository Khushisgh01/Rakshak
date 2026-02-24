import { useState, useRef } from "react";
import { ArrowLeft, Video, Download, Share2, Clock, Camera, AlertTriangle, Flame, Car, Zap, Search, Radio, Eye, CheckCircle2, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

type Severity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "active" | "dispatched" | "resolved";

interface FootageIncident {
  id: string;
  type: string;
  location: string;
  coordinates: string;
  cameraId: string;
  cameraName: string;
  severity: Severity;
  status: IncidentStatus;
  timestamp: string;
  duration: string;
  description: string;
  aiTags: string[];
  thumbnailColor: string;
  waveform: number[];
  detectionConfidence: number;
  vehiclesInvolved: number;
  lanesAffected: number;
  icon: string;
  hasVideo?: boolean;
}

const initialIncidents: FootageIncident[] = [
  {
    id: "INC-0847", type: "Multi-Vehicle Collision",
    location: "NH-48, KM 23.4 — Sector 15 Junction", coordinates: "28.4595° N, 77.0266° E",
    cameraId: "CAM-001", cameraName: "NH-48 Junction Cam", severity: "critical", status: "dispatched",
    timestamp: "2026-02-24T21:02:00", duration: "04:32",
    description: "3-vehicle pileup detected by AI vision system. Smoke visible from engine compartment. 2 lanes completely blocked. Emergency services dispatched within 90 seconds of detection.",
    aiTags: ["collision", "smoke", "lane-blockage", "multi-vehicle"],
    thumbnailColor: "from-red-950 to-red-900",
    waveform: [3, 5, 8, 12, 18, 25, 40, 65, 80, 95, 90, 88, 85, 82, 78, 72, 68, 65, 60, 58],
    detectionConfidence: 98.4, vehiclesInvolved: 3, lanesAffected: 2, icon: "collision", hasVideo: false
  },
  {
    id: "INC-0846", type: "Vehicle Fire Detected",
    location: "Ring Road, Near Toll Plaza West", coordinates: "28.4612° N, 77.0183° E",
    cameraId: "CAM-002", cameraName: "Ring Road Toll Cam", severity: "critical", status: "active",
    timestamp: "2026-02-24T20:56:00", duration: "08:14",
    description: "Active fire detected on heavy vehicle near toll. Thermal anomaly detected first, visual confirmation within 4 seconds. Fire spreading to roadside vegetation. All lanes diverted.",
    aiTags: ["fire", "thermal-anomaly", "vegetation", "toll-area"],
    thumbnailColor: "from-orange-950 to-red-900",
    waveform: [2, 4, 7, 15, 30, 55, 75, 88, 92, 96, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80],
    detectionConfidence: 99.1, vehiclesInvolved: 1, lanesAffected: 3, icon: "fire", hasVideo: true
  },
  {
    id: "INC-0845", type: "Stalled Vehicle — Lane 2",
    location: "MG Road Flyover, Eastbound", coordinates: "28.4578° N, 77.0342° E",
    cameraId: "CAM-003", cameraName: "MG Flyover East Cam", severity: "medium", status: "dispatched",
    timestamp: "2026-02-24T20:50:00", duration: "14:05",
    description: "Heavy vehicle stalled blocking lane 2 of flyover eastbound. Moderate congestion building behind. Driver visible, appears uninjured. Towing unit en route.",
    aiTags: ["stalled", "congestion", "flyover", "heavy-vehicle"],
    thumbnailColor: "from-blue-950 to-blue-900",
    waveform: [8, 12, 15, 18, 22, 25, 28, 30, 28, 25, 22, 20, 18, 16, 15, 14, 13, 12, 12, 11],
    detectionConfidence: 95.7, vehiclesInvolved: 1, lanesAffected: 1, icon: "stalled", hasVideo: false
  },
  {
    id: "INC-0844", type: "Explosion / Blast",
    location: "Industrial Area Phase II", coordinates: "28.4633° N, 77.0098° E",
    cameraId: "CAM-004", cameraName: "Industrial Phase II Cam", severity: "critical", status: "dispatched",
    timestamp: "2026-02-24T20:42:00", duration: "22:18",
    description: "Explosion detected near chemical storage facility. Shockwave visible in multiple camera feeds. Debris on roadway. Hazmat team and bomb squad dispatched. 500m perimeter established.",
    aiTags: ["explosion", "hazmat", "debris", "chemical-area", "multi-cam"],
    thumbnailColor: "from-purple-950 to-red-950",
    waveform: [5, 8, 10, 15, 20, 60, 95, 100, 90, 75, 60, 50, 42, 38, 35, 32, 30, 28, 26, 25],
    detectionConfidence: 97.8, vehiclesInvolved: 0, lanesAffected: 4, icon: "explosion", hasVideo: false
  },
  {
    id: "INC-0843", type: "Minor Fender Bender",
    location: "Service Road, Block C", coordinates: "28.4551° N, 77.0415° E",
    cameraId: "CAM-005", cameraName: "Service Road C Cam", severity: "low", status: "resolved",
    timestamp: "2026-02-24T20:29:00", duration: "35:22",
    description: "Minor collision between two passenger vehicles. No visible injuries. Vehicles moved to shoulder after 8 minutes. Traffic police arrival confirmed at 20:41. Case closed.",
    aiTags: ["minor-collision", "shoulder-cleared", "resolved"],
    thumbnailColor: "from-slate-800 to-slate-900",
    waveform: [5, 8, 12, 15, 14, 12, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4],
    detectionConfidence: 91.2, vehiclesInvolved: 2, lanesAffected: 0, icon: "minor", hasVideo: false
  },
  {
    id: "INC-0842", type: "Smoke on Roadway",
    location: "Bypass Highway, KM 8.1", coordinates: "28.4510° N, 77.0521° E",
    cameraId: "CAM-006", cameraName: "Bypass KM 8 Cam", severity: "high", status: "resolved",
    timestamp: "2026-02-24T20:23:00", duration: "41:09",
    description: "Dense smoke detected drifting across highway from adjacent field fire. Visibility reduced to under 50m for approximately 12 minutes. Speed advisories issued. Cleared at 21:04.",
    aiTags: ["smoke", "visibility", "field-fire", "speed-advisory"],
    thumbnailColor: "from-gray-800 to-gray-900",
    waveform: [4, 8, 15, 22, 35, 48, 60, 65, 62, 58, 52, 45, 38, 30, 22, 15, 10, 7, 5, 4],
    detectionConfidence: 93.5, vehiclesInvolved: 0, lanesAffected: 2, icon: "smoke", hasVideo: false
  },
];

const severityConfig = {
  critical: { badge: "bg-red-950/60 text-red-400 border border-red-800/50", dot: "bg-red-500", glow: "shadow-[0_0_24px_rgba(239,68,68,0.25)]", border: "border-red-800/40", accent: "text-red-400", bar: "bg-red-500" },
  high:     { badge: "bg-orange-950/60 text-orange-400 border border-orange-800/50", dot: "bg-orange-500", glow: "shadow-[0_0_24px_rgba(249,115,22,0.2)]", border: "border-orange-800/40", accent: "text-orange-400", bar: "bg-orange-500" },
  medium:   { badge: "bg-blue-950/60 text-blue-400 border border-blue-800/50", dot: "bg-blue-500", glow: "", border: "border-blue-800/40", accent: "text-blue-400", bar: "bg-blue-500" },
  low:      { badge: "bg-slate-800/60 text-slate-400 border border-slate-700/50", dot: "bg-slate-500", glow: "", border: "border-slate-700/40", accent: "text-slate-400", bar: "bg-slate-500" }
};

const statusConfig = {
  active:     { label: "LIVE",       style: "bg-red-500/20 text-red-400 border border-red-500/30",       pulse: true  },
  dispatched: { label: "DISPATCHED", style: "bg-amber-500/20 text-amber-400 border border-amber-500/30", pulse: false },
  resolved:   { label: "RESOLVED",   style: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", pulse: false }
};

const IncidentIcon = ({ type, className }: { type: string; className?: string }) => {
  if (type === "fire" || type === "smoke") return <Flame className={className} />;
  if (type === "explosion") return <Zap className={className} />;
  return <Car className={className} />;
};

/* ── Real Video Player ── */
const VideoPlayer = ({ incident }: { incident: FootageIncident }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [muted, setMuted]       = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [hovered, setHovered]   = useState(false);

  const cfg = severityConfig[incident.severity];
  const sc  = statusConfig[incident.status];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); }
    else         { videoRef.current.play(); }
    setPlaying(p => !p);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(m => !m);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((cur / dur) * 100);
    setCurrentTime(formatTime(cur));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const handleEnded = () => setPlaying(false);

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else { videoRef.current.requestFullscreen(); }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setPlaying(true);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-black border border-white/10 group"
      style={{ aspectRatio: "16/9" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Actual video element */}
      <video
        ref={videoRef}
        src="/footage/rec.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
        preload="metadata"
      />

      {/* Corner HUD brackets — always visible */}
      <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white/30 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white/30 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white/30 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white/30 pointer-events-none z-10" />

      {/* Top HUD — always visible */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10 pointer-events-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {sc.pulse && <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />}
            <span className="font-mono text-xs text-white/90 font-bold tracking-widest drop-shadow-lg">{incident.cameraId}</span>
          </div>
          <div className="font-mono text-[10px] text-white/60 tracking-wider drop-shadow-lg">
            {new Date(incident.timestamp).toLocaleString("en-IN", { hour12: false })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${sc.style} backdrop-blur-sm`}>{sc.label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${cfg.badge} backdrop-blur-sm`}>{incident.severity}</span>
        </div>
      </div>

      {/* Center play button — shown when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-full bg-black/60 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm hover:bg-black/80 hover:border-white/60 transition-all ${cfg.glow}`}
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Bottom controls — fade in on hover */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-200 ${hovered || !playing ? "opacity-100" : "opacity-0"}`}>
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Waveform */}
        <div className="relative px-4 pt-6">
          <div className="flex items-end gap-0.5 h-8 mb-2">
            {incident.waveform.map((h, i) => {
              const pct = i / incident.waveform.length * 100;
              return (
                <div key={i}
                  className={`flex-1 rounded-sm transition-colors ${pct < progress ? cfg.bar : "bg-white/20"}`}
                  style={{ height: `${(h / 100) * 100}%` }}
                />
              );
            })}
          </div>

          {/* Seek bar */}
          <div
            className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-3 hover:h-1.5 transition-all"
            onClick={handleSeek}
          >
            <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg transition-all"
              style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <button onClick={togglePlay} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                {playing
                  ? <Pause className="w-4 h-4 text-white" />
                  : <Play  className="w-4 h-4 text-white" />
                }
              </button>
              <button onClick={handleRestart} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 text-white/60" />
              </button>
              <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                {muted
                  ? <VolumeX className="w-4 h-4 text-white/50" />
                  : <Volume2 className="w-4 h-4 text-white" />
                }
              </button>
              <span className="font-mono text-[11px] text-white/60 ml-1">
                {currentTime} / {duration || incident.duration}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-white/30" />
                <span className="font-mono text-[10px] text-white/40">{incident.cameraName}</span>
              </div>
              <button onClick={handleFullscreen} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-2">
                <Maximize2 className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Static Footage Thumbnail (for incidents without video) ── */
const FootageThumbnail = ({ incident }: { incident: FootageIncident }) => {
  const cfg = severityConfig[incident.severity];
  const sc  = statusConfig[incident.status];
  const resolved = incident.status === "resolved";

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black" style={{ aspectRatio: "16/9" }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${incident.thumbnailColor} ${resolved ? "opacity-35" : "opacity-75"}`} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.12) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white/25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white/25 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white/25 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white/25 pointer-events-none" />
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {sc.pulse && <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />}
            <span className="font-mono text-xs text-white/80 font-bold tracking-widest">{incident.cameraId}</span>
          </div>
          <div className="font-mono text-[10px] text-white/40 tracking-wider">{new Date(incident.timestamp).toLocaleString("en-IN", { hour12: false })}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${sc.style}`}>{sc.label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${cfg.badge}`}>{incident.severity}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {resolved ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400/50" />
            <span className="font-mono text-xs text-emerald-400/50 tracking-widest">INCIDENT RESOLVED</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-full bg-black/50 border-2 border-white/20 flex items-center justify-center ${cfg.glow}`}>
              <IncidentIcon type={incident.icon} className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <Play className="w-3 h-3 text-white/50" />
              <span className="font-mono text-[11px] text-white/50 tracking-wider">FOOTAGE RECORDED · {incident.duration}</span>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-end gap-0.5 h-10 mb-2">
          {incident.waveform.map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${resolved ? "bg-white/12" : cfg.bar} opacity-75`} style={{ height: `${(h / 100) * 100}%` }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-white/30" />
            <span className="font-mono text-[10px] text-white/30">{incident.cameraName}</span>
          </div>
          <span className="font-mono text-[10px] text-white/40 bg-black/40 px-2 py-0.5 rounded">{incident.duration}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Incident Card (left list) ── */
const IncidentCard = ({ incident, isSelected, onClick }: { incident: FootageIncident; isSelected: boolean; onClick: () => void }) => {
  const cfg = severityConfig[incident.severity];
  const sc  = statusConfig[incident.status];
  const resolved = incident.status === "resolved";

  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden ${
      isSelected ? `border-white/20 bg-white/5 ${cfg.glow}` : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
    } ${resolved ? "opacity-55" : ""}`}>
      <div className={`relative h-24 bg-gradient-to-br ${incident.thumbnailColor} overflow-hidden ${resolved ? "opacity-50" : ""}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          {resolved
            ? <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
            : <div className="w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center">
                <IncidentIcon type={incident.icon} className="w-4 h-4 text-white" />
              </div>
          }
        </div>
        {/* Video indicator badge */}
        {incident.hasVideo && !resolved && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">
            <Video className="w-2.5 h-2.5 text-cyan-400" />
            <span className="font-mono text-[8px] text-cyan-400">VIDEO</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {sc.pulse && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest ${sc.style}`}>{sc.label}</span>
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[10px] text-white/50 bg-black/40 px-1.5 py-0.5 rounded">{incident.duration}</div>
        <div className="absolute bottom-2 left-2 flex items-end gap-px h-4">
          {incident.waveform.slice(0, 10).map((h, i) => (
            <div key={i} className={`w-1 rounded-sm ${resolved ? "bg-white/20" : cfg.bar} opacity-60`} style={{ height: `${(h / 100) * 100}%` }} />
          ))}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-white/25">{incident.id}</span>
          <span className={`px-1.5 py-px rounded text-[9px] font-bold uppercase ${cfg.badge}`}>{incident.severity}</span>
        </div>
        <p className="text-xs font-semibold text-white/75 leading-tight">{incident.type}</p>
        <div className="flex items-center gap-1 text-[10px] text-white/25">
          <Camera className="w-3 h-3 flex-shrink-0" />
          <span>{incident.cameraId}</span>
          <span className="mx-0.5">·</span>
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{new Date(incident.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
        </div>
      </div>
    </button>
  );
};

/* ══════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════ */
const FootageEvidence = () => {
  const [incidents, setIncidents] = useState<FootageIncident[]>(initialIncidents);
  const [selectedId, setSelectedId]         = useState(initialIncidents[1].id); // default to the one with video
  const [filterStatus, setFilterStatus]     = useState<"all" | IncidentStatus>("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | Severity>("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [markingResolved, setMarkingResolved] = useState(false);

  const selected = incidents.find(i => i.id === selectedId) || incidents[0];
  const cfg = severityConfig[selected.severity];
  const sc  = statusConfig[selected.status];

  const sorted = [...incidents].sort((a, b) => {
    if (a.status === "resolved" && b.status !== "resolved") return 1;
    if (a.status !== "resolved" && b.status === "resolved") return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = sorted.filter(i => {
    if (filterStatus   !== "all" && i.status   !== filterStatus)   return false;
    if (filterSeverity !== "all" && i.severity !== filterSeverity) return false;
    if (searchQuery && !i.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !i.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !i.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleMarkResolved = () => {
    if (selected.status === "resolved" || markingResolved) return;
    setMarkingResolved(true);
    setTimeout(() => {
      setIncidents(prev => prev.map(i => i.id === selectedId ? { ...i, status: "resolved" as IncidentStatus } : i));
      const next = incidents.find(i => i.id !== selectedId && i.status !== "resolved");
      if (next) setSelectedId(next.id);
      setMarkingResolved(false);
    }, 700);
  };

  const activeCount   = incidents.filter(i => i.status === "active").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;
  const activeFiltered   = filtered.filter(i => i.status !== "resolved");
  const resolvedFiltered = filtered.filter(i => i.status === "resolved");

  const selectCls = "w-full appearance-none cursor-pointer bg-[#0f1420] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/65 focus:outline-none focus:border-white/25 font-mono transition-colors hover:border-white/20";

  return (
    <div className="min-h-screen bg-[#080b10] text-white" style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
      backgroundSize: "50px 50px"
    }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#080b10]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/40" />
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Footage Evidence</h1>
              <p className="text-[10px] text-white/30 font-mono tracking-widest">INCIDENT RECORDING ARCHIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-xs text-red-400">{activeCount} LIVE</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <Eye className="w-3 h-3 text-white/30" />
              <span className="font-mono text-xs text-white/40">{incidents.length} recordings</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
              <Radio className="w-3 h-3" />
              Emergency
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: list ── */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input type="text" placeholder="Search incidents..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f1420] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/25 font-mono" />
            </div>
            <div className="flex gap-2">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className={selectCls}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="dispatched">Dispatched</option>
                <option value="resolved">Resolved</option>
              </select>
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value as any)} className={selectCls}>
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">{filtered.length} recordings</span>
              <span className="text-[10px] text-emerald-400/40 font-mono">{resolvedCount} resolved</span>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-0.5">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-white/15 text-xs font-mono">No recordings match filters</div>
              )}
              {activeFiltered.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-1 pb-1">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[9px] text-white/20 font-mono tracking-widest">ACTIVE INCIDENTS</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  {activeFiltered.map(inc => (
                    <IncidentCard key={inc.id} incident={inc} isSelected={selectedId === inc.id} onClick={() => setSelectedId(inc.id)} />
                  ))}
                </>
              )}
              {resolvedFiltered.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-1 pt-2">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[9px] text-emerald-400/35 font-mono tracking-widest">RESOLVED</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  {resolvedFiltered.map(inc => (
                    <IncidentCard key={inc.id} incident={inc} isSelected={selectedId === inc.id} onClick={() => setSelectedId(inc.id)} />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ── Right: detail ── */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">

            {/* Video or thumbnail */}
            {selected.hasVideo
              ? <VideoPlayer incident={selected} />
              : <FootageThumbnail incident={selected} />
            }

            {/* Detail card */}
            <div className={`rounded-xl border ${cfg.border} bg-white/[0.02] p-5 space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs text-white/25">{selected.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${cfg.badge}`}>{selected.severity}</span>
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${sc.style}`}>
                      {sc.pulse && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />}
                      {sc.label}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selected.type}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.07] transition-colors">
                    <Share2 className="w-4 h-4 text-white/35" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.07] transition-colors">
                    <Download className="w-4 h-4 text-white/35" />
                  </button>
                  <Link to="/alerts" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.07] text-xs text-white/40 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Dispatch
                  </Link>
                  {selected.status !== "resolved" ? (
                    <button onClick={handleMarkResolved} disabled={markingResolved}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide transition-all disabled:opacity-40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {markingResolved ? "Marking..." : "Mark Resolved"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-500/45 text-xs font-bold tracking-wide cursor-default">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Location</p>
                  <p className="text-xs text-white/60 leading-relaxed">{selected.location}</p>
                  <p className="font-mono text-[10px] text-white/20">{selected.coordinates}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Camera</p>
                  <p className="text-xs text-white/60">{selected.cameraId}</p>
                  <p className="text-[10px] text-white/25">{selected.cameraName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Timestamp</p>
                  <p className="text-xs text-white/60 font-mono">{new Date(selected.timestamp).toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                  <p className="text-[10px] text-white/20 font-mono">{new Date(selected.timestamp).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${selected.detectionConfidence}%` }} />
                    </div>
                    <span className={`font-mono text-xs font-bold ${cfg.accent}`}>{selected.detectionConfidence}%</span>
                  </div>
                  <p className="text-[10px] text-white/20">{selected.vehiclesInvolved} vehicles · {selected.lanesAffected} lanes blocked</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.025] border border-white/[0.05]">
                <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-2">AI Detection Report</p>
                <p className="text-sm text-white/55 leading-relaxed">{selected.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Tags:</span>
                {selected.aiTags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[10px] text-white/30 font-mono">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Other active recordings strip */}
            {incidents.filter(i => i.id !== selectedId && i.status !== "resolved").length > 0 && (
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Other Active Recordings</p>
                  <span className="text-[10px] text-white/15 font-mono">{incidents.filter(i => i.id !== selectedId && i.status !== "resolved").length} feeds</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {incidents.filter(i => i.id !== selectedId && i.status !== "resolved").map(inc => {
                    const c = severityConfig[inc.severity];
                    const s = statusConfig[inc.status];
                    return (
                      <button key={inc.id} onClick={() => setSelectedId(inc.id)}
                        className="text-left rounded-lg border border-white/[0.05] bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all">
                        <div className={`h-16 bg-gradient-to-br ${inc.thumbnailColor} relative`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IncidentIcon type={inc.icon} className="w-5 h-5 text-white/60" />
                          </div>
                          <div className="absolute top-1.5 left-1.5">
                            <span className={`px-1 py-px rounded text-[8px] font-bold ${s.style}`}>{s.label}</span>
                          </div>
                          {inc.hasVideo && (
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded">
                              <Video className="w-2 h-2 text-cyan-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] font-semibold text-white/55 truncate">{inc.type}</p>
                          <p className="font-mono text-[9px] text-white/20">{inc.cameraId}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FootageEvidence;