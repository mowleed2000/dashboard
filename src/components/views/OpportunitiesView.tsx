"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  PlusCircle,
  Dices,
  Tag,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";

interface OpportunitiesViewProps {
  units: any[];
  onOpenQuickCapture: () => void;
}

export function OpportunitiesView({ units, onOpenQuickCapture }: OpportunitiesViewProps) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [roulettePick, setRoulettePick] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleRoulette = async () => {
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "roulette" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoulettePick(data.picked_idea);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", id, status: newStatus }),
      });
      fetchOpportunities();
    } catch (e) {
      console.error(e);
    }
  };

  const stages = [
    { id: "inbox", label: "Inbox", color: "#5E6454" },
    { id: "interesting", label: "Interesting", color: "#7796C9" },
    { id: "testing", label: "Testing / Pilot", color: "#E8BC57" },
    { id: "pursuing", label: "Pursuing", color: "#769B83" },
    { id: "parked", label: "Parked", color: "#D7A17C" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Idea Laboratory & Commercial Testing
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Opportunity Board
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Capture, incubate, and stress-test venture opportunities without polluting active task queues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRoulette}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-semibold text-[#252820] hover:bg-[#F6F1E8] transition-colors shadow-2xs"
          >
            <Dices className="w-3.5 h-3.5 text-[#E8BC57]" />
            <span>Idea Roulette</span>
          </button>

          <button
            onClick={onOpenQuickCapture}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Capture Idea</span>
          </button>
        </div>
      </div>

      {/* Idea Roulette Highlight Box */}
      {roulettePick && (
        <div className="p-5 rounded-2xl bg-[#FCFAF6] border border-[#E8BC57] shadow-xs flex items-start justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BC57] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Roulette Pick: Resurfaced Opportunity</span>
            </div>
            <h4 className="font-heading font-bold text-base text-[#252820]">
              {roulettePick.title}
            </h4>
            <p className="text-xs text-[#5E6454] mt-1">
              {roulettePick.notes || "No notes logged"} • {roulettePick.unit_name || "General Portfolio"}
            </p>
          </div>

          <button
            onClick={() => setRoulettePick(null)}
            className="text-xs text-[#5E6454] hover:text-[#252820]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Columns / Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageItems = opportunities.filter((o) => o.status === stage.id);
          return (
            <div
              key={stage.id}
              className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-col justify-between space-y-3 min-h-[350px]"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5] mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h4 className="font-heading font-bold text-xs text-[#252820]">
                      {stage.label}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-[#5E6454]">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] space-y-2 text-xs hover:border-[#D5CCBA] transition-all"
                    >
                      <div>
                        {item.unit_name && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6454] block mb-0.5">
                            {item.unit_name}
                          </span>
                        )}
                        <h5 className="font-semibold text-xs text-[#252820] leading-snug">
                          {item.title}
                        </h5>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-[#5E6454] line-clamp-2">
                          {item.notes}
                        </p>
                      )}

                      {item.potential_value > 0 && (
                        <span className="block text-[10px] font-bold text-[#769B83]">
                          Est. Value: £{item.potential_value}
                        </span>
                      )}

                      {/* Stage advance controls */}
                      <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-[10px]">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="bg-transparent text-[#5E6454] font-medium focus:outline-hidden"
                        >
                          <option value="inbox">Inbox</option>
                          <option value="interesting">Interesting</option>
                          <option value="testing">Testing</option>
                          <option value="pursuing">Pursuing</option>
                          <option value="parked">Parked</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onOpenQuickCapture}
                className="w-full py-1.5 rounded-lg border border-dashed border-[#D5CCBA] text-[11px] font-medium text-[#5E6454] hover:bg-[#F6F1E8] transition-colors"
              >
                + Add Idea
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
