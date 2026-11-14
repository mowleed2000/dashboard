"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  PlusCircle,
  AlertCircle,
  ExternalLink,
  Edit2,
  Calendar,
  Layers,
  ArrowLeft,
  DollarSign,
  PhoneCall,
  Check,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface BusinessesViewProps {
  units: any[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
  onOpenQuickCapture: () => void;
  onRefresh: () => void;
}

export function BusinessesView({
  units,
  selectedUnitId,
  onSelectUnit,
  onOpenQuickCapture,
  onRefresh,
}: BusinessesViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "sales" | "activity" | "inventory">("overview");
  const [unitData, setUnitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState("");

  const currentUnit = units.find((u) => u.id === selectedUnitId) || null;

  const fetchUnitDetails = async (id: string) => {
    try {
      setLoading(true);
      const [sRes, tRes, aRes, iRes] = await Promise.all([
        fetch(`/api/sales?unitId=${id}`),
        fetch(`/api/tasks?unitId=${id}`),
        fetch(`/api/activity?unitId=${id}&limit=30`),
        fetch(`/api/inventory?unitId=${id}`),
      ]);

      const sales = sRes.ok ? await sRes.json() : {};
      const tasks = tRes.ok ? await tRes.json() : {};
      const activity = aRes.ok ? await aRes.json() : {};
      const inventory = iRes.ok ? await iRes.json() : {};

      setUnitData({
        sales: sales.transactions || [],
        recurring: sales.recurring_agreements || [],
        salesSummary: sales.summary || {},
        tasks: tasks.tasks || [],
        activities: activity.activities || [],
        inventory: inventory.items || [],
      });
    } catch (err) {
      console.error("Error fetching unit details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnitId) {
      fetchUnitDetails(selectedUnitId);
      setActiveTab("overview");
    } else {
      setUnitData(null);
    }
  }, [selectedUnitId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentUnit) return;
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUnit.id, status: newStatus }),
      });
      if (res.ok) {
        setStatusUpdateMsg(`Status updated to ${newStatus}`);
        onRefresh();
        setTimeout(() => setStatusUpdateMsg(""), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // If no venture selected, render 9-venture grid directory
  if (!currentUnit) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
              Portfolio Directory
            </span>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
              My Businesses
            </h2>
            <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
              Nine venture units spanning products, recurring services, AI, and creative projects.
            </p>
          </div>

          <button
            onClick={onOpenQuickCapture}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 self-start md:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Quick Capture</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {units.map((unit) => {
            const hasLogo = !!unit.logo_asset_path;
            return (
              <div
                key={unit.id}
                onClick={() => onSelectUnit(unit.id)}
                className="group p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs hover:shadow-md hover:border-[#D5CCBA] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6] overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                      {hasLogo ? (
                        <img
                          src={unit.logo_asset_path}
                          alt={unit.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center font-heading font-black text-sm text-white"
                          style={{ backgroundColor: unit.accent }}
                        >
                          {unit.name.substring(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        unit.status === "Active"
                          ? "bg-[#769B83]/15 text-[#769B83]"
                          : unit.status === "Paused"
                          ? "bg-[#5E6454]/15 text-[#5E6454]"
                          : "bg-[#7796C9]/15 text-[#7796C9]"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#252820] tracking-tight group-hover:text-[#E98569] transition-colors">
                    {unit.name}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6454]">
                    {unit.type.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-[#5E6454] mt-2 line-clamp-2 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                  <div>
                    {unit.metrics?.mrr > 0 ? (
                      <span className="font-bold text-[#252820]">
                        £{unit.metrics.mrr}/mo MRR
                      </span>
                    ) : unit.metrics?.mtd_revenue > 0 ? (
                      <span className="font-bold text-[#252820]">
                        £{unit.metrics.mtd_revenue} cash
                      </span>
                    ) : (
                      <span className="text-[#5E6454]">
                        {unit.metrics?.open_tasks || 0} active tasks
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-[#E98569] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View venture →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DRILLDOWN VIEW FOR SELECTED VENTURE
  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Title header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSelectUnit(null)}
            className="p-2 rounded-xl bg-white border border-[#E8E2D5] text-[#5E6454] hover:text-[#252820] hover:bg-[#F6F1E8] transition-colors"
            title="Back to all businesses"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-xl border border-[#E8E2D5] bg-white p-1 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
            {currentUnit.logo_asset_path ? (
              <img
                src={currentUnit.logo_asset_path}
                alt={currentUnit.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full rounded-lg flex items-center justify-center font-heading font-black text-xs text-white"
                style={{ backgroundColor: currentUnit.accent }}
              >
                {currentUnit.name.substring(0, 3).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-xl md:text-2xl text-[#252820] tracking-tight">
                {currentUnit.name}
              </h2>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentUnit.accent }}
              />
            </div>
            <p className="text-xs text-[#5E6454] mt-0.5">
              {currentUnit.type.replace(/_/g, " ")} • {currentUnit.description}
            </p>
          </div>
        </div>

        {/* Status Switcher */}
        <div className="flex items-center gap-2">
          {statusUpdateMsg && (
            <span className="text-xs text-[#769B83] font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {statusUpdateMsg}
            </span>
          )}
          <select
            value={currentUnit.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
          >
            <option value="Active">Active</option>
            <option value="Development">Development</option>
            <option value="Pending">Pending</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
          </select>

          <button
            onClick={onOpenQuickCapture}
            className="px-3.5 py-1.5 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white text-xs font-semibold shadow-xs"
          >
            + Quick Log
          </button>
        </div>
      </div>

      {/* Venture Navigation Tabs */}
      <div className="flex border-b border-[#E8E2D5] gap-2 overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Overview" },
          { id: "tasks", label: `Tasks (${unitData?.tasks?.length || 0})` },
          { id: "sales", label: `Commercial & MRR` },
          { id: "activity", label: `Activity Feed` },
          { id: "inventory", label: `Inventory / Stock` },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
                active
                  ? "border-[#E98569] text-[#252820] bg-white"
                  : "border-transparent text-[#5E6454] hover:text-[#252820]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5E6454]">
          Loading venture ledger...
        </div>
      ) : (
        <>
          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-[#252820] mb-2">
                    Venture Profile & Current Mission
                  </h3>
                  <p className="text-xs text-[#5E6454] leading-relaxed">
                    {currentUnit.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#E8E2D5]">
                    <div>
                      <span className="text-[11px] font-medium text-[#5E6454]">
                        Inactivity Rule Status
                      </span>
                      <p className="text-xs font-semibold text-[#252820] mt-0.5">
                        {currentUnit.status === "Paused"
                          ? "Inactivity alerts suppressed"
                          : currentUnit.metrics?.pulse_message || "Active monitoring"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[#5E6454]">
                        Assigned Identity Accent
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: currentUnit.accent }}
                        />
                        <span className="text-xs font-semibold text-[#252820]">
                          {currentUnit.accent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key deliverables */}
                <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-[#252820] mb-3">
                    Open Deliverables ({unitData?.tasks?.filter((t: any) => t.status !== "done").length || 0})
                  </h3>
                  <div className="space-y-2">
                    {unitData?.tasks?.slice(0, 4).map((t: any) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.status === "done" ? "bg-[#769B83]" : "bg-[#E98569]"
                            }`}
                          />
                          <span className={t.status === "done" ? "line-through text-[#5E6454]" : "font-medium text-[#252820]"}>
                            {t.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5E6454] font-medium">
                          Due: {t.due_at || "Ongoing"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar stats */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                  <span className="text-xs font-medium text-[#5E6454]">Contracted MRR</span>
                  <div className="font-heading font-extrabold text-2xl text-[#252820] mt-1">
                    £{unitData?.salesSummary?.active_mrr || 0}
                    <span className="text-xs font-normal text-[#5E6454]">/mo</span>
                  </div>
                  <p className="text-[11px] text-[#5E6454] mt-1">
                    {unitData?.recurring?.length || 0} recurring client subscription(s)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                  <span className="text-xs font-medium text-[#5E6454]">Total Cash Collected</span>
                  <div className="font-heading font-extrabold text-2xl text-[#252820] mt-1">
                    £{unitData?.salesSummary?.total_cash_received || 0}
                  </div>
                  <p className="text-[11px] text-[#769B83] mt-1">
                    Settled transactions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-bold text-sm text-[#252820]">
                    Tasks & Deliverables for {currentUnit.name}
                  </h3>
                  <button
                    onClick={onOpenQuickCapture}
                    className="text-xs font-semibold text-[#E98569] hover:underline"
                  >
                    + Add Task
                  </button>
                </div>

                {unitData?.tasks?.length === 0 ? (
                  <p className="text-xs text-[#5E6454] py-4">No tasks logged for this venture yet.</p>
                ) : (
                  unitData?.tasks?.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            soundFx.playTaskComplete();
                            await fetch("/api/tasks", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: t.id,
                                status: t.status === "done" ? "not_started" : "done",
                              }),
                            });
                            fetchUnitDetails(currentUnit.id);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            t.status === "done"
                              ? "bg-[#769B83] border-[#769B83] text-white"
                              : "border-[#D5CCBA] hover:border-[#769B83]"
                          }`}
                        >
                          {t.status === "done" && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <p className={`font-semibold ${t.status === "done" ? "line-through text-[#5E6454]" : "text-[#252820]"}`}>
                            {t.title}
                          </p>
                          {t.notes && <p className="text-[11px] text-[#5E6454] mt-0.5">{t.notes}</p>}
                        </div>
                      </div>

                      <span className="text-[11px] text-[#5E6454]">
                        {t.due_at ? `Due ${t.due_at}` : "Ongoing"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. SALES & COMMERCIAL */}
          {activeTab === "sales" && (
            <div className="space-y-5">
              {/* Recurring Subscriptions */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                <h3 className="font-heading font-bold text-sm text-[#252820] mb-3">
                  Direct Debit & Recurring Agreements
                </h3>
                {unitData?.recurring?.length === 0 ? (
                  <p className="text-xs text-[#5E6454]">No recurring contracts recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {unitData?.recurring?.map((r: any) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#252820]">{r.customer_label}</p>
                          <p className="text-[11px] text-[#5E6454] mt-0.5">
                            {r.notes || "Monthly direct debit"} • Next billing: {r.next_due_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-heading font-bold text-sm text-[#252820]">
                            £{r.amount.toFixed(2)}/mo
                          </span>
                          <span className="block text-[10px] font-semibold text-[#769B83] uppercase">
                            {r.collection_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions Ledger */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
                <h3 className="font-heading font-bold text-sm text-[#252820] mb-3">
                  Transaction Records
                </h3>
                {unitData?.sales?.length === 0 ? (
                  <p className="text-xs text-[#5E6454]">No individual transactions recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {unitData?.sales?.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#252820]">{s.product_service}</p>
                          <p className="text-[11px] text-[#5E6454] mt-0.5">
                            {s.customer_label} • {s.payment_method} • {s.occurred_at}
                          </p>
                        </div>
                        <span className="font-heading font-bold text-sm text-[#252820]">
                          £{s.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. ACTIVITY */}
          {activeTab === "activity" && (
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#252820] mb-2">
                Chronological Activity Journal
              </h3>
              {unitData?.activities?.length === 0 ? (
                <p className="text-xs text-[#5E6454] py-4">No activity logged yet.</p>
              ) : (
                unitData?.activities?.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-start justify-between text-xs gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E98569] block mb-1">
                        {a.activity_type}
                      </span>
                      <p className="font-medium text-[#252820]">
                        {a.notes || `${a.quantity} ${a.unit || ""} via ${a.method}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#5E6454] shrink-0">
                      {a.occurred_at}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. INVENTORY */}
          {activeTab === "inventory" && (
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-[#252820]">
                  Inventory & Physical Assets
                </h3>
                <button
                  onClick={onOpenQuickCapture}
                  className="text-xs font-semibold text-[#E98569] hover:underline"
                >
                  + Record Stock Movement
                </button>
              </div>

              {unitData?.inventory?.length === 0 ? (
                <p className="text-xs text-[#5E6454] py-4">
                  No inventory tracked for this unit.
                </p>
              ) : (
                unitData?.inventory?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#252820]">{item.name}</span>
                      <span className="font-extrabold text-base text-[#252820]">
                        {item.quantity_on_hand} {item.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5E6454] leading-relaxed">
                      {item.notes}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5] text-[11px] text-[#5E6454]">
                      <span>Basis: {item.valuation_basis.replace(/_/g, " ")}</span>
                      <span>Unit Cost: £{item.purchase_cost} • Retail: £{item.selling_price}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
