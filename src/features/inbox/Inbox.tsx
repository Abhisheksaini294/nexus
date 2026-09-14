"use client";

import React, { useState } from "react";
import { 
  Bell, CheckCircle2, MessageSquare, FileEdit, 
  UserPlus, Check, Trash2, Filter, Sparkles, ArrowRight 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type NotificationType = "mention" | "assignment" | "edit" | "invite";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkView?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "mention",
    title: "Alice mentioned you in 'Q3 Product Roadmap'",
    description: "Hey Alex, can you review the sprint targets before tomorrow's executive review?",
    time: "10 mins ago",
    read: false,
    linkView: "editor",
  },
  {
    id: "n2",
    type: "assignment",
    title: "You were assigned to 'Implement enterprise authentication'",
    description: "Project: Unified OS • Priority: URGENT",
    time: "2 hours ago",
    read: false,
    linkView: "kanban",
  },
  {
    id: "n3",
    type: "edit",
    title: "Bob updated 'Design Assets & Brand Kit'",
    description: "Uploaded 4 new vector logos and high-res SVG assets.",
    time: "Yesterday",
    read: true,
    linkView: "files",
  },
  {
    id: "n4",
    type: "invite",
    title: "Sarah joined the #engineering channel",
    description: "Invited by Alice Chen.",
    time: "2 days ago",
    read: true,
    linkView: "chat",
  },
];

export default function Inbox() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "mention" | "assignment">("all");
  const { toast } = useToast();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your inbox is clear.",
      type: "success",
    });
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "Notification removed from inbox.",
      type: "info",
    });
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "assignment":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "edit":
        return <FileEdit size={16} className="text-amber-500" />;
      case "invite":
        return <UserPlus size={16} className="text-violet-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterTab === "unread") return !n.read;
    if (filterTab === "mention") return n.type === "mention";
    if (filterTab === "assignment") return n.type === "assignment";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full bg-transparent p-2 sm:p-4 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles size={13} /> Activity Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
            <span>Inbox & Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mentions, task assignments, and document edits across your workspace.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Check size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: "all", label: "All Activity" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "mention", label: "Mentions" },
          { id: "assignment", label: "Task Assignments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 size={42} className="mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You're all caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">No notifications in this filter view.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  !item.read ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-2xs">
                    {getIcon(item.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`text-xs font-bold leading-snug ${!item.read ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                      <span>Click to toggle read</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
                  )}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
