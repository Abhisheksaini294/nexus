"use client";

import React, { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus, Calendar as CalendarIcon, Clock, Trash2, X, Filter, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type EventCategory = "meeting" | "task" | "milestone" | "reminder";

export interface NexusEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: EventCategory;
  description?: string;
}

const today = new Date();

const initialEvents: NexusEvent[] = [
  {
    id: "e1",
    title: "Q3 Strategic Alignment Meeting",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    type: "meeting",
    description: "Discuss quarterly product milestones and team resource allocations.",
  },
  {
    id: "e2",
    title: "Project Synergy: DB Migration",
    start: addDays(new Date(new Date().setHours(9, 0, 0, 0)), 1),
    end: addDays(new Date(new Date().setHours(12, 0, 0, 0)), 1),
    type: "task",
    description: "Execute the staging to production database migration.",
  },
  {
    id: "e3",
    title: "Turbopack Production Rollout",
    start: addDays(new Date(), 2),
    end: addDays(new Date(), 2),
    allDay: true,
    type: "milestone",
    description: "Final verification and canary deployment.",
  },
  {
    id: "e4",
    title: "Client Feedback Sync with Acme",
    start: addDays(new Date(new Date().setHours(14, 0, 0, 0)), 3),
    end: addDays(new Date(new Date().setHours(15, 0, 0, 0)), 3),
    type: "meeting",
    description: "Walkthrough of whiteboards and Kanban updates.",
  },
];

// Custom Toolbar for beautiful day/date navigation
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => { toolbar.onNavigate("PREV"); };
  const goToNext = () => { toolbar.onNavigate("NEXT"); };
  const goToCurrent = () => { toolbar.onNavigate("TODAY"); };
  
  const label = () => {
    const date = format(toolbar.date, 'MMMM yyyy');
    return <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{date}</span>;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {label()}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50">
          <button onClick={goToBack} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors btn-press">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToCurrent} className="px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors btn-press">
            Today
          </button>
          <button onClick={goToNext} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors btn-press">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50">
        {(['month', 'week', 'day'] as const).map(view => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all btn-press ${toolbar.view === view ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};


export default function Calendar() {
  const [events, setEvents] = useState<NexusEvent[]>(initialEvents);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<NexusEvent | null>(null);
  const { toast } = useToast();

  const [eventForm, setEventForm] = useState<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: EventCategory;
    description: string;
  }>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    type: "meeting",
    description: "",
  });

  const eventStyleGetter = (event: NexusEvent) => {
    let backgroundColor = "#6366f1"; // meeting = indigo
    if (event.type === "task") backgroundColor = "#10b981"; // emerald
    if (event.type === "milestone") backgroundColor = "#8b5cf6"; // violet
    if (event.type === "reminder") backgroundColor = "#f59e0b"; // amber

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.95,
        color: "white",
        border: "none",
        display: "block",
        padding: "4px 8px",
        fontSize: "12px",
        fontWeight: "600",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    };
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    const [startH, startM] = eventForm.startTime.split(":").map(Number);
    const [endH, endM] = eventForm.endTime.split(":").map(Number);

    const startDate = new Date(eventForm.date);
    startDate.setHours(startH || 10, startM || 0, 0, 0);

    const endDate = new Date(eventForm.date);
    endDate.setHours(endH || 11, endM || 0, 0, 0);

    const newEvent: NexusEvent = {
      id: `evt-${Date.now()}`,
      title: eventForm.title,
      start: startDate,
      end: endDate,
      type: eventForm.type,
      description: eventForm.description,
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddModalOpen(false);
    setEventForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "11:00",
      type: "meeting",
      description: "",
    });

    toast({
      title: "Event scheduled",
      description: `Added "${newEvent.title}" to calendar.`,
      type: "success",
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
    toast({
      title: "Event removed",
      description: "The event has been deleted.",
      type: "info",
    });
  };

  const filteredEvents = events.filter((e) =>
    categoryFilter === "ALL" ? true : e.type === categoryFilter.toLowerCase()
  );

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full space-y-6 animate-fade-in-up">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-indigo-500" size={28} /> Team Calendar & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Keep Project Synergy sprints, meetings, and major company dates coordinated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all btn-press"
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold px-2">
        <span className="text-slate-400 flex items-center gap-1 mr-2">
          <Filter size={14} /> Filters
        </span>
        {[
          { id: "ALL", label: "All Events" },
          { id: "MEETING", label: "Meetings" },
          { id: "TASK", label: "Tasks" },
          { id: "MILESTONE", label: "Milestones" },
          { id: "REMINDER", label: "Reminders" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer btn-press ${
              categoryFilter === cat.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {categoryFilter === cat.id && <Check size={14} className="inline mr-1" />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Calendar Viewport Container */}
      <div className="flex-1 bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <BigCalendar<NexusEvent>
          localizer={localizer}
          events={filteredEvents}
          startAccessor={(e: NexusEvent) => e.start}
          endAccessor={(e: NexusEvent) => e.end}
          titleAccessor={(e: NexusEvent) => e.title}
          style={{ height: "100%", minHeight: "500px", flex: 1 }}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
          defaultView="month"
          onSelectEvent={(event: NexusEvent) => setSelectedEvent(event)}
          components={{
            toolbar: CustomToolbar
          }}
          className="nexus-calendar font-sans text-xs"
        />
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-overlay">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-modal">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Schedule New Event</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 btn-press"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Design Sprint Sync"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as EventCategory })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task Deadline</option>
                    <option value="milestone">Milestone</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Notes, agenda, or video links..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors btn-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all btn-press"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Delete Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-overlay">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {selectedEvent.type}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 btn-press"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedEvent.title}
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={16} className="text-indigo-500" />
                  <span>{selectedEvent.start.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {!selectedEvent.allDay && (
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-emerald-500" />
                    <span>{selectedEvent.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {selectedEvent.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                  {selectedEvent.description}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 mt-4">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors btn-press"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors btn-press"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
