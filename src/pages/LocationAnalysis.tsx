import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, BarChart3, Loader2, Activity, PieChart as PieIcon, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

// Your Django Backend URL
const API_BASE = "http://127.0.0.1:8000";

export default function LocationAnalysis() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("5"); 
  const [timeRange, setTimeRange] = useState("all"); // weekly, monthly, or all
  const [useCurrentLoc, setUseCurrentLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [analysisMeta, setAnalysisMeta] = useState<any>(null);

  // GPS Auto-fill logic
  useEffect(() => {
    if (useCurrentLoc) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          toast.success("Current GPS location synced");
        },
        (err) => {
          toast.error("Location access denied: " + err.message);
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
      // API call now includes time_range parameter
      // Your backend logic handles the auto-deletion of >30 day old records
      const url = `${API_BASE}/incident/within-radius/?latitude=${lat}&longitude=${lng}&distance_km=${radius}&time_range=${timeRange}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.success) {
        setIncidents(result.incidents);
        setAnalysisMeta({
            count: result.incident_count,
            distance: result.distance_km,
            period: timeRange
        });
        toast.success(`Analysis complete: ${result.incident_count} records found`);
      } else {
        throw new Error(result.error || "Failed to fetch");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for Recharts
  const chartData = incidents.reduce((acc: any[], curr) => {
    const type = curr.incident_type || "unknown";
    const existing = acc.find(i => i.name === type);
    if (existing) {
        existing.value += 1;
    } else {
        acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <header className="border-b border-white/[0.06] p-4 flex items-center gap-4 sticky top-0 bg-[#080b10]/95 backdrop-blur-md z-50">
        <Link to="/"><ArrowLeft className="w-5 h-5 text-white/40 hover:text-white transition-colors" /></Link>
        <h1 className="text-sm font-bold uppercase tracking-wider">CCTV Infrastructure Planner</h1>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Input Section */}
        <section className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] shadow-2xl space-y-8">
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            {/* Latitude */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Center Latitude</label>
              <input 
                type="number" step="any" value={lat} disabled={useCurrentLoc}
                onChange={(e) => setLat(e.target.value)} placeholder="28.8250"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 disabled:opacity-40 transition-all font-mono" 
              />
            </div>

            {/* Longitude */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Center Longitude</label>
              <input 
                type="number" step="any" value={lng} disabled={useCurrentLoc}
                onChange={(e) => setLng(e.target.value)} placeholder="77.1694"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 disabled:opacity-40 transition-all font-mono" 
              />
            </div>

            {/* Radius */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Radius (KM)</label>
              <input 
                type="number" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="5"
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-mono" 
              />
            </div>

            {/* Time Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-widest block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Time Period
              </label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full bg-[#0c0f16] border border-white/10 p-4 rounded-xl outline-none focus:border-red-500/50 font-mono text-sm text-white appearance-none cursor-pointer"
              >
                <option value="all" className="bg-[#0c0f16]">Total Lifetime</option>
                <option value="week" className="bg-[#0c0f16]">Past 7 Days</option>
                <option value="month" className="bg-[#0c0f16]">Past 30 Days</option>
              </select>
            </div>

            {/* Action Button */}
            <button 
              onClick={fetchAnalysis} disabled={loading}
              className="bg-[#e63946] hover:bg-red-500 h-[58px] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-red-900/20 px-8"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Activity className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </section>

        {/* Charts and Visuals */}
        {incidents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Bar Chart */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-[450px]">
              <div className="flex items-center gap-2 mb-8">
                <BarChart3 className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Incident Density ({analysisMeta?.period === 'all' ? 'Total' : analysisMeta?.period})
                </h3>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fill: '#666', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#666', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    contentStyle={{background: '#0a0d12', border: '1px solid #ffffff10', borderRadius: '12px'}} 
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-[450px]">
              <div className="flex items-center gap-2 mb-8">
                <PieIcon className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Risk Distribution</h3>
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
                       {d.name.toUpperCase()}: {d.value}
                    </div>
                 ))}
              </div>
            </div>
          </div>
        ) : !loading && (
          <div className="h-[400px] flex flex-col items-center justify-center text-white/5 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
             <MapPin className="w-12 h-12 mb-4 opacity-50" />
             <p className="text-sm font-medium">No incidents recorded in this area for the selected time period.</p>
          </div>
        )}
      </main>
    </div>
  );
}