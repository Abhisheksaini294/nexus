"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Hash, User, Send, Search, Sparkles, Paperclip, Smile, 
  Bot, CheckCheck, MoreVertical, Phone, Video 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Message {
  id: string;
  author: string;
  avatarBg: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, number>;
  isAI?: boolean;
}

type ChatRoom = {
  id: string;
  name: string;
  type: "channel" | "dm";
  subtitle?: string;
  online?: boolean;
};

const initialRooms: ChatRoom[] = [
  { id: "general", name: "general", type: "channel" },
  { id: "engineering", name: "engineering", type: "channel" },
  { id: "design", name: "design", type: "channel" },
  { id: "ai-assistant", name: "Nexus AI Assistant", type: "dm", subtitle: "Instant AI Copilot", online: true },
  { id: "alice", name: "Alice Chen", type: "dm", subtitle: "Product Manager", online: true },
  { id: "bob", name: "Bob Builder", type: "dm", subtitle: "Senior Architect", online: false },
];

const initialRoomMessages: Record<string, Message[]> = {
  general: [
    { id: "m1", author: "Alice Chen", avatarBg: "bg-indigo-500", content: "Good morning team! Welcome to the new Nexus Enterprise OS.", timestamp: "09:30 AM", reactions: { "🚀": 3, "👍": 2 } },
    { id: "m2", author: "Bob Builder", avatarBg: "bg-emerald-500", content: "Turbopack build speeds and Dexie caching look lightning fast!", timestamp: "09:35 AM", reactions: { "🔥": 4 } },
  ],
  engineering: [
    { id: "e1", author: "Bob Builder", avatarBg: "bg-emerald-500", content: "All TypeScript routes and Prisma models are 100% verified.", timestamp: "10:15 AM" },
    { id: "e2", author: "Charlie Tech", avatarBg: "bg-cyan-500", content: "Dark mode tokens and glassmorphism styling look super crisp.", timestamp: "10:20 AM" },
  ],
  design: [
    { id: "d1", author: "Sarah Designer", avatarBg: "bg-pink-500", content: "Check out the new whiteboard canvas color palette and widgets!", timestamp: "11:00 AM" },
  ],
  "ai-assistant": [
    { id: "ai1", author: "Nexus AI", avatarBg: "bg-violet-600", content: "Hello! I am your Nexus AI Assistant. Ask me anything about your roadmap, tasks, or system design!", timestamp: "Just now", isAI: true },
  ],
  alice: [
    { id: "a1", author: "Alice Chen", avatarBg: "bg-indigo-500", content: "Hey! Can you review the Q3 Roadmap draft when you have a moment?", timestamp: "Yesterday" },
  ],
  bob: [
    { id: "b1", author: "Bob Builder", avatarBg: "bg-emerald-500", content: "Let me know if you need any assistance with database migrations.", timestamp: "Sep 10" },
  ],
};

export default function ChatInterface() {
  const [rooms] = useState<ChatRoom[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string>("ai-assistant");
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>(initialRoomMessages);
  const [input, setInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const currentMessages = messagesByRoom[activeRoomId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      author: "You",
      avatarBg: "bg-indigo-600",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesByRoom((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));
    setInput("");

    // If talking to AI Assistant or mentioning AI, simulate AI reply
    if (activeRoomId === "ai-assistant" || userText.toLowerCase().includes("@ai") || userText.toLowerCase().includes("nexus")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const aiReplies = [
          "Great question! I've analyzed your workspace. All tasks are currently on track for the sprint release.",
          "I've updated the roadmap and indexed your latest documents for search.",
          "Nexus OS has synced all local database records. Everything is running with optimal latency!",
          `I can definitely assist with "${userText.slice(0, 30)}...". Let me know what other details you'd like me to configure!`,
        ];
        const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          author: "Nexus AI",
          avatarBg: "bg-violet-600",
          content: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAI: true,
        };

        setMessagesByRoom((prev) => ({
          ...prev,
          [activeRoomId]: [...(prev[activeRoomId] || []), aiMsg],
        }));
      }, 1000);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessagesByRoom((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map((m) => {
        if (m.id === msgId) {
          const currentCount = m.reactions?.[emoji] || 0;
          return {
            ...m,
            reactions: {
              ...(m.reactions || {}),
              [emoji]: currentCount + 1,
            },
          };
        }
        return m;
      });
      return { ...prev, [activeRoomId]: updated };
    });
  };

  const filteredMessages = currentMessages.filter((m) =>
    m.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-full border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
      {/* Sidebar Channels & DMs */}
      <div className="w-64 sm:w-72 bg-slate-50/80 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
              Nexus Channels
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Active
            </span>
          </div>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-5">
          {/* Channels */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Channels
            </h3>
            <ul className="space-y-1">
              {rooms
                .filter((r) => r.type === "channel")
                .map((room) => {
                  const isActive = activeRoomId === room.id;
                  return (
                    <li
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isActive
                          ? "bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <Hash size={15} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                      <span className="truncate">{room.name}</span>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Direct Messages */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Direct Messages & AI
            </h3>
            <ul className="space-y-1">
              {rooms
                .filter((r) => r.type === "dm")
                .map((room) => {
                  const isActive = activeRoomId === room.id;
                  const isAi = room.id === "ai-assistant";
                  return (
                    <li
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isActive
                          ? "bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAi ? (
                          <div className="w-5 h-5 rounded-md bg-violet-600 text-white flex items-center justify-center shrink-0">
                            <Sparkles size={12} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {room.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">{room.name}</span>
                      </div>
                      {room.online && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-6 bg-white dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            {activeRoom.type === "channel" ? (
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Hash size={18} />
              </div>
            ) : activeRoom.id === "ai-assistant" ? (
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Bot size={18} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                {activeRoom.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {activeRoom.name}
                {activeRoom.id === "ai-assistant" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 font-semibold">
                    AI Active
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeRoom.subtitle || "Workspace discussion thread"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search messages..."
                className="pl-8 pr-3 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>
            <button
              onClick={() => toast({ title: "Call initiated", description: "Simulating WebRTC video channel.", type: "info" })}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Start voice/video"
            >
              <Video size={17} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3.5 group">
              <div className={`w-8 h-8 rounded-xl ${msg.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                {msg.isAI ? <Sparkles size={14} /> : msg.author.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {msg.author}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 max-w-2xl inline-block">
                  {msg.content}
                </div>

                {/* Reactions and Emoji trigger */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {msg.reactions &&
                    Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <span>{emoji}</span>
                        <span className="font-semibold">{count}</span>
                      </button>
                    ))}

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                    {["👍", "❤️", "🚀"].map((em) => (
                      <button
                        key={em}
                        onClick={() => handleAddReaction(msg.id, em)}
                        className="text-xs hover:scale-125 transition-transform p-0.5"
                        title={`React with ${em}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center text-xs">
                <Bot size={14} />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-2xl">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/80 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <button
              onClick={() => toast({ title: "Attachment simulated", description: "File attachment ready.", type: "info" })}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Attach document or asset"
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                activeRoom.id === "ai-assistant"
                  ? "Ask Nexus AI or generate project plans..."
                  : `Message #${activeRoom.name}...`
              }
              className="flex-1 bg-transparent outline-none px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs shadow-indigo-500/20 transition-all cursor-pointer"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
