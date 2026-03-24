import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, AlertTriangle, Flame, Car, Zap, Wind, HelpCircle,
  MapPin, Clock, Upload, X, ChevronDown, CheckCircle2,
  Phone, User, Camera, Siren, Send, Loader2, Video
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

// const emergencyLabels: Record<EmergencyLevel, { label: string; color: string; desc: string }> = {
//   1: { label: "Minor",    color: "text-slate-400",  desc: "No injuries, traffic inconvenience only" },
//   2: { label: "Low",      color: "text-blue-400",   desc: "Minor injuries possible, lane blockage" },
//   3: { label: "Moderate", color: "text-yellow-400", desc: "Injuries likely, multiple lanes blocked" },
//   4: { label: "High",     color: "text-orange-400", desc: "Serious injuries, immediate help needed" },
//   5: { label: "Critical", color: "text-red-400",    desc: "Life-threatening, all units required" },
// };

// const emergencyColors: Record<EmergencyLevel, string> = {
//   1: "bg-slate-500",
//   2: "bg-blue-500",
//   3: "bg-yellow-500",
//   4: "bg-orange-500",
//   5: "bg-red-500",
// };

// const services = [
//   { id: "police",    label: "Traffic Police",  icon: <Siren className="w-3.5 h-3.5" /> },
//   { id: "fire",      label: "Fire Brigade",    icon: <Flame className="w-3.5 h-3.5" /> },
//   { id: "ambulance", label: "Ambulance",        icon: <Phone className="w-3.5 h-3.5" /> },
//   { id: "towing",    label: "Towing Service",  icon: <Car className="w-3.5 h-3.5" /> },
// ];

/* ══════════════════════════════════════════ */
export default function ReportIssue() {
  const navigate = useNavigate();
  const formRef  = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  /* Form state */
  const [issueType,       setIssueType]       = useState<IssueType | "">("");
  const [description,     setDescription]     = useState("");
  const [location,        setLocation]        = useState("");
  const [gpsAuto,         setGpsAuto]         = useState(false);
  const [incidentTime,    setIncidentTime]     = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
//   const [emergency,       setEmergency]       = useState<EmergencyLevel>(3);
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [vehiclesInvolved, setVehiclesInvolved] = useState("");
  const [lanesBlocked,    setLanesBlocked]    = useState("");
  const [reporterName,    setReporterName]    = useState("");
  const [reporterPhone,   setReporterPhone]   = useState("");
  const [anonymous,       setAnonymous]       = useState(false);
  const [uploads,         setUploads]         = useState<UploadedFile[]>([]);
  const [submitState,     setSubmitState]     = useState<SubmitState>("idle");
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [activeSection,   setActiveSection]   = useState(0);

  /* ── CSS-only entrance animations (no GSAP dep) ── */
  useEffect(() => {
    // Stagger sections with CSS animation-delay trick via data-index
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

  /* ── GPS auto-fill ── */
  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setLocation(`${pos.coords.latitude.toFixed(5)}° N, ${pos.coords.longitude.toFixed(5)}° E`);
      setGpsAuto(true);
    }, () => {
      setLocation("GPS unavailable — enter manually");
    });
  };

  /* ── File upload ── */
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

//   /* ── Toggle service ── */
//   const toggleService = (id: string) =>
//     setSelectedServices(prev =>
//       prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
//     );

  /* ── Validate ── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!issueType)   e.issueType   = "Please select an issue type";
    if (!location.trim()) e.location = "Location is required";
    if (!description.trim()) e.description = "Please describe the incident";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = () => {
    if (!validate()) {
      // Shake first section with error
      const firstErrorEl = formRef.current?.querySelector('[data-error]') as HTMLElement | null;
      firstErrorEl?.animate([
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" },
      ], { duration: 350, easing: "ease-out" });
      return;
    }
    setSubmitState("submitting");
    setTimeout(() => setSubmitState("success"), 2200);
  };

  /* ── Add section ref helper ── */
  const addSection = (el: HTMLDivElement | null, i: number) => {
    if (el) sectionsRef.current[i] = el;
  };

  /* ─── SUCCESS STATE ─── */
  if (submitState === "success") {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-6"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "50px 50px" }}>
        <div className="text-center max-w-md mx-auto" style={{
          animation: "successPop 0.6s cubic-bezier(.34,1.56,.64,1) forwards"
        }}>
          <style>{`@keyframes successPop { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }`}</style>
          <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-white/40 text-sm mb-2 font-mono">REF #{Math.random().toString(36).slice(2,8).toUpperCase()}</p>
          <p className="text-white/50 text-sm mb-8">Your incident report has been received and dispatched to the appropriate emergency services. Stay safe.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors">
              Return to Dashboard
            </Link>
            <button onClick={() => { setSubmitState("idle"); setIssueType(""); setDescription(""); setLocation(""); }} className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── MAIN FORM ─── */
  return (
    <div className="min-h-screen bg-[#080b10] text-white"
      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "50px 50px" }}>

      {/* ── Header ── */}
      <header ref={headerRef} className="border-b border-white/[0.06] bg-[#080b10]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/40" />
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Report an Incident</h1>
              <p className="text-[10px] text-white/30 font-mono tracking-widest">CIVILIAN HAZARD REPORTING</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs text-red-400">LIVE REPORTING</span>
          </div>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-0.5 bg-white/[0.04]">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
          style={{ width: `${Math.min(100, (
            (issueType ? 20 : 0) +
            (location ? 20 : 0) +
            (description ? 20 : 0) +
            // (selectedServices.length ? 20 : 0) +
            (uploads.length ? 20 : 0)
          ))}%` }} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6" ref={formRef}>

        {/* ── 1. Issue Type ── */}
        <div ref={el => addSection(el, 0)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6" data-error={errors.issueType ? true : undefined}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">01</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Type of Incident</h2>
            <span className="text-red-400 text-xs">*</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {issueTypes.map(it => (
              <button key={it.value} onClick={() => { setIssueType(it.value); setErrors(e => ({ ...e, issueType: "" })); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center
                  ${issueType === it.value
                    ? `${it.bg} ${it.color} scale-[1.02] shadow-lg`
                    : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:border-white/10 hover:text-white/65"
                  }`}>
                {it.icon}
                <span className="text-[11px] font-medium leading-tight">{it.label}</span>
              </button>
            ))}
          </div>
          {errors.issueType && <p className="mt-2 text-xs text-red-400 font-mono">{errors.issueType}</p>}
        </div>

        {/* ── 2. Location + Time ── */}
        <div ref={el => addSection(el, 1)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">02</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Location & Time</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Incident Location <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input value={location} onChange={e => { setLocation(e.target.value); setErrors(er => ({ ...er, location: "" })); }}
                    placeholder="Road name, landmark, highway km..."
                    className={`w-full bg-[#0f1420] border ${errors.location ? "border-red-500/50" : "border-white/10"} rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors`} />
                </div>
                <button onClick={handleGPS}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap
                    ${gpsAuto ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/65"}`}>
                  {gpsAuto ? "✓ GPS" : "Use GPS"}
                </button>
              </div>
              {errors.location && <p className="mt-1.5 text-xs text-red-400 font-mono">{errors.location}</p>}
            </div>
            <div>
              <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Date & Time of Incident</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                <input type="datetime-local" value={incidentTime} onChange={e => setIncidentTime(e.target.value)}
                  className="w-full bg-[#0f1420] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/70 focus:outline-none focus:border-white/25 font-mono transition-colors [color-scheme:dark]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Description ── */}
        <div ref={el => addSection(el, 2)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">03</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Incident Description</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">What happened? <span className="text-red-400">*</span></label>
              <textarea value={description} onChange={e => { setDescription(e.target.value); setErrors(er => ({ ...er, description: "" })); }}
                rows={4} placeholder="Describe the incident in detail — what you saw, how many vehicles, any injuries visible, road conditions..."
                className={`w-full bg-[#0f1420] border ${errors.description ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors resize-none`} />
              <div className="flex justify-between mt-1.5">
                {errors.description
                  ? <p className="text-xs text-red-400 font-mono">{errors.description}</p>
                  : <span />}
                <span className="text-[10px] text-white/20 font-mono">{description.length}/500</span>
              </div>
            </div>
            {/* <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Vehicles Involved</label>
                <input type="number" min="0" max="50" value={vehiclesInvolved} onChange={e => setVehiclesInvolved(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#0f1420] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Lanes Blocked</label>
                <input type="number" min="0" max="10" value={lanesBlocked} onChange={e => setLanesBlocked(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#0f1420] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors" />
              </div>
            </div> */}
          </div>
        </div>

        {/* ── 4. Emergency Level ── */}
        {/* <div ref={el => addSection(el, 3)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">04</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Emergency Level</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30 font-mono">Minor</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${emergencyLabels[emergency].color}`}>{emergencyLabels[emergency].label}</span>
                <span className="text-xs text-white/25 font-mono">Level {emergency}/5</span>
              </div>
              <span className="text-xs text-white/30 font-mono">Critical</span>
            </div>
            {/* Custom range slider */}
            {/* <div className="relative py-2">
              <div className="flex gap-1.5 mb-3">
                {([1,2,3,4,5] as EmergencyLevel[]).map(lvl => (
                  <button key={lvl} onClick={() => setEmergency(lvl)}
                    className={`flex-1 h-10 rounded-lg border transition-all duration-200 font-mono text-xs font-bold
                      ${emergency === lvl
                        ? `${emergencyColors[lvl]} border-transparent text-white scale-105 shadow-lg`
                        : "bg-white/[0.03] border-white/[0.06] text-white/25 hover:bg-white/[0.06]"
                      }`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div> */}
            {/* <div className={`p-3 rounded-xl border ${
              emergency >= 4 ? "bg-red-500/8 border-red-500/20" :
              emergency === 3 ? "bg-yellow-500/8 border-yellow-500/20" :
              "bg-white/[0.03] border-white/[0.06]"
            } transition-all duration-300`}>
              <p className={`text-xs font-mono ${emergencyLabels[emergency].color}`}>{emergencyLabels[emergency].desc}</p>
            </div>
          </div>
        </div> */} 

        {/* ── 5. Emergency Services ── */}
        {/* <div ref={el => addSection(el, 4)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">05</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Services Required</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {services.map(svc => (
              <button key={svc.id} onClick={() => toggleService(svc.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200
                  ${selectedServices.includes(svc.id)
                    ? "bg-red-500/15 border-red-500/30 text-red-300 scale-[1.01]"
                    : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.05] hover:text-white/65"
                  }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  selectedServices.includes(svc.id) ? "bg-red-500/20" : "bg-white/5"
                }`}>
                  {svc.icon}
                </div>
                <span className="text-xs font-semibold">{svc.label}</span>
                {selectedServices.includes(svc.id) && (
                  <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-red-400" />
                )}
              </button>
            ))}
          </div>
        </div> */}

        {/* ── 6. Media Upload ── */}
        <div ref={el => addSection(el, 5)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">06</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Evidence / Media</h2>
            <span className="text-[10px] text-white/20 font-mono ml-auto">Max 5 files</span>
          </div>
          {/* Drop zone */}
          <label className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/20 cursor-pointer transition-all group">
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="sr-only" />
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
              <Upload className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors font-medium">Drop photos or video clips here</p>
              <p className="text-xs text-white/20 mt-1 font-mono">JPG, PNG, MP4, MOV — up to 50 MB per file</p>
            </div>
          </label>
          {/* Uploaded files */}
          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploads.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {file.preview
                    ? <img src={file.preview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {file.type === "video" ? <Video className="w-4 h-4 text-white/30" /> : <Camera className="w-4 h-4 text-white/30" />}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/65 truncate font-mono">{file.name}</p>
                    <p className="text-[10px] text-white/25 font-mono">{file.type === "video" ? "Video" : "Image"} · {file.size}</p>
                  </div>
                  <button onClick={() => setUploads(prev => prev.filter(f => f.id !== file.id))}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-3.5 h-3.5 text-white/30" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 7. Reporter Info ── */}
        <div ref={el => addSection(el, 6)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/30">07</div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Your Contact Info</h2>
            {/* Anonymous toggle */}
            <button onClick={() => setAnonymous(a => !a)}
              className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                ${anonymous ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/50"}`}>
              {anonymous ? "🕵️ Anonymous" : "Anonymous?"}
            </button>
          </div>
          {!anonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input value={reporterName} onChange={e => setReporterName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#0f1420] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input value={reporterPhone} onChange={e => setReporterPhone(e.target.value)}
                    placeholder="+91 XXXXXXXXXX" type="tel"
                    className="w-full bg-[#0f1420] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 font-mono transition-colors" />
                </div>
              </div>
            </div>
          )}
          {anonymous && (
            <div className="p-4 rounded-xl bg-purple-500/8 border border-purple-500/15">
              <p className="text-xs text-purple-400/70 font-mono">Your identity will be kept confidential. The report will still be processed with full priority.</p>
            </div>
          )}
        </div>

        {/* ── Summary bar ── */}
        <div ref={el => addSection(el, 7)} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {issueType && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                {issueTypes.find(t => t.value === issueType)?.icon}
                <span className="text-xs text-white/50 font-mono capitalize">{issueType}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <MapPin className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/50 font-mono truncate max-w-[160px]">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              {/* <span className={`text-xs font-bold font-mono ${emergencyLabels[emergency].color}`}>LVL {emergency} — {emergencyLabels[emergency].label}</span> */}
            </div>
            {uploads.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <Camera className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/50 font-mono">{uploads.length} file{uploads.length > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Submit ── */}
        <div ref={el => addSection(el, 8)} className="pb-8">
          <button onClick={handleSubmit} disabled={submitState === "submitting"}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300
              ${submitState === "submitting"
                ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_60px_rgba(239,68,68,0.45)] active:scale-[0.98]"
              }`}>
            {submitState === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Incident Report
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-white/20 font-mono mt-3">
            For life-threatening emergencies, call <span className="text-red-400">112</span> immediately
          </p>
        </div>

      </main>
    </div>
  );
}