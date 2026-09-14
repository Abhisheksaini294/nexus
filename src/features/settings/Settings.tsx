"use client";

import React, { useState } from "react";
import { 
  User, Building2, Shield, Key, Save, Plus, 
  Trash2, Check, Sun, Moon, Laptop, Lock, X, Sparkles, FileText, Database 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui-store";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  avatarColor: string;
}

const initialMembers: TeamMember[] = [
  { id: "m1", name: "Alex Mercer", email: "test@nexus.com", role: "Owner", avatarColor: "bg-indigo-600" },
  { id: "m2", name: "Alice Chen", email: "alice@nexus.com", role: "Admin", avatarColor: "bg-violet-600" },
  { id: "m3", name: "Bob Builder", email: "bob@nexus.com", role: "Member", avatarColor: "bg-emerald-600" },
  { id: "m4", name: "Charlie Tech", email: "charlie@nexus.com", role: "Viewer", avatarColor: "bg-cyan-600" },
];

export default function Settings({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState<"account" | "organization" | "security" | "appearance">("account");
  const { theme, setTheme } = useUIStore();
  const { toast } = useToast();

  // Profile Form
  const [profile, setProfile] = useState({
    name: "Alex Mercer",
    email: "test@nexus.com",
    title: "Chief Technology Officer",
    avatarBg: "bg-indigo-600",
  });

  // Org Form
  const [org, setOrg] = useState({
    name: "Nexus Labs Inc.",
    slug: "nexus-labs",
    website: "https://nexus.enterprise",
  });

  // Security Form / Modals
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [inviteForm, setInviteForm] = useState<{ name: string; email: string; role: TeamMember["role"] }>({
    name: "",
    email: "",
    role: "Member",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile saved",
      description: "Your personal details have been updated.",
      type: "success",
    });
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Organization saved",
      description: "Organization settings have been updated.",
      type: "success",
    });
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      avatarColor: "bg-amber-600",
    };

    setMembers((prev) => [...prev, newMember]);
    setIsInviteModalOpen(false);
    setInviteForm({ name: "", email: "", role: "Member" });
    toast({
      title: "Invitation dispatched",
      description: `Invited ${newMember.email} as ${newMember.role}.`,
      type: "success",
    });
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: "Member removed",
      description: `${name} was removed from the team.`,
      type: "info",
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-2 sm:p-4 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">
      {/* Top Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles size={13} /> Preferences & Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize personal profiles, security credentials, organization team access, and UI theme.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-60 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-3 shrink-0">
          <nav className="space-y-1">
            {[
              { id: "account", label: "Personal Profile", icon: User },
              { id: "organization", label: "Organization & Team", icon: Building2 },
              { id: "security", label: "Security & 2FA", icon: Shield },
              { id: "appearance", label: "Theme & Display", icon: Sun },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 w-full">
          {/* Tab 1: Personal Profile */}
          {activeTab === "account" && (
            <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Profile</h2>

              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl ${profile.avatarBg} text-white flex items-center justify-center font-extrabold text-xl shadow-md`}>
                  {profile.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Avatar Color Theme</label>
                  <div className="flex items-center gap-2">
                    {["bg-indigo-600", "bg-violet-600", "bg-emerald-600", "bg-pink-600", "bg-cyan-600"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, avatarBg: c });
                          toast({ title: "Avatar updated", description: "Color theme selected.", type: "info" });
                        }}
                        className={`w-6 h-6 rounded-full ${c} cursor-pointer transition-transform ${profile.avatarBg === c ? "scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900" : "hover:scale-110"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Role / Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-500/20 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Organization & Team */}
          {activeTab === "organization" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveOrg} className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Organization Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization Name</label>
                    <input
                      type="text"
                      value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace URL</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs">nexus.app/</span>
                      <input
                        type="text"
                        value={org.slug}
                        onChange={(e) => setOrg({ ...org, slug: e.target.value })}
                        className="flex-1 w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-r-xl"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-3 flex justify-end">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                    <Save size={14} />
                    <span>Save Org</span>
                  </button>
                </div>
              </form>

              {/* Team Members List */}
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Team Members ({members.length})</h2>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Invite Member</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {members.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {member.role}
                        </span>
                        {member.role !== "Owner" && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & 2FA */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Security Credentials</h2>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Key size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Account Password</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Last modified 2 weeks ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {twoFactorEnabled ? "Active with Google Authenticator" : "Enhance account security with TOTP"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      toast({
                        title: !twoFactorEnabled ? "2FA Enabled" : "2FA Disabled",
                        description: !twoFactorEnabled ? "Two factor protection is now active." : "Two factor protection was turned off.",
                        type: !twoFactorEnabled ? "success" : "info",
                      });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      twoFactorEnabled ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                    }`}
                  >
                    {twoFactorEnabled ? "Enabled (Turn Off)" : "Enable 2FA"}
                  </button>
                </div>
              </div>

              {/* Premium Feature Paywall: SSO & Audit Logs */}
              <div className="relative mt-8 animate-fade-in-up">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner select-none relative overflow-hidden h-[280px]">
                  {/* Faux Content */}
                  <div className="opacity-30 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                       <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-slate-300 dark:bg-slate-700"></div><div><div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 mb-1"></div><div className="w-48 h-3 bg-slate-200 dark:bg-slate-800"></div></div></div>
                       <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                       <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-slate-300 dark:bg-slate-700"></div><div><div className="w-24 h-4 bg-slate-300 dark:bg-slate-700 mb-1"></div><div className="w-56 h-3 bg-slate-200 dark:bg-slate-800"></div></div></div>
                       <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                  </div>

                  {/* Glassmorphic Overlay Paywall */}
                  <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white mb-3 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                      Enterprise Compliance & SSO
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-5">
                      Enforce SAML/Okta Single Sign-On, infinite audit logging, and IP whitelisting with our Enterprise plan.
                    </p>
                    <button
                      onClick={() => {
                        if (onNavigate) onNavigate("billing");
                        else toast({ title: "Upgrade Required", description: "Redirecting to billing plans...", type: "info" });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 btn-press"
                    >
                      <Sparkles size={14} className="text-indigo-500" />
                      Upgrade to Enterprise
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Theme & Appearance */}
          {activeTab === "appearance" && (
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Display Theme & Appearance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred workspace aesthetic color palette.</p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Light Mode", icon: Sun, desc: "Clean & high contrast" },
                  { id: "dark", label: "Dark Mode", icon: Moon, desc: "Sleek enterprise palette" },
                  { id: "system", label: "System Default", icon: Laptop, desc: "Matches operating system" },
                ].map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id as any);
                        toast({ title: `Switched to ${opt.label}`, description: "Theme updated across workspace.", type: "success" });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all text-center ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <opt.icon size={22} className={`mx-auto mb-2 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Update Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsPasswordModalOpen(false);
                toast({ title: "Password changed", description: "Your new password has been saved.", type: "success" });
              }}
              className="py-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input type="password" required defaultValue="password123" className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input type="password" required placeholder="At least 8 characters" className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="jordan@company.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
