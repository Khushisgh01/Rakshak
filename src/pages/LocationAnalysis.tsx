import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, BarChart3, Loader2, Activity, PieChart as PieIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { toast } from "sonner";

// REPLACE WITH YOUR ACTUAL BACKEND DOMAIN
const API_BASE = "http://localhost:8000";

export default function LocationAnalysis() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("5"); // Variable for backend radius
  const [useCurrentLoc, setUseCurrentLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // GPS Auto-fill logic
  useEffect(() => {
    if (useCurrentLoc) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          toast.success("Current GPS location synced");
        },
        () => {
          toast.error("Location access denied");
          setUseCurrentLoc(false);
        }
      );
    }
  }, [useCurrentLoc]);

  const fetchAnalysis = async () => {
    if (!lat || !lng || !radius) {
      toast.error("Please provide coordinates and radius");
      return;
    }
    setLoading(true);
    try {
      // API call to the incident/within-radius/ endpoint
      const res = await fetch(`${API_BASE}/incident/within-radius/?latitude=${lat}&longitude=${lng}&distance=${radius}`);
      if (!res.ok) throw new Error();
      const incidents = await res.json();
      setData(incidents);
      toast.success(`Analysis complete: Found ${incidents.length} incidents`);
    } catch {
      toast.error("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for Recharts
  const chartData = data.reduce((acc: any[], curr) => {
    const existing = acc.find(i => i.name === curr.incident_type);
    if (existing) existing.value += 1;
    else acc.push({ name: curr.incident_type, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      {/* Header based on Image 1 */}
      <header className="border-b border-white/[0.06] p-4 flex items-center gap-4 sticky top-0 bg-[#080b10]/95 backdrop-blur-md z-50">
        <Link to="/"><ArrowLeft className="w-5 h-5 text-white/40 hover:text-white transition-colors" /></Link>
        <h1 className="text-sm font-bold uppercase tracking-wider">CCTV Infrastructure Planner</h1>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Main Input Box based on Image 1 */}
        <section className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] shadow-2xl space-y-8">
          
          {/* Custom Checkbox */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="gps-toggle"
              checked={useCurrentLoc}
              onChange={(e) => setUseCurrentLoc(e.target.checked)}
              className="w-4 h-4 rounded bg-red-600 accent-red-600 cursor-pointer" 
            />
            <label htmlFor="gps-toggle" className="text-xs font-medium text-white/70 cursor-pointer">
              Use my current GPS location
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Latitude */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Center Latitude</label>
              <input 
                type="number" 
                step="any"
                value={lat}
                disabled={useCurrentLoc}
                onChange={(e) => setLat(e.target.value)}
                placeholder="28.825045"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 disabled:opacity-40 transition-all font-mono" 
              />
            </div>

            {/* Longitude */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Center Longitude</label>
              <input 
                type="number" 
                step="any"
                value={lng}
                disabled={useCurrentLoc}
                onChange={(e) => setLng(e.target.value)}
                placeholder="77.169400"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 disabled:opacity-40 transition-all font-mono" 
              />
            </div>

            {/* NEW: Radius Box (Distance Variable) */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Radius (KM)</label>
              <input 
                type="number" 
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="5"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-mono" 
              />
            </div>

            {/* Generate Button based on Image 1 */}
            <button 
              onClick={fetchAnalysis} 
              disabled={loading}
              className="bg-[#e63946] hover:bg-red-500 h-[58px] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-red-900/20 px-8"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Activity className="w-4 h-4" /> Generate Analysis</>}
            </button>
          </div>
        </section>

        {/* Charts Section */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-1000">
            {/* Bar Chart */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-[450px]">
              <div className="flex items-center gap-2 mb-8">
                <BarChart3 className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Incident Density</h3>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background: '#0a0d12', border: '1px solid #ffffff10', borderRadius: '12px'}} />
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-[450px]">
              <div className="flex items-center gap-2 mb-8">
                <PieIcon className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Hazard Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4">
                 {chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                       <div className="w-2 h-2 rounded-full" style={{background: COLORS[i % COLORS.length]}} />
                       {d.name}: {d.value}
                    </div>
                 ))}
              </div>
            </div>
          </div>
        ) : !loading && (
          <div className="h-[400px] flex flex-col items-center justify-center text-white/5 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
             <MapPin className="w-12 h-12 mb-4 opacity-50" />
             <p className="text-sm font-medium">Scan non-CCTV areas to analyze reported accident patterns</p>
          </div>
        )}
      </main>
    </div>
  );
}