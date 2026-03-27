import { useState, useEffect } from "react";
import { AlertTriangle, Flame, Car, Construction, Activity, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  severity?: "default" | "critical" | "warning" | "success";
}

const severityStyles = {
  default: "border-border bg-card",
  critical: "border-destructive/30 bg-destructive/5 glow-destructive",
  warning: "border-warning/30 bg-warning/5 glow-warning",
  success: "border-success/30 bg-success/5 glow-success",
};

const iconBgStyles = {
  default: "bg-primary/10 text-primary",
  critical: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
};

export function StatCard({ title, value, change, trend, icon, severity = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${severityStyles[severity]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`rounded-md p-2 ${iconBgStyles[severity]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-foreground">{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1 text-xs">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-destructive" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-success" />}
          <span className={trend === "up" ? "text-destructive" : trend === "down" ? "text-success" : "text-muted-foreground"}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

export function StatsGrid() {
  const [stats, setStats] = useState({
    totalIncidents: 0, // Changed from activeIncidents
    fireSmoke: 0,
    accidents: 0,
    recentChange: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentRes, cameraIncidentRes] = await Promise.all([
          fetch('http://localhost:8000/incident/get-all/'),
          fetch('http://localhost:8000/camera-incident/get-all/')
        ]);

        const incidentData = await incidentRes.json();
        const cameraIncidentData = await cameraIncidentRes.json();

        if (incidentData.success && cameraIncidentData.success) {
          const allIncidents = incidentData.incidents || [];
          const allCameraIncidents = cameraIncidentData.camera_incidents || [];

          // 1. Calculate Combined Total
          const totalCount = allIncidents.length + allCameraIncidents.length;

          // 2. Count Fire/Smoke from general Incidents (User Reports)
          const fireCount = allIncidents.filter((i: any) =>
            i.incident_type?.toLowerCase().includes("fire") ||
            i.incident_type?.toLowerCase().includes("smoke")
          ).length;

          // 3. Count Accidents from BOTH sources
          const cameraAccidents = allCameraIncidents.filter((i: any) => {
            const type = i.incident_type?.toLowerCase();
            return type === 'c' || type === 'cf' || type === 'cs' || type === 'cfs';
          }).length;

          const reportedAccidents = allIncidents.filter((i: any) =>
            i.incident_type?.toLowerCase().includes("accident") ||
            i.incident_type?.toLowerCase().includes("crash")
          ).length;

          setStats({
            totalIncidents: totalCount, // Using the combined total
            fireSmoke: fireCount,
            accidents: cameraAccidents + reportedAccidents,
            recentChange: `+${totalCount} detected`
          });
        }
      } catch (error) {
        console.error("Error aggregating frontend stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Incidents" // Changed Label
        value={stats.totalIncidents}
        change={stats.recentChange}
        trend="up"
        icon={<AlertTriangle className="w-4 h-4" />}
        severity="critical"
      />
      <StatCard
        title="Fire / Smoke"
        value={stats.fireSmoke}
        change="Live monitoring"
        trend="neutral"
        icon={<Flame className="w-4 h-4" />}
        severity="warning"
      />
      <StatCard
        title="Crashes / Accidents"
        value={stats.accidents}
        change="Total AI detections"
        trend="up"
        icon={<Activity className="w-4 h-4" />}
        severity="critical"
      />
    </div>
  );
}