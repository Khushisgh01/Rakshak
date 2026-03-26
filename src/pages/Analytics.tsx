import { Shield, ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, Flame, Car, Zap, MapPin, Clock, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

const hourlyData = [
  { hour: "00", incidents: 2 }, { hour: "02", incidents: 1 },
  { hour: "04", incidents: 0 }, { hour: "06", incidents: 3 },
  { hour: "08", incidents: 8 }, { hour: "10", incidents: 5 },
  { hour: "12", incidents: 4 }, { hour: "14", incidents: 6 },
  { hour: "16", incidents: 9 }, { hour: "18", incidents: 11 },
  { hour: "20", incidents: 7 }, { hour: "22", incidents: 3 },
];

const typeData = [
  { name: "Collisions", value: 45, color: "hsl(0, 72%, 55%)" },
  { name: "Fire", value: 20, color: "hsl(38, 92%, 55%)" },
  { name: "Smoke", value: 25, color: "hsl(210, 80%, 55%)" },
  { name: "Others", value: 10, color: "hsl(220, 15%, 40%)" },
];

const weeklyTrend = [
  { day: "Mon", incidents: 18 },
  { day: "Tue", incidents: 22 },
  { day: "Wed", incidents: 15 },
  { day: "Thu", incidents: 25 },
  { day: "Fri", incidents: 31 },
  { day: "Sat", incidents: 19 },
  { day: "Sun", incidents: 12 },
];

const monthlyData = [
  { month: "Aug", incidents: 340 }, { month: "Sep", incidents: 290 },
  { month: "Oct", incidents: 380 }, { month: "Nov", incidents: 310 },
  { month: "Dec", incidents: 420 }, { month: "Jan", incidents: 360 },
  { month: "Feb", incidents: 142 },
];

const hotspotData = [
  { zone: "NH-48 Junction", incidents: 34 },
  { zone: "Ring Road Toll", incidents: 28 },
  { zone: "MG Flyover", incidents: 19 },
  { zone: "Industrial Phase II", incidents: 15 },
  { zone: "Bypass KM 8", incidents: 11 },
  { zone: "Service Road C", incidents: 7 },
];

const severityBadge: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  high: "bg-warning/15 text-warning",
  medium: "bg-info/15 text-info",
  low: "bg-muted text-muted-foreground",
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 15%, 18%)",
  borderRadius: 6,
  fontSize: 12,
};

const Analytics = () => {
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
              <p className="text-[10px] text-muted-foreground font-mono">INCIDENT ANALYSIS & INSIGHTS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Distribution */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Hourly Incidents</h3>
            <p className="text-xs text-muted-foreground mb-4">Total incidents detected — Today</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'transparent'}} />
                <Bar dataKey="incidents" fill="hsl(0, 72%, 55%)" radius={[2, 2, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incident Types */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Incident Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">By detection type — 7 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
              {typeData.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Weekly Incidents</h3>
            <p className="text-xs text-muted-foreground mb-4">Incident frequency trend — 7 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="areaGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="incidents" stroke="hsl(187, 80%, 50%)" fill="url(#areaGradAnalytics)" strokeWidth={2} name="Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Monthly Incidents</h3>
          <p className="text-xs text-muted-foreground mb-4">Long-term incident overview — Last 7 months</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="incidents" stroke="hsl(187, 80%, 50%)" strokeWidth={3} dot={{ fill: "hsl(187, 80%, 50%)", r: 4, strokeWidth: 2, stroke: "hsl(220, 18%, 10%)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hotspot Table */}
        {/* Hotspot Table */}
<div className="rounded-lg border border-border bg-card">
  <div className="p-4 border-b border-border">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Incident Hotspots</h3>
    <p className="text-xs text-muted-foreground mt-1">Zones ranked by incident frequency</p>
  </div>
  <div className="divide-y divide-border">
    {hotspotData.map((zone, i) => (
      <div key={zone.zone} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
        <span className="text-lg font-bold font-mono text-muted-foreground w-8 text-center">#{i + 1}</span>
        <MapPin className="w-4 h-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{zone.zone}</p>
        </div>
        {/* Only the incident count remains on the right */}
        <span className="font-mono text-sm font-bold text-foreground pr-2">{zone.incidents} Incidents</span>
      </div>
    ))}
  </div>
</div>
      </main>
    </div>
  );
};

export default Analytics;