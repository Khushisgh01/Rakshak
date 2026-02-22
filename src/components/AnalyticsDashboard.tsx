import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const hourlyData = [
  { hour: "00", incidents: 2 }, { hour: "02", incidents: 1 }, { hour: "04", incidents: 0 },
  { hour: "06", incidents: 3 }, { hour: "08", incidents: 8 }, { hour: "10", incidents: 5 },
  { hour: "12", incidents: 4 }, { hour: "14", incidents: 6 }, { hour: "16", incidents: 9 },
  { hour: "18", incidents: 11 }, { hour: "20", incidents: 7 }, { hour: "22", incidents: 3 },
];

const typeData = [
  { name: "Collisions", value: 42, color: "hsl(0, 72%, 55%)" },
  { name: "Fire/Smoke", value: 15, color: "hsl(38, 92%, 55%)" },
  { name: "Stalled", value: 28, color: "hsl(210, 80%, 55%)" },
  { name: "Other", value: 8, color: "hsl(220, 15%, 40%)" },
];

const weeklyTrend = [
  { day: "Mon", count: 18 }, { day: "Tue", count: 22 }, { day: "Wed", count: 15 },
  { day: "Thu", count: 25 }, { day: "Fri", count: 31 }, { day: "Sat", count: 19 },
  { day: "Sun", count: 12 },
];

export function AnalyticsDashboard() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Detection Analytics</h3>
        <p className="text-xs text-muted-foreground mt-1">Last 7 days — periodic analysis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Hourly Distribution */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Incidents by Hour</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hourlyData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "hsl(210, 20%, 85%)" }}
              />
              <Bar dataKey="incidents" fill="hsl(187, 80%, 50%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-muted-foreground mb-2 self-start">By Type</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
            {typeData.map(d => (
              <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Weekly Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 6, fontSize: 12 }}
              />
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="hsl(187, 80%, 50%)" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
