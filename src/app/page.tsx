"use client";

import React, { useState, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/features/dashboard/Dashboard";

// Lazy load heavy components for performance (Phase 6 requirement)
const KanbanBoard = React.lazy(() => import("@/features/projects/Kanban"));
const DocumentEditor = React.lazy(() => import("@/features/documents/Editor"));
const ChatInterface = React.lazy(() => import("@/features/chat/Chat"));
const FileManager = React.lazy(() => import("@/features/files/FileManager"));
const Canvas = React.lazy(() => import("@/features/canvas/Canvas"));
const Calendar = React.lazy(() => import("@/features/calendar/Calendar"));
const Billing = React.lazy(() => import("@/features/billing/Billing"));
const Settings = React.lazy(() => import("@/features/settings/Settings"));
const Inbox = React.lazy(() => import("@/features/inbox/Inbox"));
const Reporting = React.lazy(() => import("@/features/analytics/Reporting"));
const LiveRoom = React.lazy(() => import("@/features/live-room/LiveRoom"));

// Simple loading fallback
const Loader = () => (
  <div className="flex items-center justify-center w-full h-full p-12">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveView} />;
      case "inbox":
        return <Inbox />;
      case "reporting":
        return <Reporting onNavigate={setActiveView} />;
      case "kanban":
        return <KanbanBoard onNavigate={setActiveView} />;
      case "editor":
        return <DocumentEditor />;
      case "chat":
        return <ChatInterface />;
      case "files":
        return <FileManager />;
      case "canvas":
        return <Canvas />;
      case "calendar":
        return <Calendar />;
      case "billing":
        return <Billing />;
      case "settings":
        return <Settings onNavigate={setActiveView} />;
      case "liveroom":
        return <LiveRoom />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <AppShell activeView={activeView} setActiveView={setActiveView}>
      <Suspense fallback={<Loader />}>
        {renderView()}
      </Suspense>
    </AppShell>
  );
}
