"use client";

import React, { useEffect } from "react";
import { Command } from "cmdk";
import { 
  Search, FileText, CheckSquare, MessageSquare, Plus, Settings, 
  LayoutDashboard, Folder, PenTool, Calendar, CreditCard, Bell, Moon, Sun, MonitorPlay
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./Dialog";
import { useUIStore } from "@/store/ui-store";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (o: boolean) => void;
  onNavigate?: (view: string) => void;
}

export function CommandPalette({ open, setOpen, onNavigate }: CommandPaletteProps) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const handleSelect = (viewId: string) => {
    setOpen(false);
    if (onNavigate) {
      onNavigate(viewId);
    }
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl max-w-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="w-full flex flex-col bg-transparent" label="Global Command Menu">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
            <Search size={18} className="text-slate-400 mr-2.5 shrink-0" />
            <Command.Input
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium"
              placeholder="Type a command or search workspace..."
            />
            <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2 scroll-py-2">
            <Command.Empty className="py-8 text-center text-xs text-slate-500">
              No matching commands or pages found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
              <Command.Item
                onSelect={() => handleSelect("dashboard")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <LayoutDashboard size={15} className="text-indigo-500" />
                <span>Go to Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("liveroom")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <MonitorPlay size={15} className="text-red-500" />
                <span>Go to Live Project Room</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("kanban")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <CheckSquare size={15} className="text-emerald-500" />
                <span>Go to Projects & Kanban</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("editor")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <FileText size={15} className="text-blue-500" />
                <span>Go to Documents & Spec Editor</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("chat")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <MessageSquare size={15} className="text-violet-500" />
                <span>Go to Team Messages & AI Chat</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("files")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <Folder size={15} className="text-amber-500" />
                <span>Go to File Manager</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("canvas")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <PenTool size={15} className="text-rose-500" />
                <span>Go to Whiteboard Canvas</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("calendar")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <Calendar size={15} className="text-cyan-500" />
                <span>Go to Calendar & Events</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("reporting")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <LayoutDashboard size={15} className="text-purple-500" />
                <span>Go to Analytics & Reports</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("billing")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <CreditCard size={15} className="text-emerald-500" />
                <span>Go to Billing & Subscriptions</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("inbox")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <Bell size={15} className="text-amber-500" />
                <span>Go to Inbox Notifications</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect("settings")}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                <Settings size={15} className="text-slate-500" />
                <span>Go to Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Preferences & Actions" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={handleToggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 dark:aria-selected:text-indigo-400 cursor-pointer"
              >
                {theme === "dark" ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-500" />}
                <span>Toggle Theme ({theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"})</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
