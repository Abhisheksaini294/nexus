"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/store/ui-store";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useToast } from "@/components/ui/Toast";
import { 
  Menu, Search, Bell, LayoutDashboard, Kanban, FileText, 
  MessageSquare, Folder, PenTool, Calendar, Settings, CreditCard,
  Sun, Moon, LogOut, Sparkles, ChevronRight, MonitorPlay,
  TrendingUp, User, ShieldCheck, ChevronLeft, Inbox, Command
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppShell({ children, activeView, setActiveView }: AppShellProps) {
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { toast } = useToast();

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "liveroom", label: "Live Room", icon: MonitorPlay, badge: "Live" },
    { id: "inbox", label: "Inbox", icon: Inbox, badge: "3" },
    { id: "kanban", label: "Projects & Tasks", icon: Kanban, badge: null },
    { id: "editor", label: "Documents", icon: FileText, badge: null },
    { id: "chat", label: "Messages & AI", icon: MessageSquare, badge: "AI" },
    { id: "files", label: "File Manager", icon: Folder, badge: null },
    { id: "canvas", label: "Whiteboard", icon: PenTool, badge: null },
    { id: "calendar", label: "Calendar", icon: Calendar, badge: null },
    { id: "reporting", label: "Analytics", icon: TrendingUp, badge: null },
    { id: "billing", label: "Billing & Plans", icon: CreditCard, badge: null },
  ];

  const toggleThemeMode = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    toast({
      title: `${next === "dark" ? "🌙 Dark" : "☀️ Light"} mode activated`,
      description: "Interface appearance updated.",
      type: "info",
    });
  };

  const handleSignOut = () => {
    toast({
      title: "Signing out...",
      description: "Redirecting to login.",
      type: "info",
    });
    signOut({ callbackUrl: "/auth/login" });
  };

  const userName = session?.user?.name || "Demo User";
  const userEmail = session?.user?.email || "test@nexus.com";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#060910] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} onNavigate={setActiveView} />
      
      {/* ═══ Sidebar ═══ */}
      <aside 
        className={`${
          sidebarOpen ? "w-[260px]" : "w-[70px]"
        } transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-slate-200/60 dark:border-slate-800/50 bg-white/95 dark:bg-[#080d18]/95 backdrop-blur-2xl flex flex-col z-20 shrink-0 select-none relative`}
      >
        {/* Subtle sidebar glow accent */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 pointer-events-none" />

        {/* Workspace Brand Header */}
        <div className="h-[64px] flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800/50">
          <div 
            onClick={() => setActiveView("dashboard")}
            className={`flex items-center gap-3 cursor-pointer group ${!sidebarOpen && "hidden"}`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                N
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#080d18]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight leading-none text-gradient-wide">
                NEXUS
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold tracking-[0.2em] uppercase mt-1">
                Enterprise OS
              </span>
            </div>
          </div>

          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all btn-press"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
          <div className={`px-3 py-2 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ${!sidebarOpen && "sr-only"}`}>
            Workspace
          </div>
          {navItems.map((item, index) => {
            const isActive = activeView === item.id;
            const isHovered = hoveredNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`w-full group relative flex items-center ${
                  sidebarOpen ? "justify-start px-3" : "justify-center px-0"
                } py-2.5 rounded-xl transition-all duration-200 cursor-pointer btn-press ${
                  isActive 
                    ? "bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold" 
                    : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/30"
                }`}
                title={!sidebarOpen ? item.label : undefined}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Active left indicator with glow */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm shadow-indigo-500/50" />
                )}
                
                {/* Hover background glow */}
                {isHovered && !isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-100/50 to-transparent dark:from-slate-800/20 dark:to-transparent transition-opacity" />
                )}
                
                <item.icon 
                  size={18} 
                  className={`relative ${sidebarOpen ? "mr-3 shrink-0" : "shrink-0"} transition-all duration-200 ${
                    isActive 
                      ? "text-indigo-500 dark:text-indigo-400" 
                      : "text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  } ${isHovered && !isActive ? "scale-110" : ""}`} 
                />

                {sidebarOpen && (
                  <span className="relative text-[13px] truncate flex-1 text-left">{item.label}</span>
                )}

                {sidebarOpen && item.badge && (
                  <span className={`relative text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto transition-all ${
                    item.badge === "AI" 
                      ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/15 text-violet-500 dark:text-violet-400 border border-violet-500/20" 
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    {item.badge === "AI" && <Sparkles size={8} className="inline mr-0.5 -mt-0.5" />}
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed sidebar */}
                {!sidebarOpen && isHovered && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl animate-tooltip whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Settings & User Compact */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/50 space-y-1">
          <button 
            onClick={() => setActiveView("settings")}
            className={`w-full flex items-center ${
              sidebarOpen ? "justify-start px-3" : "justify-center px-0"
            } py-2.5 rounded-xl text-sm transition-all cursor-pointer btn-press ${
              activeView === "settings"
                ? "bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/30"
            }`}
            title="Settings"
          >
            <Settings size={18} className={`${sidebarOpen ? "mr-3 shrink-0" : "shrink-0"} ${activeView === "settings" ? "text-indigo-500" : "text-slate-400 dark:text-slate-600"}`} />
            {sidebarOpen && <span className="text-[13px]">Settings</span>}
          </button>

          {/* Compact user profile in sidebar */}
          {sidebarOpen && (
            <div className="mt-2 px-3 py-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-indigo-500/20 shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{userName}</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-dot-breathe" />
                  Online
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ Main Container ═══ */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header Bar */}
        <header className="h-[64px] bg-white/85 dark:bg-[#080d18]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/50 flex items-center justify-between px-5 lg:px-7 z-10 shrink-0 gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button 
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all w-full cursor-pointer group"
            >
              <Search size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="flex-1 text-left">Search everything...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md font-mono shadow-2xs text-slate-400">
                <Command size={9} /> K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick action button */}
            <button
              onClick={() => {
                setActiveView("kanban");
                toast({ title: "Redirected to Tasks", description: "Create and manage your project tasks.", type: "info" });
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer btn-press"
            >
              <Sparkles size={13} className="opacity-80" />
              <span>Quick Task</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleThemeMode}
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer btn-press overflow-hidden"
              title={`Toggle theme (${theme})`}
            >
              <div className="relative w-[18px] h-[18px]">
                {theme === "dark" ? (
                  <Sun size={18} className="text-amber-400 hover:rotate-90 transition-transform duration-500 absolute inset-0" />
                ) : (
                  <Moon size={18} className="text-indigo-500 hover:-rotate-12 transition-transform duration-500 absolute inset-0" />
                )}
              </div>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer btn-press"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-[#080d18] animate-dot-breathe" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[340px] bg-white dark:bg-[#0c1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl p-4 z-50 animate-tooltip">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold">
                      3 New
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40 my-2">
                    {[
                      { text: "Alice mentioned you in 'Q3 Roadmap'", time: "10m ago", source: "Documents", view: "editor", color: "bg-blue-500" },
                      { text: "Assigned: 'Design Landing Page'", time: "2h ago", source: "Projects", view: "kanban", color: "bg-violet-500" },
                      { text: "Bob uploaded 3 files to Assets", time: "Yesterday", source: "Files", view: "files", color: "bg-emerald-500" },
                    ].map((notif, i) => (
                      <div 
                        key={i}
                        onClick={() => { setShowNotifications(false); setActiveView(notif.view); }}
                        className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2.5 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full ${notif.color} mt-1.5 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{notif.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{notif.time} • {notif.source}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setShowNotifications(false); setActiveView("inbox"); }}
                    className="w-full mt-1 py-2 text-center text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 rounded-xl transition-all"
                  >
                    <span>View all notifications</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800/60 mx-0.5" />

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer btn-press"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-indigo-500/20">
                    {userInitials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[1.5px] border-white dark:border-[#080d18]" />
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-none">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none mt-1">
                    Pro Plan
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-[260px] bg-white dark:bg-[#0c1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl p-3 z-50 animate-tooltip">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-500/20">
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{userName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold">
                      <ShieldCheck size={11} />
                      Pro Workspace Owner
                    </div>
                  </div>

                  <div className="py-2 space-y-0.5">
                    <button
                      onClick={() => { setShowUserMenu(false); setActiveView("settings"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/30 cursor-pointer transition-all font-medium"
                    >
                      <User size={14} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); setActiveView("billing"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/30 cursor-pointer transition-all font-medium"
                    >
                      <CreditCard size={14} />
                      <span>Subscription & Plan</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-500 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 cursor-pointer transition-all font-semibold"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50/80 dark:bg-[#060910] p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle gradient at top of content area */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-100/40 to-transparent dark:from-indigo-500/[0.02] dark:to-transparent pointer-events-none" />
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
