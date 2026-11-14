"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CreditCard,
  Repeat,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Download,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface SalesRevenueViewProps {
  units: any[];
  onOpenQuickCapture: () => void;
}

export function SalesRevenueView({ units, onOpenQuickCapture }: SalesRevenueViewProps) {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterVenture, setFilterVenture] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      let url = "/api/sales";
      if (filterVenture) url += `?unitId=${filterVenture}`;
      const res = await fetch(url);
      if (res.ok) {
        setSalesData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filterVenture]);

  const summary = salesData?.summary || {};
  const transactions = salesData?.transactions || [];
  const recurring = salesData?.recurring_agreements || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Commercial Operating Ledger
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Sales & Revenue
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Cash collected, contracted recurring direct debits, and verified sales transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <a
            href="/api/export?format=csv&type=sales"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-semibold text-[#252820] hover:bg-[#F6F1E8] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#5E6454]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={onOpenQuickCapture}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Total Cash Collected</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.total_cash_received || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#769B83] font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirmed received funds
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Contracted MRR</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.active_mrr || 0).toFixed(2)}
            <span className="text-xs font-normal text-[#5E6454]">/mo</span>
          </div>
          <p className="text-[11px] text-[#7796C9] font-medium mt-1">
            {summary.active_subscriptions_count || 0} Active direct debit subscriptions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Invoiced / Outstanding</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.total_invoiced_pending || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#5E6454] mt-1">
            Pending client settlement
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Total Gross Transactions</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.total_gross_sales || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#E8BC57] font-medium mt-1">
            {transactions.length} recorded sale(s)
          </p>
        </div>
      </div>

      {/* Integrity Notice Alert */}
      <div className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] text-xs text-[#5E6454] flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#E98569] shrink-0" />
        <span>
          <strong>Data Integrity Standard:</strong> Business Command never fabricates profit from revenue alone. Cash collected reflects verified entries, and contracted MRR is derived strictly from active direct debit agreements.
        </span>
      </div>

      {/* Recurring Direct Debits Section */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#7796C9]" />
            <h3 className="font-heading font-bold text-sm text-[#252820]">
              Active Recurring Direct Debit Agreements ({recurring.length})
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#7796C9]">
            Total MRR: £{(summary.active_mrr || 0).toFixed(2)}/mo
          </span>
        </div>

        <div className="space-y-2.5">
          {recurring.map((r: any) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-[#252820]">
                    {r.customer_label}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7796C9]/15 text-[#7796C9]">
                    {r.unit_name}
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6454] mt-0.5">
                  {r.notes || "Managed direct debit"} • Next due: {r.next_due_date}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="font-heading font-extrabold text-base text-[#252820]">
                    £{r.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#5E6454]">/{r.interval}</span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#769B83]/15 text-[#769B83]">
                  {r.collection_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-[#252820]">
            Transaction Ledger ({transactions.length})
          </h3>

          <select
            value={filterVenture}
            onChange={(e) => setFilterVenture(e.target.value)}
            className="px-3 py-1.5 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
          >
            <option value="">All Ventures</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {transactions.map((tx: any) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#769B83]/15 text-[#769B83] flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#252820]">
                      {tx.product_service || "Sale"}
                    </span>
                    <span className="text-[10px] text-[#5E6454] px-1.5 py-0.5 rounded-md bg-[#E8E2D5]/50">
                      {tx.unit_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5E6454] mt-0.5">
                    Customer: {tx.customer_label || "Client"} • Method: {tx.payment_method} • {tx.occurred_at}
                  </p>
                  {tx.notes && <p className="text-[11px] text-[#5E6454] italic mt-0.5">{tx.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="font-heading font-extrabold text-base text-[#252820]">
                  £{tx.amount.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#769B83]/15 text-[#769B83]">
                  {tx.payment_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
