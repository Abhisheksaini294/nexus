"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  Plus, TrendingUp, Users, CheckCircle2, DollarSign, 
  Trash2, GripVertical, Sparkles, ArrowUpRight, Clock,
  FileText, MessageSquare, FolderUp, CheckSquare, X, Lock
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface WidgetData {
  id: string;
  title: string;
  type: "chart" | "stat" | "bar" | "activity";
  value?: string;
  change?: string;
  subtitle?: string;
}

const initialWidgets: WidgetData[] = [
  { id: "w1", title: "Total Revenue", type: "stat", value: "$45,231.89", change: "+14.2%", subtitle: "vs last month" },
  { id: "w2", title: "Active Users", type: "stat", value: "2,840", change: "+8.1%", subtitle: "142 online right now" },
  { id: "w3", title: "Tasks Completed", type: "stat", value: "842", change: "+24.5%", subtitle: "96% on-time completion" },
  { id: "w4", title: "Revenue Trajectory", type: "chart" },
  { id: "w5", title: "Weekly Productivity", type: "bar" },
  { id: "w6", title: "Live Activity Feed", type: "activity" },
];

const timeRangeData: Record<string, { name: string; revenue: number; prev: number; tasks: number }[]> = {
  "7D": [
    { name: "Mon", revenue: 4200, prev: 3800, tasks: 12 },
    { name: "Tue", revenue: 5800, prev: 4200, tasks: 18 },
    { name: "Wed", revenue: 6100, prev: 5100, tasks: 15 },
    { name: "Thu", revenue: 7400, prev: 6300, tasks: 22 },
    { name: "Fri", revenue: 8900, prev: 7100, tasks: 30 },
    { name: "Sat", revenue: 4500, prev: 4000, tasks: 10 },
    { name: "Sun", revenue: 3800, prev: 3500, tasks: 6 },
  ],
  "30D": [
    { name: "Week 1", revenue: 18200, prev: 15000, tasks: 68 },
    { name: "Week 2", revenue: 22400, prev: 19100, tasks: 84 },
    { name: "Week 3", revenue: 26800, prev: 21500, tasks: 92 },
    { name: "Week 4", revenue: 31500, prev: 24800, tasks: 110 },
  ],
  "90D": [
    { name: "Month 1", revenue: 84000, prev: 72000, tasks: 280 },
    { name: "Month 2", revenue: 98500, prev: 83000, tasks: 340 },
    { name: "Month 3", revenue: 118200, prev: 94000, tasks: 410 },
  ],
  "1Y": [
    { name: "Q1", revenue: 245000, prev: 210000, tasks: 890 },
    { name: "Q2", revenue: 310000, prev: 260000, tasks: 1050 },
    { name: "Q3", revenue: 385000, prev: 315000, tasks: 1240 },
    { name: "Q4", revenue: 460000, prev: 370000, tasks: 1480 },
  ],
};

function SortableWidget({ 
  widget, 
  onRemove,
  chartData,
}: { 
  widget: WidgetData; 
  onRemove: (id: string) => void;
  chartData: any[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between transition-all duration-300 glow-card ${
        isDragging ? "opacity-40 ring-2 ring-indigo-500 z-30 shadow-2xl scale-[1.02]" : ""
      } ${widget.type === "chart" || widget.type === "bar" || widget.type === "activity" ? "col-span-1 lg:col-span-2 min-h-[300px]" : "min-h-[160px]"}`}
    >
      {/* Top Header of Widget */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button 
            {...attributes} 
            {...listeners} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-md opacity-40 group-hover:opacity-100 transition-opacity"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {widget.title}
          </h3>
        </div>

        <button
          onClick={() => onRemove(widget.id)}
          className="text-slate-400 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Remove widget"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Widget Content based on type */}
      {widget.type === "stat" && (
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {widget.value}
            </span>
            {widget.change && (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" />
                {widget.change}
              </span>
            )}
          </div>
          {widget.subtitle && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock size={12} />
              {widget.subtitle}
            </p>
          )}
        </div>
      )}

      {widget.type === "chart" && (
        <div className="flex-1 w-full h-[220px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRev)" />
              <Line type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {widget.type === "bar" && (
        <div className="flex-1 w-full h-[220px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
              />
              <Bar dataKey="tasks" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {widget.type === "activity" && (
        <div className="space-y-3 mt-2 flex-1 overflow-hidden">
          {[
            { user: "Alice Chen", action: "published Q3 Product Roadmap", time: "12m ago", icon: FileText, color: "text-blue-500 bg-blue-500/10" },
            { user: "Bob Builder", action: "completed 'Set up Prisma Schema'", time: "45m ago", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
            { user: "Sarah Connor", action: "uploaded 4 mockups to Design Assets", time: "2h ago", icon: FolderUp, color: "text-amber-500 bg-amber-500/10" },
            { user: "David Miller", action: "sent 3 messages in #engineering", time: "3h ago", icon: MessageSquare, color: "text-violet-500 bg-violet-500/10" },
          ].map((act, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg ${act.color} shrink-0`}>
                  <act.icon size={13} />
                </div>
                <p className="truncate text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{act.user}</span> {act.action}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">{act.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [widgets, setWidgets] = useState<WidgetData[]>(initialWidgets);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "1Y">("7D");
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nexus_dashboard_widgets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setWidgets(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved widgets");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus_dashboard_widgets", JSON.stringify(widgets));
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      toast({
        title: "Layout updated",
        description: "Widget arrangement saved.",
        type: "info",
      });
    }
  }

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    toast({
      title: "Widget removed",
      description: "Widget deleted from your dashboard view.",
      type: "info",
    });
  };

  const handleAddWidget = (type: "stat" | "chart" | "bar" | "activity", title: string, value?: string) => {
    const newWidget: WidgetData = {
      id: `w-${Date.now()}`,
      title,
      type,
      value: value || "$12,450.00",
      change: "+15.3%",
      subtitle: "Custom dashboard metric",
    };
    setWidgets((prev) => [newWidget, ...prev]);
    setIsAddWidgetOpen(false);
    toast({
      title: "Widget added",
      description: `${title} has been pinned to your dashboard.`,
      type: "success",
    });
  };

  if (!mounted) {
    return <div className="flex-1 flex items-center justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-3 border border-indigo-500/10">
            <Sparkles size={12} className="animate-pulse" /> Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1.5">
            Real-time analytics, ongoing projects, and organizational velocity.
          </p>
        </div>

        {/* Time Filter & Add Widget Button */}
        <div className="flex items-center gap-3">
          {/* Time range pills */}
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-800/40">
            {(["7D", "30D", "90D", "1Y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  toast({
                    title: `Range: ${range}`,
                    description: `Metrics updated for ${range} window.`,
                    type: "info",
                  });
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer btn-press ${
                  timeRange === range
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                    : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddWidgetOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer btn-press"
          >
            <Plus size={15} />
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      {/* Quick Action Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: "kanban", label: "New Task", icon: CheckSquare, color: "text-emerald-500 bg-emerald-500/10", desc: "Kanban board", hoverBorder: "hover:border-emerald-500/40" },
          { id: "editor", label: "New Document", icon: FileText, color: "text-blue-500 bg-blue-500/10", desc: "Spec editor", hoverBorder: "hover:border-blue-500/40" },
          { id: "files", label: "Upload Asset", icon: FolderUp, color: "text-amber-500 bg-amber-500/10", desc: "File manager", hoverBorder: "hover:border-amber-500/40" },
          { id: "chat", label: "Team Chat", icon: MessageSquare, color: "text-violet-500 bg-violet-500/10", desc: "AI assistant", hoverBorder: "hover:border-violet-500/40" },
        ].map((action, i) => (
          <div
            key={i}
            onClick={() => {
              if (onNavigate) {
                onNavigate(action.id);
              } else {
                toast({
                  title: `${action.label} Triggered`,
                  description: `Opened ${action.desc} workflow.`,
                  type: "success",
                });
              }
            }}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/40 ${action.hoverBorder} cursor-pointer transition-all flex items-center gap-3.5 group glow-card btn-press animate-fade-in-up`}
            style={{ animationDelay: `${i * 80 + 100}ms` }}
          >
            <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <action.icon size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {action.label}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium AI Predictive Velocity Widget */}
      <div className="relative animate-fade-in-up mt-6 mb-6">
        <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner p-6 h-[220px] overflow-hidden select-none relative">
           <div className="opacity-20 flex justify-between">
             <div>
               <div className="w-48 h-5 bg-slate-400 dark:bg-slate-600 rounded mb-3"></div>
               <div className="w-72 h-3 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
               <div className="w-64 h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
             </div>
             <div className="w-24 h-24 rounded-full border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center">
               <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800"></div>
             </div>
           </div>
           
           {/* Paywall Overlay */}
           <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center p-4">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={16} />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">AI Predictive Velocity</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-4">
                Forecast sprint delays, identify blockers before they happen, and auto-assign tasks based on historical capacity with Enterprise AI.
              </p>
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("billing");
                  } else {
                    toast({ title: "Upgrade Required", description: "Redirecting to billing plans...", type: "info" });
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 btn-press"
              >
                <Lock size={14} className="text-slate-400 dark:text-slate-500" />
                Unlock with Enterprise
              </button>
           </div>
        </div>
      </div>

      {/* Grid of Sortable Widgets */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            {widgets.map((widget) => (
              <SortableWidget 
                key={widget.id} 
                widget={widget} 
                onRemove={handleRemoveWidget} 
                chartData={timeRangeData[timeRange]}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Add Widget Modal */}
      {isAddWidgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-overlay">
          <div className="bg-white dark:bg-[#0c1120] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-7 max-w-md w-full shadow-2xl animate-modal">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Widget</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Pin a new metric to your dashboard</p>
              </div>
              <button 
                onClick={() => setIsAddWidgetOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all btn-press"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-5 space-y-2.5">
              {[
                { type: "stat" as const, title: "Customer Satisfaction Score (CSAT)", desc: "KPI stat card with percentage change", value: "98.4%", icon: "📊" },
                { type: "chart" as const, title: "Monthly Recurring Revenue (MRR)", desc: "Gradient area chart with hover tooltips", value: "$54,200.00", icon: "📈" },
                { type: "bar" as const, title: "Sprint Burnup Velocity", desc: "Weekly task completion bar chart", value: undefined, icon: "📉" },
                { type: "activity" as const, title: "Live Audit & Activity Stream", desc: "Real-time team actions and commits", value: undefined, icon: "⚡" },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAddWidget(opt.type, opt.title, opt.value)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/40 hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 transition-all cursor-pointer btn-press group animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg group-hover:scale-110 transition-transform">{opt.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{opt.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
              <button
                onClick={() => setIsAddWidgetOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-all btn-press"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
