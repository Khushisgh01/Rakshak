// import { ArrowLeft, Clock, BarChart3, MapPin, Activity } from "lucide-react";
// import { Link } from "react-router-dom";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
// } from "recharts";
// import { useState, useEffect } from "react";

// // --- Helper: SQLite Date Parser ---
// const parseBackendDate = (dateStr: string) => {
//   if (!dateStr) return null;
//   const cleanStr = dateStr.replace(' ', 'T').split('.')[0];
//   const date = new Date(cleanStr);
//   return isNaN(date.getTime()) ? null : date;
// };

// // --- Incident Mapping Logic ---
// const incidentMapper: Record<string, string> = {
//   "c": "Crash",
//   "f": "Fire",
//   "s": "Smoke",
//   "cf": "Crash & Fire",
//   "cs": "Crash & Smoke",
//   "fs": "Fire & Smoke",
//   "cfs": "Crash, Fire & Smoke",
//   "o": "Other Incident",
// };

// const getCleanName = (code: string) => {
//   if (!code) return "Unknown";
//   const cleanCode = code.toLowerCase().trim();
//   return incidentMapper[cleanCode] || code;
// };

// // --- Data Processing Utilities ---
// const processHourlyData = (incidents: any[]) => {
//   const counts = new Array(24).fill(0);
//   incidents.forEach(inc => {
//     const date = parseBackendDate(inc.date_created);
//     if (date) {
//       const hour = date.getHours();
//       counts[hour]++;
//     }
//   });

//   return counts.map((count, hour) => ({
//     hour: `${hour.toString().padStart(2, '0')}:00`,
//     incidents: count
//   }));
// };

// const processTypeData = (incidents: any[]) => {
//   const types: Record<string, number> = {};
//   incidents.forEach(inc => {
//     const name = inc.incident_type;
//     types[name] = (types[name] || 0) + 1;
//   });
//   const colors = ["hsl(0, 72%, 55%)", "hsl(38, 92%, 55%)", "hsl(187, 80%, 50%)", "hsl(210, 80%, 55%)", "hsl(220, 15%, 40%)"];
//   return Object.keys(types).map((name, i) => ({
//     name,
//     value: types[name],
//     color: colors[i % colors.length]
//   }));
// };

// const tooltipStyle = {
//   backgroundColor: "hsl(220, 18%, 10%)",
//   border: "1px solid hsl(220, 15%, 18%)",
//   borderRadius: "6px",
//   fontSize: "12px"
// };

// const getReadableLocation = async (lat: number, lon: number): Promise<string> => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`
//     );
//     const data = await response.json();
//     const addressParts = data.display_name.split(',');
//     return addressParts.length > 1
//       ? `${addressParts[0].trim()}, ${addressParts[1].trim()}`
//       : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
//   } catch (error) {
//     return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
//   }
// };

// const Analytics = () => {
//   const [manualIncidents, setManualIncidents] = useState<any[]>([]);
//   const [cameraIncidents, setCameraIncidents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [resManual, resCamera] = await Promise.all([
//           fetch('http://localhost:8000/incident/get-all/'),
//           fetch('http://localhost:8000/camera-incident/get-all/')
//         ]);

//         const dataManual = await resManual.json();
//         const dataCamera = await resCamera.json();

//         const manualMapped = await Promise.all((dataManual.incidents || []).map(async (inc: any) => ({
//           ...inc,
//           incident_type: getCleanName(inc.incident_type),
//           display_location: await getReadableLocation(inc.latitude, inc.longitude),
//           source_name: 'Public Citizen Report'
//         })));

//         const cameraMapped = await Promise.all((dataCamera.camera_incidents || []).map(async (inc: any) => ({
//           ...inc,
//           incident_type: getCleanName(inc.incident_type),
//           display_location: await getReadableLocation(
//             inc.camera_details?.latitude,
//             inc.camera_details?.longitude
//           ),
//           source_name: `AI Camera #${inc.camera_details?.id || '?'}`
//         })));

//         setManualIncidents(manualMapped);
//         setCameraIncidents(cameraMapped);
//         setLoading(false);
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return (
//     <div className="min-h-screen bg-background flex items-center justify-center">
//       <div className="text-center space-y-4">
//         <Activity className="w-10 h-10 text-primary animate-pulse mx-auto" />
//         <p className="text-muted-foreground font-mono text-sm uppercase tracking-tighter">Syncing Database...</p>
//       </div>
//     </div>
//   );

//   // Process data separately for charts
//   const cameraHourly = processHourlyData(cameraIncidents);
//   const manualHourly = processHourlyData(manualIncidents);
//   const cameraTypes = processTypeData(cameraIncidents);
//   const manualTypes = processTypeData(manualIncidents);

//   const combinedIncidents = [...manualIncidents, ...cameraIncidents].sort((a, b) =>
//     new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
//   );

//   return (
//     <div className="min-h-screen bg-background bg-grid">
//       <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
//               <ArrowLeft className="w-4 h-4 text-muted-foreground" />
//             </Link>
//             <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center glow-primary">
//               <BarChart3 className="w-4 h-4 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold text-foreground tracking-tight">Analytics Dashboard</h1>
//               <p className="text-[10px] text-muted-foreground font-mono uppercase">Separated Stream Analytics</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
//             <Clock className="w-3 h-3" />
//             <span>Refreshed: {new Date().toLocaleTimeString()}</span>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-12">
//         {/* SECTION 1: AI CAMERA DETECTIONS */}
//         <section className="space-y-6">
//           <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
//             <h2 className="text-lg font-bold uppercase tracking-tight">AI Camera Analytics</h2>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
//               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Camera Detection: Hourly Distribution</h3>
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={cameraHourly}>
//                   <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
//                   <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
//                   <Bar dataKey="incidents" fill="hsl(187, 80%, 50%)" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="rounded-lg border border-border bg-card p-4">
//               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Camera: Incident Types</h3>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie data={cameraTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
//                     {cameraTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                   <Tooltip contentStyle={tooltipStyle} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-2 mt-4">
//                 {cameraTypes.map(d => (
//                   <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted-foreground">
//                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
//                     {d.name} ({d.value})
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* SECTION 2: PUBLIC CITIZEN REPORTS */}
//         <section className="space-y-6">
//           <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-4">
//             <h2 className="text-lg font-bold uppercase tracking-tight">Citizen Reporting Analytics</h2>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
//               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Public Reports: Hourly Distribution</h3>
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={manualHourly}>
//                   <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
//                   <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
//                   <Bar dataKey="incidents" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="rounded-lg border border-border bg-card p-4">
//               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Public: Incident Types</h3>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie data={manualTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
//                     {manualTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                   <Tooltip contentStyle={tooltipStyle} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-2 mt-4">
//                 {manualTypes.map(d => (
//                   <div key={d.name} className="flex items-center gap-2 text-[10px] text-muted-foreground">
//                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
//                     {d.name} ({d.value})
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Combined Event Log */}
//         <div className="rounded-lg border border-border bg-card p-4">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historical Event Log (Combined)</h3>
//             <div className="px-2 py-1 rounded bg-secondary text-[10px] text-muted-foreground font-mono font-bold">TOTAL: {combinedIncidents.length}</div>
//           </div>
//           <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
//             <table className="w-full text-left border-collapse">
//               <thead className="sticky top-0 bg-card z-10">
//                 <tr className="text-muted-foreground border-b border-border text-[10px] uppercase tracking-widest font-bold">
//                   <th className="pb-3 px-2">Incident</th>
//                   <th className="pb-3 px-2">Source</th>
//                   <th className="pb-3 px-2 text-center">Location</th>
//                   <th className="pb-3 px-2">Timestamp</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[11px] font-mono">
//                 {combinedIncidents.map((inc, idx) => (
//                   <tr key={inc.id || idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
//                     <td className="py-3 px-2">
//                       <span className="flex items-center gap-2">
//                         <div className={`w-1.5 h-1.5 rounded-full ${
//                           inc.incident_type.toLowerCase().includes('fire') ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 
//                           inc.incident_type.toLowerCase().includes('crash') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-primary'
//                         }`} />
//                         <span className="font-bold uppercase">{inc.incident_type}</span>
//                       </span>
//                     </td>
//                     <td className="py-3 px-2 text-primary font-bold">{inc.source_name}</td>
//                     <td className="py-3 px-2 text-muted-foreground text-center">
//                       <span className="flex items-center justify-center gap-1 opacity-90 text-foreground font-semibold">
//                         <MapPin className="w-3 h-3 text-red-500" />
//                         {inc.display_location}
//                       </span>
//                     </td>
//                     <td className="py-3 px-2 opacity-80">{new Date(inc.date_created).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Analytics;
import { ArrowLeft, Clock, BarChart3, MapPin, Activity, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { useState, useEffect } from "react";

// --- Helper: SQLite Date Parser ---
const parseBackendDate = (dateStr: string) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.replace(' ', 'T').split('.')[0];
  const date = new Date(cleanStr);
  return isNaN(date.getTime()) ? null : date;
};

// --- Incident Mapping Logic ---
const incidentMapper: Record<string, string> = {
  "c": "Crash", "f": "Fire", "s": "Smoke", "cf": "Crash & Fire",
  "cs": "Crash & Smoke", "fs": "Fire & Smoke", "cfs": "Crash, Fire & Smoke", "o": "Other"
};

const getCleanName = (code: string) => {
  if (!code) return "Unknown";
  const cleanCode = code.toLowerCase().trim();
  return incidentMapper[cleanCode] || code;
};

const processHourlyData = (incidents: any[]) => {
  const counts = new Array(24).fill(0);
  incidents.forEach(inc => {
    const date = new Date(inc.date_created.replace(' ', 'T').split('.')[0]); //
    if (!isNaN(date.getTime())) counts[date.getHours()]++;
  });
  // Format labels to 12h or 24h as needed
  return counts.map((count, hour) => ({ 
    hour: `${hour.toString().padStart(2, '0')}:00`, 
    count 
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
  return days.map(day => ({ day, count: counts[day] }));
};

const processMonthlyData = (incidents: any[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts: Record<string, number> = {};
  months.forEach(m => counts[m] = 0);
  incidents.forEach(inc => {
    const date = parseBackendDate(inc.date_created);
    if (date) counts[months[date.getMonth()]]++;
  });
  return months.map(month => ({ month, count: counts[month] }));
};

const processTypeData = (incidents: any[]) => {
  const types: Record<string, number> = {};
  incidents.forEach(inc => {
    const name = inc.incident_type;
    types[name] = (types[name] || 0) + 1;
  });
  const colors = ["hsl(187, 80%, 50%)", "hsl(0, 72%, 55%)", "hsl(38, 92%, 55%)", "hsl(210, 80%, 55%)"];
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
  fontSize: "12px",
  color: "#fff"
};

const getReadableLocation = async (lat: number, lon: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
    const data = await response.json();
    return data.display_name.split(',')[0] || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch { return `${lat.toFixed(2)}, ${lon.toFixed(2)}`; }
};

const Analytics = () => {
  const [manualIncidents, setManualIncidents] = useState<any[]>([]);
  const [cameraIncidents, setCameraIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeparatedData = async () => {
      try {
        const [resManual, resCamera] = await Promise.all([
          fetch('http://localhost:8000/incident/get-all/'),
          fetch('http://localhost:8000/camera-incident/get-all/')
        ]);
        const dataManual = await resManual.json();
        const dataCamera = await resCamera.json();

        const manualMapped = await Promise.all((dataManual.incidents || []).map(async (inc: any) => ({
          ...inc, 
          incident_type: getCleanName(inc.incident_type), 
          source_name: 'Public Report',
          display_location: await getReadableLocation(inc.latitude, inc.longitude)
        })));

        const cameraMapped = await Promise.all((dataCamera.camera_incidents || []).map(async (inc: any) => ({
          ...inc, 
          incident_type: getCleanName(inc.incident_type), 
          source_name: 'AI Camera',
          display_location: await getReadableLocation(inc.camera_details?.latitude, inc.camera_details?.longitude)
        })));

        setManualIncidents(manualMapped);
        setCameraIncidents(cameraMapped);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchSeparatedData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Activity className="w-12 h-12 animate-pulse text-primary" />
      <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Aggregating Data...</p>
    </div>
  );

  const combined = [...manualIncidents, ...cameraIncidents].sort((a, b) => 
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b p-4 flex justify-between items-center sticky top-0 bg-card/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-secondary rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm tracking-tight">Analytics Dashboard</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">Multi-Source Incident Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleTimeString()}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-16">
        
        {/* --- AI CAMERA SECTION --- */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tighter">AI Camera Surveillance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ChartCard title="Hourly Activity" data={processHourlyData(cameraIncidents)} type="bar" showXAxis={true} color="hsl(187, 80%, 50%)" />
            <ChartCard title="Incident Mix" data={processTypeData(cameraIncidents)} type="pie" />
            <ChartCard title="Weekly Volume" data={processWeeklyTrend(cameraIncidents)} type="area" color="hsl(187, 80%, 50%)" />
            <ChartCard title="Monthly Trend" data={processMonthlyData(cameraIncidents)} type="line" color="hsl(187, 80%, 50%)" />
          </div>
        </section>

        {/* --- PUBLIC REPORTS SECTION --- */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4">
            <Users className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Citizen Public Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ChartCard title="Hourly Reporting" data={processHourlyData(manualIncidents)} type="bar" showXAxis={true} color="hsl(38, 92%, 55%)" />
            <ChartCard title="Reported Types" data={processTypeData(manualIncidents)} type="pie" />
            <ChartCard title="Weekly Submissions" data={processWeeklyTrend(manualIncidents)} type="area" color="hsl(38, 92%, 55%)" />
            <ChartCard title="Monthly Scale" data={processMonthlyData(manualIncidents)} type="line" color="hsl(38, 92%, 55%)" />
          </div>
        </section>

        {/* --- HISTORICAL DATA TABLE --- */}
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight uppercase">Historical Event Log</h2>
            <div className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold font-mono">
              TOTAL RECORDS: {combined.length}
            </div>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-muted-foreground font-mono uppercase text-[10px]">
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Source</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {combined.map((inc, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold">
                        <span className={`inline-flex items-center gap-2 ${
                          inc.incident_type.toLowerCase().includes('fire') ? 'text-orange-500' : 
                          inc.incident_type.toLowerCase().includes('crash') ? 'text-red-500' : 'text-primary'
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                          {inc.incident_type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{inc.source_name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{inc.display_location}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(inc.date_created).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// --- Reusable Chart Card Component ---
const ChartCard = ({ title, data, type, color }: any) => (
  <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">{title}</h3>
    <ResponsiveContainer width="100%" height={180}>
      {type === "bar" ? (
        <BarChart data={data}>
          {/* Removed 'hide' and added styling to display hours */}
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
            axisLine={false} 
            tickLine={false}
            interval={2} // Shows every 2nd or 3rd hour to prevent crowding
          />
          <Tooltip 
            contentStyle={tooltipStyle} 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            labelClassName="font-mono text-[10px]"
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : type === "area" ? (
        <AreaChart data={data}>
          <XAxis dataKey="day" tick={{fontSize: 9, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} />
        </AreaChart>
      ) : type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="hsla(var(--border), 0.5)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{fontSize: 9, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={3} dot={{r: 3, fill: color, strokeWidth: 0}} />
        </LineChart>
      ) : (
        <PieChart>
          <Pie data={data} innerRadius={55} outerRadius={75} dataKey="value" stroke="none" paddingAngle={4}>
            {data.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      )}
    </ResponsiveContainer>
    {type === "pie" && (
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
        {data.map((d: any) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    )}
  </div>
);
export default Analytics;