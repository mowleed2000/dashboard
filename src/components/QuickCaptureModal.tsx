"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, PhoneCall, CheckSquare, Package, Calendar, Lightbulb, FileText, Check } from "lucide-react";
import { soundFx } from "@/lib/sound";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: any[];
  onSuccess: () => void;
}

type TabType = "sale" | "outreach" | "task" | "stock" | "meeting" | "idea" | "note";

export function QuickCaptureModal({ isOpen, onClose, units, onSuccess }: QuickCaptureModalProps) {
  const [tab, setTab] = useState<TabType>("sale");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || "");
  const [saleAmount, setSaleAmount] = useState("");
  const [saleCustomer, setSaleCustomer] = useState("");
  const [saleProduct, setSaleProduct] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [outreachMethod, setOutreachMethod] = useState("calls");
  const [outreachQty, setOutreachQty] = useState("");
  const [outreachNotes, setOutreachNotes] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");

  useEffect(() => {
    setTaskDueDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("Growth");
  const [ideaValue, setIdeaValue] = useState("");
  const [ideaNotes, setIdeaNotes] = useState("");

  const [noteText, setNoteText] = useState("");

  if (!isOpen) return null;

  const currentUnit = units.find((u) => u.id === selectedUnit) || units[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      if (tab === "sale") {
        const res = await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_unit_id: selectedUnit || units[0]?.id,
            amount: parseFloat(saleAmount),
            customer_label: saleCustomer || "Direct Customer",
            product_service: saleProduct || "Sales Transaction",
            payment_method: paymentMethod,
            payment_status: "received",
            occurred_at: new Date().toISOString().split("T")[0],
          }),
        });
        if (res.ok) {
          soundFx.playSaleChime();
          soundFx.triggerConfetti();
          setSuccessMessage("Sale saved & cash recorded! 🎉");
          setSaleAmount("");
          setSaleCustomer("");
          setSaleProduct("");
        }
      } else if (tab === "outreach") {
        const res = await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_unit_id: selectedUnit || units[0]?.id,
            activity_type: "outreach",
            method: outreachMethod,
            quantity: parseFloat(outreachQty || "1"),
            unit: outreachMethod,
            notes: outreachNotes,
            qualifies_for_pulse: true,
          }),
        });
        if (res.ok) {
          setSuccessMessage("Outreach activity logged!");
          setOutreachQty("");
          setOutreachNotes("");
        }
      } else if (tab === "task") {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_unit_id: selectedUnit || units[0]?.id,
            title: taskTitle,
            priority: taskPriority,
            due_at: taskDueDate,
          }),
        });
        if (res.ok) {
          setSuccessMessage("Task added to mission queue!");
          setTaskTitle("");
        }
      } else if (tab === "idea") {
        const res = await fetch("/api/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_unit_id: selectedUnit || null,
            title: ideaTitle,
            category: ideaCategory,
            potential_value: parseFloat(ideaValue || "0"),
            notes: ideaNotes,
            status: "inbox",
          }),
        });
        if (res.ok) {
          setSuccessMessage("Idea captured in Opportunity Lab!");
          setIdeaTitle("");
          setIdeaNotes("");
        }
      } else if (tab === "note") {
        const res = await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_unit_id: selectedUnit || units[0]?.id,
            activity_type: "note",
            method: "journal",
            notes: noteText,
            qualifies_for_pulse: true,
          }),
        });
        if (res.ok) {
          setSuccessMessage("Journal note recorded!");
          setNoteText("");
        }
      }

      onSuccess();
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1100);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FCFAF6] border border-[#E8E2D5] rounded-2xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D5] bg-[#F6F1E8]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E98569]" />
            <h3 className="font-heading font-semibold text-base text-[#252820]">
              Universal Quick Capture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5E6454] hover:bg-[#E8E2D5]/50 hover:text-[#252820] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E8E2D5] bg-[#FCFAF6] overflow-x-auto px-2 py-1 gap-1">
          {[
            { id: "sale", label: "Sale", icon: DollarSign },
            { id: "outreach", label: "Outreach", icon: PhoneCall },
            { id: "task", label: "Task", icon: CheckSquare },
            { id: "idea", label: "Idea", icon: Lightbulb },
            { id: "note", label: "Note", icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#252820] text-white shadow-xs"
                    : "text-[#5E6454] hover:bg-[#E8E2D5]/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {successMessage ? (
            <div className="p-4 rounded-xl bg-[#769B83]/15 border border-[#769B83]/30 text-[#252820] flex items-center gap-2.5 text-sm font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-[#769B83]" />
              {successMessage}
            </div>
          ) : null}

          {/* Venture Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
              Portfolio Venture
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.status})
                </option>
              ))}
            </select>
          </div>

          {/* TAB: SALE */}
          {tab === "sale" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                  Sale Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 20.00"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-lg font-heading font-semibold text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Customer / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in client"
                    value={saleCustomer}
                    onChange={(e) => setSaleCustomer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  >
                    <option value="cash">Cash Received</option>
                    <option value="card">Card Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="direct_debit">Direct Debit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5E6454] mb-1">
                  Product / Service
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1x NFC Review Card"
                  value={saleProduct}
                  onChange={(e) => setSaleProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB: OUTREACH */}
          {tab === "outreach" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 17 or 5"
                    value={outreachQty}
                    onChange={(e) => setOutreachQty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                    Method / Unit
                  </label>
                  <select
                    value={outreachMethod}
                    onChange={(e) => setOutreachMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  >
                    <option value="calls">Phone Calls</option>
                    <option value="hours">Hours Field Sales</option>
                    <option value="visits">Shop / Door Visits</option>
                    <option value="emails">Emails Sent</option>
                    <option value="dms">DMs / Inquiries</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5E6454] mb-1">
                  Context / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 17 cold calls for Website Package; 2 positive leads requested info."
                  value={outreachNotes}
                  onChange={(e) => setOutreachNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB: TASK */}
          {tab === "task" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up with the 3 interested NFC leads"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: IDEA */}
          {tab === "idea" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                  Idea / Opportunity
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bundle NFC card with 1st month website setup"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Category
                  </label>
                  <select
                    value={ideaCategory}
                    onChange={(e) => setIdeaCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  >
                    <option value="Growth">Growth</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Product">Product</option>
                    <option value="Operational">Operational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5E6454] mb-1">
                    Est. Value (£)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={ideaValue}
                    onChange={(e) => setIdeaValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTE */}
          {tab === "note" && (
            <div>
              <label className="block text-xs font-semibold text-[#5E6454] uppercase tracking-wider mb-1">
                Quick Observation / Decision
              </label>
              <textarea
                rows={3}
                required
                placeholder="Log an entrepreneurial lesson, pivot decision, or field observation..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
              />
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#5E6454] hover:bg-[#E8E2D5]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#E98569] hover:bg-[#E98569]/90 text-white shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Record Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
