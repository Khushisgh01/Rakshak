import { Shield, ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, Flame, Car, Zap, MapPin, Clock, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const hourlyData = [
  { hour: "00", incidents: 2, resolved: 2 }, { hour: "02", incidents: 1, resolved: 1 },
  { hour: "04", incidents: 0, resolved: 0 }, { hour: "06", incidents: 3, resolved: 2 },
  { hour: "08", incidents: 8, resolved: 5 }, { hour: "10", incidents: 5, resolved: 4 },
  { hour: "12", incidents: 4, resolved: 3 }, { hour: "14", incidents: 6, resolved: 5 },
  { hour: "16", incidents: 9, resolved: 6 }, { hour: "18", incidents: 11, resolved: 7 },
  { hour: "20", incidents: 7, resolved: 6 }, { hour: "22", incidents: 3, resolved: 3 },
];

const typeData = [
  { name: "Collisions", value: 42, color: "hsl(0, 72%, 55%)" },
  { name: "Fire/Smoke", value: 15, color: "hsl(38, 92%, 55%)" },
  { name: "Stalled", value: 28, color: "hsl(210, 80%, 55%)" },
  { name: "Explosions", value: 5, color: "hsl(280, 70%, 55%)" },
  { name: "Other", value: 8, color: "hsl(220, 15%, 40%)" },
];

const weeklyTrend = [
  { day: "Mon", incidents: 18, responseTime: 4.2 },
  { day: "Tue", incidents: 22, responseTime: 3.8 },
  { day: "Wed", incidents: 15, responseTime: 3.5 },
  { day: "Thu", incidents: 25, responseTime: 4.1 },
  { day: "Fri", incidents: 31, responseTime: 5.2 },
  { day: "Sat", incidents: 19, responseTime: 3.9 },
  { day: "Sun", incidents: 12, responseTime: 3.2 },
];

const monthlyData = [
  { month: "Aug", total: 340 }, { month: "Sep", total: 290 },
  { month: "Oct", total: 380 }, { month: "Nov", total: 310 },
  { month: "Dec", total: 420 }, { month: "Jan", total: 360 },
  { month: "Feb", total: 142 },
];

const hotspotData = [
  { zone: "NH-48 Junction", incidents: 34, severity: "critical" },
  { zone: "Ring Road Toll", incidents: 28, severity: "critical" },
  { zone: "MG Flyover", incidents: 19, severity: "high" },
  { zone: "Industrial Phase II", incidents: 15, severity: "high" },
  { zone: "Bypass KM 8", incidents: 11, severity: "medium" },
  { zone: "Service Road C", incidents: 7, severity: "low" },
];

const performanceData = [
  { metric: "Detection Speed", value: 92 },
  { metric: "Accuracy", value: 87 },
  { metric: "Response Time", value: 78 },
  { metric: "Coverage", value: 95 },
  { metric: "Uptime", value: 99 },
  { metric: "False Positive", value: 15 },
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
      {/* Header */}
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
              <p className="text-[10px] text-muted-foreground font-mono">PERIODIC ANALYSIS & INSIGHTS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Incidents (7d)</p>
            <p className="text-3xl font-bold font-mono text-foreground mt-2">142</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
              <TrendingUp className="w-3 h-3" /> +12% vs last week
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Response Time</p>
            <p className="text-3xl font-bold font-mono text-foreground mt-2">3.8<span className="text-lg text-muted-foreground">min</span></p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <TrendingDown className="w-3 h-3" /> -0.5min improvement
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detection Accuracy</p>
            <p className="text-3xl font-bold font-mono text-foreground mt-2">94.2<span className="text-lg text-muted-foreground">%</span></p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" /> +2.1% this month
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cameras Monitored</p>
            <p className="text-3xl font-bold font-mono text-foreground mt-2">248</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Activity className="w-3 h-3 text-success" /> 245 online
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Distribution */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Hourly Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Incidents vs Resolved — Today</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="incidents" fill="hsl(0, 72%, 55%)" radius={[2, 2, 0, 0]} name="Incidents" />
                <Bar dataKey="resolved" fill="hsl(142, 60%, 45%)" radius={[2, 2, 0, 0]} name="Resolved" />
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Weekly Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Incidents & avg response time</p>
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
                <Line type="monotone" dataKey="responseTime" stroke="hsl(38, 92%, 55%)" strokeWidth={2} dot={false} name="Resp. Time (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">Monthly Overview</h3>
            <p className="text-xs text-muted-foreground mb-4">Total incidents — last 7 months</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="hsl(187, 80%, 50%)" strokeWidth={2} dot={{ fill: "hsl(187, 80%, 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Performance Radar */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-1">AI System Performance</h3>
            <p className="text-xs text-muted-foreground mb-4">Detection engine metrics</p>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="hsl(220, 15%, 18%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Performance" dataKey="value" stroke="hsl(187, 80%, 50%)" fill="hsl(187, 80%, 50%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspot Table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Incident Hotspots</h3>
            <p className="text-xs text-muted-foreground mt-1">Top flagged zones — ranked by frequency</p>
          </div>
          <div className="divide-y divide-border">
            {hotspotData.map((zone, i) => (
              <div key={zone.zone} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
                <span className="text-lg font-bold font-mono text-muted-foreground w-8 text-center">#{i + 1}</span>
                <MapPin className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{zone.zone}</p>
                </div>
                <span className="font-mono text-sm font-bold text-foreground">{zone.incidents}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${severityBadge[zone.severity]}`}>
                  {zone.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
