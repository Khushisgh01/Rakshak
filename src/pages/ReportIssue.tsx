import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Flame, Car, MapPin, Send, Loader2, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

/* ── Types ── */
type IssueType = "accident" | "fire";
type SubmitState = "idle" | "submitting" | "success";

const issueTypes: { value: IssueType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: "accident", label: "Car Crash / Accident", icon: <Car className="w-5 h-5" />,  color: "text-red-400",    bg: "bg-red-500/15 border-red-500/30" },
  { value: "fire",     label: "Fire / Smoke",        icon: <Flame className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" },
];

export default function ReportIssue() {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  /* Form state */
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gpsAuto, setGpsAuto] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  useEffect(() => {
    sectionsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = `opacity 0.4s ease-out ${i * 0.1}s, transform 0.4s ease-out ${i * 0.1}s`;
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 50);
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

  const handleSubmit = async () => {
    if (!issueType || !lat || !lng) {
      toast.error("Required fields missing");
      return;
    }
    
    setSubmitState("submitting");

    const formData = new FormData();
    formData.append("latitude", lat);
    formData.append("longitude", lng);
    formData.append("incident_type", issueType);
    formData.append("description", description || `Manual ${issueType} report`);
    formData.append("date_created", new Date().toISOString());

    try {
      const response = await fetch("http://127.0.0.1:8000/incident/create/", {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitState("success");
        toast.success("Incident Reported Successfully");
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Backend connection failed");
      setSubmitState("idle");
    }
  };

  if (submitState === "success") {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-white/50 text-sm mb-8">The incident has been recorded at: {lat}, {lng}</p>
          <button onClick={() => setSubmitState("idle")} className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">Report Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-white font-sans">
      <header className="border-b border-white/[0.06] bg-[#080b10]/90 backdrop-blur-xl sticky top-0 z-50 h-14 flex items-center">
        <div className="max-w-xl mx-auto px-4 flex w-full items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft className="w-4 h-4 text-white/40" /></Link>
          <h1 className="text-sm font-bold uppercase tracking-widest">Report Emergency</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* 1. Incident Type */}
        <div ref={el => { if(el) sectionsRef.current[0] = el }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">01. Select Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {issueTypes.map(it => (
              <button key={it.value} onClick={() => setIssueType(it.value)}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all ${issueType === it.value ? it.bg + " " + it.color + " border-opacity-100" : "border-white/[0.06] bg-white/[0.01] text-white/30 hover:bg-white/[0.04]"}`}>
                {it.icon}
                <span className="text-xs font-bold">{it.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Coordinates */}
        <div ref={el => { if(el) sectionsRef.current[1] = el }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">02. Location</h2>
              <button onClick={handleGPS} className={`px-3 py-1 rounded-lg border text-[10px] transition-all ${gpsAuto ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/40"}`}>
                {gpsAuto ? "✓ GPS Active" : "Get Current GPS"}
              </button>
           </div>
           <div className="grid grid-cols-2 gap-4 font-mono">
              <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="w-full bg-[#0c0f16] border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-red-500/40" />
              <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" className="w-full bg-[#0c0f16] border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-red-500/40" />
           </div>
        </div>

        {/* 3. Description */}
        <div ref={el => { if(el) sectionsRef.current[2] = el }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">03. Description</h2>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Optional details about the event..."
            className="w-full bg-[#0c0f16] border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-red-500/40 resize-none" />
        </div>

        {/* 4. Submit */}
        <div ref={el => { if(el) sectionsRef.current[3] = el }}>
            <button onClick={handleSubmit} disabled={submitState === "submitting"}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-red-900/20">
            {submitState === "submitting" ? <Loader2 className="animate-spin w-5 h-5" /> : <><Send className="w-4 h-4" /> Submit Incident Report</>}
            </button>
            <p className="text-[9px] text-center mt-4 text-white/20 uppercase tracking-widest font-mono">Timestamp will be logged automatically</p>
        </div>
      </main>
    </div>
  );
}