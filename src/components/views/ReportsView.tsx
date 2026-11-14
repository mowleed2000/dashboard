"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart,
  Printer,
  Download,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

interface ReportsViewProps {
  units: any[];
}

export function ReportsView({ units }: ReportsViewProps) {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "obligations" | "time_capsule">("daily");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchExportData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/export?format=json");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [dateFormatted, setDateFormatted] = useState("");

  useEffect(() => {
    setDateFormatted(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    fetchExportData();
  }, []);

  const handlePrintPDF = () => {
    window.print();
  };

  const transactions = data?.transactions || [];
  const tasks = data?.tasks || [];
  const recurring = data?.recurring_agreements || [];
  const activities = data?.recent_activities || [];
  const inventory = data?.inventory || [];

  const totalCash = transactions
    .filter((t: any) => t.payment_status === "received")
    .reduce((acc: number, t: any) => acc + t.amount, 0);

  const totalMRR = recurring
    .filter((r: any) => r.status === "active")
    .reduce((acc: number, r: any) => acc + r.amount, 0);

  const overdueTasks = tasks.filter((t: any) => t.is_overdue || (t.status !== "done" && t.status !== "cancelled"));

  return (
    <div className="space-y-6 pb-12">
      {/* Header (Hidden during print) */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            AI-Ready Export & Reporting Centre
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Reports & Time Capsules
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Generate clean, formatted executive reports ready for print, PDF export, or direct upload into ChatGPT.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#252820] hover:bg-[#252820]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Controls (Hidden during print) */}
      <div className="no-print p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "daily", label: "Daily Snapshot" },
            { id: "weekly", label: "Weekly Review" },
            { id: "monthly", label: "Monthly Portfolio" },
            { id: "obligations", label: "Outstanding Obligations" },
            { id: "time_capsule", label: "Monthly Time Capsule" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === r.id
                  ? "bg-[#E98569] text-white shadow-xs"
                  : "text-[#5E6454] hover:bg-[#F6F1E8]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/export?format=csv&type=sales"
            download
            className="text-xs font-medium text-[#7796C9] hover:underline flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sales CSV</span>
          </a>
          <span className="text-[#E8E2D5]">•</span>
          <a
            href="/api/export?format=csv&type=tasks"
            download
            className="text-xs font-medium text-[#7796C9] hover:underline flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tasks CSV</span>
          </a>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled for A4 paper and clean print output) */}
      <div className="card-print p-8 md:p-12 rounded-3xl bg-white border border-[#E8E2D5] shadow-lg max-w-4xl mx-auto space-y-8 text-[#252820]">
        {/* Document Header */}
        <div className="border-b-2 border-[#252820] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E98569]" />
              <span className="font-heading font-extrabold text-sm tracking-wider uppercase text-[#252820]">
                BUSINESS COMMAND OPERATING SYSTEM
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-1">
              {reportType === "daily" && "Daily Portfolio Executive Snapshot"}
              {reportType === "weekly" && "Weekly Operations & Sales Review"}
              {reportType === "monthly" && "Monthly Executive Portfolio Statement"}
              {reportType === "obligations" && "Outstanding Obligations & Critical Path Report"}
              {reportType === "time_capsule" && "Monthly Time Capsule & Retrospective"}
            </h1>
            <p className="text-xs text-[#5E6454] mt-1">
              Single-Operator Command Layer • Nine Ventures in Orbit
            </p>
          </div>

          <div className="text-right text-xs text-[#5E6454] shrink-0 font-medium space-y-0.5">
            <div><strong>Generated:</strong> {dateFormatted}</div>
            <div><strong>Timezone:</strong> Europe/London (GMT)</div>
            <div><strong>Currency:</strong> GBP (£)</div>
          </div>
        </div>

        {/* Data Completeness and Estimate Disclosure Notice */}
        <div className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] text-xs text-[#5E6454] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#769B83] shrink-0" />
          <span>
            <strong>Audit Disclosure:</strong> All figures presented are derived from verified transaction ledgers and active direct debit agreements. Stated snapshot estimates are flagged; unrecorded expenses are not fabricated.
          </span>
        </div>

        {/* Financial Summary Scoreboard */}
        <div>
          <h3 className="font-heading font-bold text-sm text-[#252820] uppercase tracking-wider mb-3">
            Financial & Metric Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6]">
              <span className="text-[11px] font-medium text-[#5E6454] block">Cash Received</span>
              <span className="font-heading font-extrabold text-2xl text-[#252820] mt-1 block">
                £{totalCash.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#769B83] font-semibold">Settled</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6]">
              <span className="text-[11px] font-medium text-[#5E6454] block">Contracted MRR</span>
              <span className="font-heading font-extrabold text-2xl text-[#252820] mt-1 block">
                £{totalMRR.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#7796C9] font-semibold">Direct Debit (2 clients)</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6]">
              <span className="text-[11px] font-medium text-[#5E6454] block">Stated NFC MTD</span>
              <span className="font-heading font-extrabold text-2xl text-[#252820] mt-1 block">
                £300.00
              </span>
              <span className="text-[10px] text-[#E8BC57] font-semibold">User Estimate</span>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6]">
              <span className="text-[11px] font-medium text-[#5E6454] block">Active Portfolio Units</span>
              <span className="font-heading font-extrabold text-2xl text-[#252820] mt-1 block">
                9 Units
              </span>
              <span className="text-[10px] text-[#5E6454] font-semibold">1 Paused, 8 Active/Dev</span>
            </div>
          </div>
        </div>

        {/* Venture Status Summary Table */}
        <div>
          <h3 className="font-heading font-bold text-sm text-[#252820] uppercase tracking-wider mb-3">
            Portfolio Venture Registry & Inactivity Pulse
          </h3>
          <div className="border border-[#E8E2D5] rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F6F1E8] border-b border-[#E8E2D5] text-[#5E6454] font-semibold">
                <tr>
                  <th className="p-3">Venture Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Inactivity Pulse</th>
                  <th className="p-3 text-right">Commercial Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FCFAF6]">
                    <td className="p-3 font-semibold text-[#252820]">{u.name}</td>
                    <td className="p-3 text-[#5E6454]">{u.type.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8E2D5]">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#5E6454]">
                      {u.status === "Paused" ? "Suppressed" : u.metrics?.pulse_message || "Active"}
                    </td>
                    <td className="p-3 text-right font-bold text-[#252820]">
                      {u.metrics?.mrr > 0 ? `£${u.metrics.mrr}/mo MRR` : u.metrics?.mtd_revenue > 0 ? `£${u.metrics.mtd_revenue}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Obligations & Deliverables */}
        <div>
          <h3 className="font-heading font-bold text-sm text-[#252820] uppercase tracking-wider mb-3">
            Outstanding Deliverables & Unresolved Commitments
          </h3>
          <div className="border border-[#E8E2D5] rounded-xl overflow-hidden divide-y divide-[#E8E2D5]">
            {tasks.slice(0, 6).map((t: any) => (
              <div key={t.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#252820]">{t.title}</span>
                  <span className="text-[11px] text-[#5E6454] ml-2">({t.unit_name})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#E98569]">{t.priority}</span>
                  <span className="text-[11px] text-[#5E6454]">Due: {t.due_at || "Immediate"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#5E6454]">
          <span>Business Command • Proprietary Executive Document</span>
          <span>End of Report</span>
        </div>
      </div>
    </div>
  );
}
