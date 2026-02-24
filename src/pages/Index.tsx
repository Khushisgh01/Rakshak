import { Shield, Bell, Radio, Clock, Eye, BarChart3, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { StatsGrid } from "@/components/StatsGrid";
import { AlertFeed } from "@/components/AlertFeed";
import IncidentMap from "@/components/IncidentMap";
import { CCTVGrid } from "@/components/CCTVGrid";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { TrafficSignals } from "@/components/TrafficSignals";
import { ThemeToggle } from "@/components/ThemeToggle";


const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center glow-primary">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">RoadGuard AI</h1>
              <p className="text-[10px] text-muted-foreground font-mono">INTELLIGENT ROAD SAFETY PLATFORM</p>
            </div>
          </div>
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
            <Link to="/analytics" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-secondary transition-colors text-xs text-muted-foreground hover:text-foreground font-medium">
              <BarChart3 className="w-3 h-3" />
              Analytics
            </Link>
            <Link to="/alerts" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-secondary transition-colors text-xs text-muted-foreground hover:text-foreground font-medium">
              <AlertTriangle className="w-3 h-3" />
              Alerts
            </Link>
            {/* <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Eye className="w-3 h-3 text-primary" />
              <span>248 cameras active</span>
            </div> */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <button className="relative p-2 rounded-md hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-slow" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
              <Radio className="w-3 h-3" />
              Emergency
            </button>
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Stats */}
        <StatsGrid />

        {/* Map + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <IncidentMap />
          </div>
          <div className="lg:col-span-2 min-h-[400px]">
            <AlertFeed />
          </div>
        </div>

        {/* CCTV */}
        {/* <CCTVGrid /> */}

        {/* Analytics */}
        <AnalyticsDashboard />

        {/* Traffic Signals */}
        {/* <TrafficSignals /> */}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>RoadGuard AI v1.0 — Command Center</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
