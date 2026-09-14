"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

// Demo user for frontend-only mode (no auth backend)
const DEMO_USER = { name: "Demo User", email: "demo@nexus.app" };
import { 
  Video, Mic, MicOff, VideoOff, MonitorUp, ScreenShare,
  MessageSquare, FileText, CheckSquare, ShieldAlert,
  BrainCircuit, Users, Maximize2, Settings, ListTodo, ShieldX,
  Target, TrendingUp, AlertTriangle, Activity, Send, Clock, Plus, UserPlus
} from "lucide-react";

type TabType = "chat" | "notes" | "tasks" | "blockers" | "ai" | "members";

interface Participant {
  id: string;
  name: string;
  role: string;
  isLocal: boolean;
  isSharingScreen: boolean;
  colorClass: string;
}

const INITIAL_MOCK_USERS: Participant[] = [
  { id: "p1", name: "Alice Chen", role: "Frontend Lead", isLocal: false, isSharingScreen: true, colorClass: "from-blue-900/40 to-slate-900" },
  { id: "p2", name: "Bob Builder", role: "Backend Eng", isLocal: false, isSharingScreen: false, colorClass: "from-emerald-900/40 to-slate-900" },
  { id: "p3", name: "Carol Smith", role: "Designer", isLocal: false, isSharingScreen: true, colorClass: "from-amber-900/40 to-slate-900" },
  { id: "p4", name: "Dave Miller", role: "Product Manager", isLocal: false, isSharingScreen: false, colorClass: "from-purple-900/40 to-slate-900" },
  { id: "p5", name: "Eve Davis", role: "QA Engineer", isLocal: false, isSharingScreen: false, colorClass: "from-rose-900/40 to-slate-900" },
  { id: "p6", name: "Frank White", role: "DevOps", isLocal: false, isSharingScreen: false, colorClass: "from-cyan-900/40 to-slate-900" },
  { id: "p7", name: "Grace Lee", role: "Data Scientist", isLocal: false, isSharingScreen: false, colorClass: "from-indigo-900/40 to-slate-900" },
];

export default function LiveRoom() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [hasJoined, setHasJoined] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice Chen", time: "10:02 AM", text: "The API integration is almost complete." },
    { id: 2, sender: "Bob Builder", time: "10:05 AM", text: "I've pushed the database schema updates." },
    { id: 3, sender: "Nexus AI", time: "10:06 AM", text: "I have updated the action items based on Bob's update.", isAi: true }
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Initialize participants with demo user
    setParticipants([
      { 
        id: "local", 
        name: DEMO_USER.name, 
        role: "You (Admin)", 
        isLocal: true, 
        isSharingScreen: false, 
        colorClass: "" 
      },
      ...INITIAL_MOCK_USERS
    ]);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="skeleton w-32 h-32 rounded-full"></div>
      </div>
    );
  }

  const joinMeeting = async () => {
    setHasJoined(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access denied or error:", err);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone permissions to join.",
        type: "error"
      });
    }
  };

  const toggleScreenShare = async () => {
    const localUser = participants.find(p => p.isLocal);
    if (!localUser) return;

    if (localUser.isSharingScreen) {
      // Stop sharing
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setParticipants(prev => prev.map(p => p.isLocal ? { ...p, isSharingScreen: false } : p));
    } else {
      // Start sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        
        // Listen for user stopping it via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setParticipants(prev => prev.map(p => p.isLocal ? { ...p, isSharingScreen: false } : p));
          setScreenStream(null);
        };

        setScreenStream(stream);
        setParticipants(prev => prev.map(p => p.isLocal ? { ...p, isSharingScreen: true } : p));
      } catch (err) {
        console.warn("Screen sharing denied:", err);
        toast({
          title: "Screen Share Denied",
          description: "Permission to share screen was not granted.",
          type: "error"
        });
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: DEMO_USER.name, time: "Just now", text: chatInput }]);
    setChatInput("");
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    
    const colors = ["from-pink-900/40 to-slate-900", "from-yellow-900/40 to-slate-900", "from-teal-900/40 to-slate-900"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newMember: Participant = {
      id: `p${Date.now()}`,
      name: newMemberName,
      role: newMemberRole,
      isLocal: false,
      isSharingScreen: false,
      colorClass: randomColor
    };

    setParticipants(prev => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberRole("");
    setActiveTab("chat"); // optional visual feedback
  };

  if (!hasJoined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div className="bg-white dark:bg-[#0c1120] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10 animate-scale-in">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-2">Project Synergy Sync</h2>
          <p className="text-slate-500 text-sm mb-8">{participants.length} participants are waiting.</p>
          <button 
            onClick={joinMeeting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all btn-press"
          >
            Join with Camera & Audio
          </button>
        </div>
      </div>
    );
  }

  const isLocalSharing = participants.find(p => p.isLocal)?.isSharingScreen;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/60 animate-fade-in-down">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live Meeting
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Project Synergy Sync</h1>
          <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
            <Clock size={12} /> 45:12 Elapsed • {participants.length} Participants
          </p>
        </div>
        
        {/* Meeting Controls */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if (videoRef.current && videoRef.current.srcObject) {
                 (videoRef.current.srcObject as MediaStream).getAudioTracks().forEach(track => track.enabled = isMuted);
              }
            }}
            className={`p-3 rounded-xl transition-all btn-press ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            title="Toggle Microphone"
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button 
            onClick={() => {
              setIsVideoOff(!isVideoOff);
              if (videoRef.current && videoRef.current.srcObject) {
                 (videoRef.current.srcObject as MediaStream).getVideoTracks().forEach(track => track.enabled = isVideoOff);
              }
            }}
            className={`p-3 rounded-xl transition-all btn-press ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            title="Toggle Video"
          >
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
          <button 
            onClick={toggleScreenShare}
            className={`p-3 rounded-xl transition-all btn-press ${isLocalSharing ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            title="Share Screen"
          >
            {isLocalSharing ? <ScreenShare size={18} /> : <MonitorUp size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Area: Video Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up delay-75">
            {participants.map((p) => {
              if (p.isLocal) {
                return (
                  <div key={p.id} className="flex flex-col bg-slate-900 rounded-2xl border border-indigo-500/50 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.15)] group">
                    <div className="relative aspect-video bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
                      />
                      {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                           <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold backdrop-blur-sm">
                             {p.name[0]}
                           </div>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg flex flex-col">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {isMuted ? <MicOff size={10} className="text-red-400" /> : <Mic size={10} className="text-emerald-400" />} 
                          {p.name}
                        </div>
                        <span className="text-[9px] text-slate-300 ml-4">{p.role}</span>
                      </div>
                    </div>
                    {/* Screen Share Section directly below video */}
                    {p.isSharingScreen && (
                      <div className="relative border-t border-slate-700 bg-slate-950 aspect-video flex flex-col">
                         <div className="absolute top-1 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] text-white flex items-center gap-1 z-10">
                            <ScreenShare size={10} className="text-indigo-400" /> Screen Shared
                         </div>
                         <video 
                           ref={(el) => {
                             if (el && screenStream && el.srcObject !== screenStream) {
                               el.srcObject = screenStream;
                             }
                           }}
                           autoPlay 
                           playsInline 
                           muted 
                           className="w-full h-full object-contain" 
                         />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={p.id} className="flex flex-col bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden group">
                  <div className="relative aspect-video">
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.colorClass} opacity-80`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-600 flex items-center justify-center text-white font-bold backdrop-blur-sm shadow-inner">
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg flex flex-col">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mic size={10} className="text-emerald-400" /> {p.name}
                      </div>
                      <span className="text-[9px] text-slate-300 ml-4">{p.role}</span>
                    </div>
                  </div>
                  {p.isSharingScreen && (
                    <div className="relative border-t border-slate-800 bg-slate-950 aspect-video flex flex-col overflow-hidden">
                       <div className="absolute top-1 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] text-white flex items-center gap-1 z-10">
                          <ScreenShare size={10} className="text-indigo-400" /> Screen Shared
                       </div>
                       <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                       <div className="flex-1 p-2 flex flex-col gap-2">
                         <div className="h-2 w-1/2 bg-slate-800 rounded animate-pulse" />
                         <div className="h-10 w-full bg-indigo-900/20 border border-indigo-500/20 rounded-md" />
                         <div className="h-2 w-3/4 bg-slate-800 rounded animate-pulse delay-75" />
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Interactive Panels */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white dark:bg-[#0c1120] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-xl animate-fade-in-up delay-200 h-full shrink-0">
          <div className="flex items-center p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60 gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "members", icon: Users, label: "Members" },
              { id: "chat", icon: MessageSquare, label: "Chat" },
              { id: "notes", icon: FileText, label: "Notes" },
              { id: "tasks", icon: ListTodo, label: "Tasks" },
              { id: "ai", icon: BrainCircuit, label: "AI" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap btn-press ${
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "" : "opacity-70"} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-transparent">
            {activeTab === "members" && (
              <div className="flex flex-col h-full animate-fade-in-up">
                <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <UserPlus size={14} className="text-indigo-500" /> Invite Team Member
                  </h3>
                  <form onSubmit={handleAddMember} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Name (e.g. John Doe)" 
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Role (e.g. Lead Designer)" 
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md">
                      Add to Room
                    </button>
                  </form>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-xs font-bold text-slate-500 mb-3 px-1 uppercase tracking-wider">In Meeting ({participants.length})</h3>
                  <div className="space-y-2">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          {p.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name} {p.isLocal && "(You)"}</span>
                          <span className="text-[10px] text-slate-500">{p.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full animate-fade-in-up">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === DEMO_USER.name ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {msg.isAi && <BrainCircuit size={10} className="inline mr-1 text-violet-500" />}
                          {msg.sender}
                        </span>
                        <span className="text-[9px] text-slate-400">{msg.time}</span>
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-xs ${
                        msg.isAi 
                          ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-slate-700 dark:text-slate-200'
                          : msg.sender === DEMO_USER.name
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="relative mt-auto">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message room..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors btn-press">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                  <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2 mb-3">
                    <BrainCircuit size={16} /> Live Meeting Summary
                  </h3>
                  <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <p><strong>Discussion:</strong> Team is reviewing Phase 4 objectives. API Gateway deployment is completed and verified.</p>
                    <p><strong>Decisions:</strong></p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                      <li>Proceed with staging DB migration this afternoon.</li>
                      <li>Hold off on OAuth rate limiting fix until tomorrow.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="h-full flex flex-col animate-fade-in-up">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileText size={16} className="text-blue-500" /> Collaborative Notes
                </h3>
                <textarea 
                  className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-all"
                  placeholder="Start typing notes here. Everyone in the meeting can see and edit this..."
                  defaultValue={"- API Gateway is at 100%\n- DB migration needs 30 min downtime window."}
                />
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="animate-fade-in-up space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-2">
                  <ListTodo size={16} className="text-emerald-500" /> Project Tasks
                </h3>
                {[
                  { title: "Update Gateway Configs", status: "completed" },
                  { title: "Run Migration Scripts", status: "pending" }
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                    <input type="checkbox" checked={task.status === "completed"} readOnly className="rounded text-indigo-500" />
                    <span className={`text-xs ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200 font-medium"}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
