import { ArrowLeft, Clock, BarChart3, MapPin, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { useState, useEffect } from "react";

// --- Helper: SQLite Date Parser ---
// Fixes "Invalid Date" errors by handling SQLite's space separator and micro-seconds
const parseBackendDate = (dateStr: string) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.replace(' ', 'T').split('.')[0]; 
  const date = new Date(cleanStr);
  return isNaN(date.getTime()) ? null : date;
};

// --- Data Processing Utilities ---
const processHourlyData = (incidents: any[]) => {
  const counts = new Array(24).fill(0);
  incidents.forEach(inc => {
    const date = parseBackendDate(inc.date_created);
    if (date) counts[date.getHours()]++;
  });
  return counts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    incidents: count
  }));
};

const processWeeklyTrend = (incidents: any[]) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts: Record<string, number> = {};
  days.forEach(d => counts[d] = 0);
  incidents.forEach(inc => {
    const date = parseBackendDate(inc.date_created);
    if (date) counts[days[date.getDay()]]++;
  });
  return days.map(day => ({ day, incidents: counts[day] }));
};

const processMonthlyData = (incidents: any[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts: Record<string, number> = {};
  months.forEach(m => counts[m] = 0);
  incidents.forEach(inc => {
    const date = parseBackendDate(inc.date_created);
    if (date) counts[months[date.getMonth()]]++;
  });
  return months.map(month => ({ month, incidents: counts[month] }));
};

const processTypeData = (incidents: any[]) => {
  const types: Record<string, number> = {};
  incidents.forEach(inc => {
    types[inc.incident_type] = (types[inc.incident_type] || 0) + 1;
  });
  const colors = ["hsl(0, 72%, 55%)", "hsl(38, 92%, 55%)", "hsl(210, 80%, 55%)", "hsl(220, 15%, 40%)"];
  return Object.keys(types).map((name, i) => ({
    name,
    value: types[name],
    color: colors[i % colors.length]
  }));
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 15%, 18%)",
  borderRadius: "6px",
  fontSize: "12px"
};

const Analytics = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const [resManual, resCamera] = await Promise.all([
          fetch('http://localhost:8000/incident/get-all/'),
          fetch('http://localhost:8000/camera-incident/get-all/')
        ]);

        const dataManual = await resManual.json();
        const dataCamera = await resCamera.json();

        // Normalize Incident table data
        const manualMapped = (dataManual.incidents || []).map((inc: any) => ({
          ...inc,
          display_lat: inc.latitude,
          display_lon: inc.longitude,
          source_name: 'Public Citizen Report' 
        }));

        // Normalize Camera_Incident data with descriptive names
        const cameraMapped = (dataCamera.camera_incidents || []).map((inc: any) => ({
          ...inc,
          display_lat: inc.camera_details?.latitude,
          display_lon: inc.camera_details?.longitude,
          source_name: `AI Surveillance Camera #${inc.camera_details?.id || '?'}`
        }));

        const combined = [...manualMapped, ...cameraMapped].sort((a, b) => 
          new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

        setIncidents(combined);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Activity className="w-10 h-10 text-primary animate-pulse mx-auto" />
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-tighter">Syncing Database...</p>
      </div>
    </div>
  );

  const hourlyData = processHourlyData(incidents);
  const typeData = processTypeData(incidents);
  const weeklyTrend = processWeeklyTrend(incidents);
  const monthlyData = processMonthlyData(incidents);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center glow-primary">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">Analytics Dashboard</h1>
              <p className="text-[10px] text-muted-foreground font-mono">HYBRID INCIDENT DATA STREAM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Row 1: Hourly and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Hourly Incident Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="incidents" fill="hsl(187, 80%, 50%)" radius={[4, 4, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Incident Breakdown by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {typeData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Weekly and Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Weekly Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="incidents" stroke="hsl(187, 80%, 50%)" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} name="Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 15%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="incidents" stroke="hsl(0, 72%, 55%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(0, 72%, 55%)" }} name="Incidents" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Logs Table */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unified Historical Logs</h3>
            <div className="px-2 py-1 rounded bg-secondary text-[10px] text-muted-foreground font-mono font-bold tracking-tighter">TOTAL ENTRIES: {incidents.length}</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="text-muted-foreground border-b border-border text-[10px] uppercase tracking-widest font-bold">
                  <th className="pb-3 px-2">Incident Type</th>
                  <th className="pb-3 px-2">Detection Source</th>
                  <th className="pb-3 px-2 text-center">Location (Lat/Lon)</th>
                  <th className="pb-3 px-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-mono">
                {incidents.map((inc, idx) => (
                  <tr key={inc.id || idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-2">
                      <span className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${inc.incident_type.toLowerCase().includes('fire') ? 'bg-orange-500' : 'bg-primary'}`} />
                        <span className="font-bold uppercase">{inc.incident_type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-primary font-bold">{inc.source_name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-center">
                      <span className="flex items-center justify-center gap-1 opacity-80"><MapPin className="w-3 h-3" />{inc.display_lat}, {inc.display_lon}</span>
                    </td>
                    <td className="py-3 px-2 opacity-80">{new Date(inc.date_created).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;