"use client";

import React, { useState } from "react";
import { Check, CreditCard, Download, ShieldCheck, Sparkles, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For individuals and small squads starting out.",
    features: ["Up to 5 team members", "Basic Kanban boards", "5GB Cloud Storage", "Community Discord Support"],
  },
  {
    id: "pro",
    name: "Pro Enterprise",
    monthlyPrice: 15,
    annualPrice: 12,
    description: "For scaling engineering teams requiring speed & agility.",
    features: ["Unlimited team members", "Advanced Analytics & CSV exports", "100GB Fast Cloud Storage", "Interactive Whiteboard Canvas", "Priority 24/7 Support"],
  },
  {
    id: "enterprise",
    name: "Custom Enterprise",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For organizations needing compliance & custom integrations.",
    features: ["Unlimited everything", "Dedicated VPC & SSO (SAML/Okta)", "Custom SLA & Account Manager", "Unlimited AI Copilot queries", "Automated Daily Backups"],
  },
];

export default function Billing() {
  const [currentPlanId, setCurrentPlanId] = useState<string>("pro");
  const [isAnnual, setIsAnnual] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<Plan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "•••• •••• •••• 4242",
    holder: "Alex Mercer",
    expiry: "12/28",
  });
  const { toast } = useToast();

  const currentPlan = plans.find((p) => p.id === currentPlanId) || plans[1];

  const handleSelectUpgrade = (plan: Plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlanForUpgrade(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForUpgrade) return;
    setCurrentPlanId(selectedPlanForUpgrade.id);
    setIsUpgradeModalOpen(false);
    toast({
      title: "Plan updated",
      description: `Your workspace has been upgraded to the ${selectedPlanForUpgrade.name} plan!`,
      type: "success",
    });
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
    toast({
      title: "Payment method updated",
      description: "Default card ending in 4242 saved successfully.",
      type: "success",
    });
  };

  const handleConfirmCancel = () => {
    setCurrentPlanId("starter");
    setIsCancelModalOpen(false);
    toast({
      title: "Subscription downgraded",
      description: "Workspace downgraded to Starter plan.",
      type: "info",
    });
  };

  const handleDownloadInvoice = (date: string, amount: string) => {
    const invoiceContent = `NEXUS ENTERPRISE OS - RECEIPT\nDate: ${date}\nAmount: ${amount}\nStatus: PAID\nCustomer: test@nexus.com\nPlan: ${currentPlan.name}\nThank you for choosing Nexus.`;
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-receipt-${date.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt downloaded",
      description: `Saved receipt for ${amount}.`,
      type: "success",
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-2 sm:p-4 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles size={13} /> Flexible Subscriptions
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Workspace Billing & Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage corporate subscription tiers, team member limits, and downloadable tax invoices.
        </p>
      </div>

      {/* Current Plan Overview & Payment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Banner */}
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Active Subscription
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentPlan.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Next invoice scheduled for Nov 1, 2026</p>
              </div>

              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  ${isAnnual ? currentPlan.annualPrice : currentPlan.monthlyPrice}
                </span>
                <span className="text-xs text-slate-400 font-medium">/user/mo</span>
              </div>
            </div>

            {/* Storage Progress & Members Meter */}
            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">Cloud Storage (45.8 GB / 100 GB)</span>
                  <span className="text-slate-500">45%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="flex justify-between text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-700 dark:text-slate-300">Active Members Limit</span>
                <span className="text-emerald-500 font-bold">Unlimited Access Enabled</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => handleSelectUpgrade(plans[2])}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Upgrade to Enterprise
            </button>
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Payment Card Method */}
        <div className="col-span-1 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
              Payment Method
            </h2>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-3.5 mb-4">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                <CreditCard size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{cardDetails.number}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Expires {cardDetails.expiry} • Default</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Invoices are automatically charged on the 1st of every month. SSL 256-bit encrypted.
            </p>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full mt-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Available Plans Selector */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Compare Workspace Plans</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Transparent pricing with no hidden charges.</p>
          </div>

          {/* Monthly vs Annual Toggle */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isAnnual
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Active Plan
                  </div>
                )}

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                  <div className="my-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-50">${price}</span>
                    <span className="text-xs text-slate-400 ml-1">/user/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">{plan.description}</p>

                  <ul className="space-y-2.5 my-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectUpgrade(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20"
                  }`}
                >
                  {isCurrent ? "Current Active Plan" : `Select ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="space-y-4 pb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Invoice Billing History</h2>
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Billing Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[
                { date: "Oct 1, 2026", amount: "$144.00", status: "Paid" },
                { date: "Sep 1, 2026", amount: "$144.00", status: "Paid" },
                { date: "Aug 1, 2026", amount: "$144.00", status: "Paid" },
                { date: "Jul 1, 2026", amount: "$144.00", status: "Paid" },
              ].map((inv, i) => (
                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{inv.date}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-slate-100">{inv.amount}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.date, inv.amount)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Plan Confirmation Modal */}
      {isUpgradeModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Switch Workspace Plan</h3>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="py-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to switch your workspace to <strong>{selectedPlanForUpgrade.name}</strong>?
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs">
                <p className="font-bold text-indigo-700 dark:text-indigo-300">
                  New Price: ${isAnnual ? selectedPlanForUpgrade.annualPrice : selectedPlanForUpgrade.monthlyPrice}/user/mo
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Prorated adjustments will apply to your billing cycle.</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                Confirm Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Update Credit Card</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePaymentMethod} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue={cardDetails.holder}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    defaultValue="12/28"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                  <input
                    type="password"
                    required
                    defaultValue="888"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-red-500">
              <AlertCircle size={18} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cancel Subscription?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 py-4 leading-relaxed">
              Are you sure you want to downgrade? You will lose unlimited team access, 100GB fast storage, and automated daily backups.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
