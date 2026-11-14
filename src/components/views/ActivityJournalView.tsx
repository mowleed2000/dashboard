"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Filter,
  Search,
  DollarSign,
  PhoneCall,
  CheckCircle2,
  Package,
  Calendar,
  FileText,
  PlusCircle,
  Sparkles,
} from "lucide-react";

interface ActivityJournalViewProps {
  units: any[];
  onOpenQuickCapture: () => void;
}

export function ActivityJournalView({ units, onOpenQuickCapture }: ActivityJournalViewProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = `/api/activity?limit=100`;
      if (selectedUnit) url += `&unitId=${selectedUnit}`;
      if (selectedType) url += `&type=${selectedType}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedUnit, selectedType]);

  const filtered = activities.filter((a) => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      (a.notes && a.notes.toLowerCase().includes(kw)) ||
      (a.unit_name && a.unit_name.toLowerCase().includes(kw)) ||
      (a.method && a.method.toLowerCase().includes(kw))
    );
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <DollarSign className="w-4 h-4 text-[#769B83]" />;
      case "outreach":
        return <PhoneCall className="w-4 h-4 text-[#7796C9]" />;
      case "milestone":
        return <CheckCircle2 className="w-4 h-4 text-[#E8BC57]" />;
      case "stock":
        return <Package className="w-4 h-4 text-[#E98569]" />;
      case "meeting":
        return <Calendar className="w-4 h-4 text-[#C5A1C9]" />;
      default:
        return <FileText className="w-4 h-4 text-[#5E6454]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Chronological Operating Stream
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Activity Journal
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Aggregated operational record—effortless tracking without individual contact micro-logging.
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

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#5E6454] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes, calls, field sales..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
            />
          </div>

          {/* Venture Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-1.5 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
          >
            <option value="">All 9 Ventures</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
          >
            <option value="">All Event Types</option>
            <option value="sale">Sales</option>
            <option value="outreach">Outreach Summaries</option>
            <option value="milestone">Milestones / Tasks</option>
            <option value="stock">Stock Events</option>
            <option value="note">Notes & Decisions</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-[#5E6454]">
          {filtered.length} entries
        </span>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#5E6454]">
            Loading journal stream...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E2D5] space-y-2">
            <BookOpen className="w-8 h-8 text-[#5E6454]/40 mx-auto" />
            <h4 className="font-heading font-semibold text-sm text-[#252820]">
              No activities found
            </h4>
            <p className="text-xs text-[#5E6454]">
              Use Quick Capture to log a sale, outreach batch, or operational note.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#D5CCBA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getEventIcon(item.activity_type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.unit_accent || "#E98569" }}
                    />
                    <span className="font-heading font-bold text-xs text-[#252820]">
                      {item.unit_name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F6F1E8] text-[#5E6454]">
                      {item.activity_type}
                    </span>
                  </div>

                  <p className="text-xs text-[#252820] font-medium leading-relaxed">
                    {item.notes || (item.quantity ? `${item.quantity} ${item.unit || ""} logged via ${item.method}` : "Activity recorded")}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#5E6454] font-medium shrink-0 pl-12 md:pl-0">
                {item.occurred_at}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
