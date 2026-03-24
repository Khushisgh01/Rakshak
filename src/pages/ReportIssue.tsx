import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, AlertTriangle, Flame, Car, Zap, Wind, HelpCircle,
  MapPin, Clock, Upload, X, CheckCircle2,
  Phone, User, Camera, Send, Loader2, Video
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* ── Types ── */
type IssueType = "collision" | "fire" | "stalled" | "explosion" | "smoke" | "flooding" | "other";
type SubmitState = "idle" | "submitting" | "success";

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  size: string;
  preview?: string;
}

const issueTypes: { value: IssueType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: "collision",  label: "Vehicle Collision", icon: <Car className="w-5 h-5" />,          color: "text-red-400",    bg: "bg-red-500/15 border-red-500/30" },
  { value: "fire",       label: "Fire / Smoke",      icon: <Flame className="w-5 h-5" />,         color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" },
  { value: "explosion",  label: "Explosion / Blast", icon: <Zap className="w-5 h-5" />,           color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" },
  { value: "stalled",    label: "Stalled Vehicle",   icon: <Car className="w-5 h-5" />,           color: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30" },
  { value: "smoke",      label: "Hazardous Smoke",   icon: <Wind className="w-5 h-5" />,          color: "text-gray-400",   bg: "bg-gray-500/15 border-gray-500/30" },
  { value: "flooding",   label: "Road Flooding",     icon: <AlertTriangle className="w-5 h-5" />, color: "text-cyan-400",   bg: "bg-cyan-500/15 border-cyan-500/30" },
  { value: "other",      label: "Other Hazard",      icon: <HelpCircle className="w-5 h-5" />,    color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const formRef  = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  /* Form state */
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gpsAuto, setGpsAuto] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    sectionsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity 0.55s cubic-bezier(.22,1,.36,1) ${i * 0.08}s, transform 0.55s cubic-bezier(.22,1,.36,1) ${i * 0.08}s`;
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 60 + i * 80);
    });
  }, []);

  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
      setGpsAuto(true);
      toast.success("Location synced via GPS");
    }, () => toast.error("GPS error. Please enter manually."));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type.startsWith("video") ? "video" : "image",
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      preview: f.type.startsWith("image") ? URL.createObjectURL(f) : undefined,
    }));
    setUploads(prev => [...prev, ...newFiles].slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!issueType || !lat || !lng || !description) {
      toast.error("Required fields missing");
      return;
    }
    
    setSubmitState("submitting");
    try {
      const response = await fetch('YOUR_BACKEND_URL/incident/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          incident_type: issueType,
          description: description,
          reporter: anonymous ? "Anonymous" : reporterName,
          phone: anonymous ? "" : reporterPhone
        })
      });

      if (response.ok) setSubmitState("success");
      else throw new Error();
    } catch {
      toast.error("Backend connection failed");
      setSubmitState("idle");
    }
  };

  const addSection = (el: HTMLDivElement | null, i: number) => {
    if (el) sectionsRef.current[i] = el;
  };

  if (submitState === "success") {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-6"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "50px 50px" }}>
        <div className="text-center max-w-md mx-auto animate-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-white/50 text-sm mb-8">Incident recorded for municipal planning. Coordinates: {lat}, {lng}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors">Dashboard</Link>
            <button onClick={() => setSubmitState("idle")} className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30">Report New</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-white"
      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "50px 50px" }}>
      
      <header className="border-b border-white/[0.06] bg-[#080b10]/90 backdrop-blur-xl sticky top-0 z-50 h-14 flex items-center">
        <div className="max-w-3xl mx-auto px-4 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft className="w-4 h-4 text-white/40" /></Link>
            <h1 className="text-sm font-bold uppercase tracking-tight">Post Local Incident</h1>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono">NON-CCTV ZONE</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6" ref={formRef}>
        {/* 1. Incident Type */}
        <div ref={el => addSection(el, 0)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">01. Type of Incident</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {issueTypes.map(it => (
              <button key={it.value} onClick={() => setIssueType(it.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${issueType === it.value ? it.bg + " " + it.color + " scale-105 shadow-lg" : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/[0.05]"}`}>
                {it.icon}
                <span className="text-[11px] font-medium leading-tight">{it.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Coordinates */}
        <div ref={el => addSection(el, 1)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">02. Precise Location</h2>
              <button onClick={handleGPS} className={`px-3 py-1 rounded-lg border text-[10px] transition-all ${gpsAuto ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/40 hover:text-white"}`}>
                {gpsAuto ? "✓ GPS Locked" : "Use My GPS"}
              </button>
           </div>
           <div className="grid grid-cols-2 gap-4 font-mono">
              <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="w-full bg-[#0f1420] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500/40 outline-none" />
              <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" className="w-full bg-[#0f1420] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500/40 outline-none" />
           </div>
        </div>

        {/* 3. Description */}
        <div ref={el => addSection(el, 2)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">03. Incident Description</h2>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the hazard in detail..."
            className="w-full bg-[#0f1420] border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-red-500/40 transition-colors resize-none" />
        </div>

        {/* 4. Media Upload (Original Restored) */}
        <div ref={el => addSection(el, 3)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">04. Evidence / Media</h2>
          <label className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.015] hover:bg-white/[0.03] cursor-pointer group transition-all">
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="sr-only" />
            <Upload className="w-6 h-6 text-white/20 group-hover:text-white/50" />
            <div className="text-center text-xs text-white/30">Click to upload photos or videos</div>
          </label>
          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploads.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {file.preview ? <img src={file.preview} className="w-10 h-10 rounded-lg object-cover" /> : <Video className="w-4 h-4 text-white/30" />}
                  <div className="flex-1 text-[10px] font-mono truncate text-white/60">{file.name}</div>
                  <button onClick={() => setUploads(u => u.filter(x => x.id !== file.id))}><X className="w-3.5 h-3.5 text-white/20" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Reporter (Original Restored) */}
        <div ref={el => addSection(el, 4)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">05. Reporter Info</h2>
            <button onClick={() => setAnonymous(!anonymous)} className={`px-3 py-1 rounded-lg border text-[10px] ${anonymous ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-white/10 text-white/30"}`}>
              {anonymous ? "🕵️ Anonymous" : "Stay Anonymous?"}
            </button>
          </div>
          {!anonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={reporterName} onChange={e => setReporterName(e.target.value)} placeholder="Full Name" className="bg-[#0f1420] border border-white/10 rounded-xl p-3 text-sm outline-none" />
              <input value={reporterPhone} onChange={e => setReporterPhone(e.target.value)} placeholder="Phone (+91)" className="bg-[#0f1420] border border-white/10 rounded-xl p-3 text-sm outline-none" />
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={submitState === "submitting"}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-red-900/20">
          {submitState === "submitting" ? <Loader2 className="animate-spin w-5 h-5" /> : <><Send className="w-4 h-4" /> Dispatch Incident Report</>}
        </button>
      </main>
    </div>
  );
}