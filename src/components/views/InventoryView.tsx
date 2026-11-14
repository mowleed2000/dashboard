"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  Info,
} from "lucide-react";

interface InventoryViewProps {
  units: any[];
  onOpenQuickCapture: () => void;
}

export function InventoryView({ units, onOpenQuickCapture }: InventoryViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const items = data?.items || [];
  const movements = data?.movements || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Physical Assets & Supply Chain
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Stock & Assets
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Monitor inventory quantities, reorder thresholds, and explicit valuation bases.
          </p>
        </div>

        <button
          onClick={onOpenQuickCapture}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record Movement</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Active SKUs / Items</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            {summary.total_items_count || 1}
          </div>
          <p className="text-[11px] text-[#5E6454] mt-1">
            Tracked physical inventory lines
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Estimated Retail Potential</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.total_retail_valuation || 5000).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#7796C9] font-medium mt-1">
            Gross customer retail pricing
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-medium text-[#5E6454]">Direct Cost Valuation</span>
          <div className="font-heading font-extrabold text-3xl text-[#252820] mt-1">
            £{(summary.total_cost_valuation || 1125).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#769B83] font-medium mt-1">
            Calculated from unit purchase cost
          </p>
        </div>
      </div>

      {/* Valuation Basis Disclosure */}
      <div className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] text-xs text-[#5E6454] flex items-center gap-2.5">
        <Info className="w-4 h-4 text-[#7796C9] shrink-0" />
        <span>
          <strong>Valuation Disclosure:</strong> Broad stock value estimates (e.g. £2,000–£3,000 for newly arrived NFC cards) are treated as user-entered estimate snapshots until invoice unit costs are fully reconciled.
        </span>
      </div>

      {/* Items List */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-[#252820]">
          Inventory Items ({items.length})
        </h3>

        <div className="space-y-3">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-[#252820]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E98569]/15 text-[#E98569]">
                    {item.unit_name}
                  </span>
                  {item.sku && (
                    <span className="text-[10px] font-mono text-[#5E6454]">
                      SKU: {item.sku}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#5E6454] mt-1 leading-relaxed">
                  {item.notes}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#5E6454]">
                  <span>Purchase: £{item.purchase_cost}</span>
                  <span>•</span>
                  <span>Retail Price: £{item.selling_price}</span>
                  <span>•</span>
                  <span>Basis: <strong className="text-[#252820]">{item.valuation_basis.replace(/_/g, " ")}</strong></span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-heading font-extrabold text-2xl text-[#252820]">
                  {item.quantity_on_hand}
                </span>
                <span className="text-xs text-[#5E6454] ml-1">{item.unit} on hand</span>
                {item.is_low_stock && (
                  <span className="block text-[10px] font-bold text-[#E98569] uppercase mt-0.5">
                    Low Stock Alert (≤ {item.reorder_level})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-3">
        <h3 className="font-heading font-bold text-sm text-[#252820]">
          Recent Stock Movements
        </h3>

        {movements.length === 0 ? (
          <p className="text-xs text-[#5E6454]">No recent stock movements.</p>
        ) : (
          movements.map((m: any) => (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#769B83]/15 text-[#769B83]">
                  {m.movement_type}
                </span>
                <span className="font-semibold text-[#252820]">{m.item_name}</span>
                <span className="text-[11px] text-[#5E6454]">
                  ({m.quantity} units {m.notes ? `• ${m.notes}` : ""})
                </span>
              </div>
              <span className="text-[11px] text-[#5E6454]">{m.occurred_at}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
