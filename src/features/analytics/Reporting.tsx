"use client";

import React, { useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, Users, HardDrive, CheckCircle, Download, 
  Filter, Sparkles, ArrowUpRight, Lock 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const analyticsDataByRange: Record<string, {
  activity: { name: string; tasks: number; docs: number }[];
  storage: { name: string; used: number }[];
  kpis: {
    tasks: string;
    users: string;
    storage: string;
    score: string;
  };
}> = {
  "7D": {
    activity: [
      { name: "Mon", tasks: 14, docs: 6 },
      { name: "Tue", tasks: 22, docs: 9 },
      { name: "Wed", tasks: 18, docs: 7 },
      { name: "Thu", tasks: 28, docs: 12 },
      { name: "Fri", tasks: 35, docs: 18 },
      { name: "Sat", tasks: 12, docs: 4 },
      { name: "Sun", tasks: 8, docs: 2 },
    ],
    storage: [
      { name: "Day 1", used: 42 },
      { name: "Day 3", used: 44 },
      { name: "Day 5", used: 45 },
      { name: "Day 7", used: 45.8 },
    ],
    kpis: { tasks: "137", users: "168", storage: "45.8GB", score: "94/100" },
  },
  "30D": {
    activity: [
      { name: "Week 1", tasks: 92, docs: 34 },
      { name: "Week 2", tasks: 114, docs: 48 },
      { name: "Week 3", tasks: 138, docs: 56 },
      { name: "Week 4", tasks: 165, docs: 72 },
    ],
    storage: [
      { name: "Week 1", used: 25 },
      { name: "Week 2", used: 33 },
      { name: "Week 3", used: 40 },
      { name: "Week 4", used: 45.8 },
    ],
    kpis: { tasks: "509", users: "244", storage: "45.8GB", score: "91/100" },
  },
  "90D": {
    activity: [
      { name: "Month 1", tasks: 380, docs: 140 },
      { name: "Month 2", tasks: 460, docs: 195 },
      { name: "Month 3", tasks: 590, docs: 240 },
    ],
    storage: [
      { name: "Month 1", used: 18 },
      { name: "Month 2", used: 32 },
      { name: "Month 3", used: 45.8 },
    ],
    kpis: { tasks: "1,430", users: "385", storage: "45.8GB", score: "96/100" },
  },
};

export default function Reporting({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const { toast } = useToast();

  const currentData = analyticsDataByRange[timeRange];

  const handleExportCSV = () => {
    const csvHeader = "Period,Completed Tasks,Created Documents,Storage (GB)\n";
    const csvRows = currentData.activity
      .map((row, idx) => {
        const storageVal = currentData.storage[idx]?.used || 45.8;
        return `${row.name},${row.tasks},${row.docs},${storageVal}`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus-analytics-${timeRange.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Export Complete",
      description: `Downloaded ${link.download}`,
      type: "success",
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-2 sm:p-4 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles size={13} /> Deep Business Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Analytics & Velocity Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track developer throughput, storage utilization, and organizational efficiency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range switcher */}
          <div className="flex bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
            {(["7D", "30D", "90D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setTimeRange(r);
                  toast({
                    title: `Range changed to ${r}`,
                    description: "Recalculated velocity metrics.",
                    type: "info",
                  });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Completed Tasks", value: currentData.kpis.tasks, trend: "+16.8%", icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Active Contributors", value: currentData.kpis.users, trend: "+8.2%", icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Storage Volume", value: currentData.kpis.storage, trend: "+2.4 GB", icon: HardDrive, color: "text-amber-500 bg-amber-500/10" },
          { label: "Velocity Score", value: currentData.kpis.score, trend: "+4 pts", icon: TrendingUp, color: "text-indigo-500 bg-indigo-500/10" },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{kpi.value}</h3>
              <p className="text-[11px] text-emerald-500 mt-2 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={13} />
                {kpi.trend} vs previous
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Two Large Analytic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Activity Over Time Chart */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sprint Throughput</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tasks completed vs documents authored</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Tasks
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Docs
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.activity} margin={{ top: 5, right: 15, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="docs" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Growth Area Chart */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Storage Volume (GB)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Encrypted cloud repository growth curve</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.storage} margin={{ top: 5, right: 15, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="storageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="used" stroke="#f59e0b" strokeWidth={3} fill="url(#storageFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Premium Feature Paywall: Time Tracking & Resource Allocation */}
      <div className="relative mt-2 pb-8 animate-fade-in-up">
        {/* Dummy Content Behind Blur */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs select-none relative overflow-hidden h-[300px]">
          {/* Faux Grid & Content */}
          <div className="flex justify-between items-center mb-6 opacity-30">
            <div>
              <h3 className="text-lg font-bold">Resource Allocation & Working Hours</h3>
              <p className="text-xs">Deep dive into individual contributor velocity.</p>
            </div>
            <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div className="space-y-4 opacity-30">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Glassmorphic Overlay Paywall */}
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Unlock Advanced Resource Tracking
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
              Track individual working hours, predictive burnout rates, and cross-team capacity planning with Enterprise Analytics.
            </p>
            <button
              onClick={() => {
                if (onNavigate) onNavigate("billing");
                else toast({ title: "Upgrade Required", description: "Redirecting to billing plans...", type: "info" });
              }}
              className="mt-6 px-6 py-3 bg-white text-slate-900 rounded-xl text-sm font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto btn-press"
            >
              <Sparkles size={16} className="text-amber-500" />
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
