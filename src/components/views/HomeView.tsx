"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  TrendingUp,
  CreditCard,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shuffle,
  Star,
  CloudSun,
  Flame,
  ArrowRight,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Calendar,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface HomeViewProps {
  units: any[];
  onSelectUnit: (unitId: string) => void;
  onOpenQuickCapture: () => void;
  onNavigate: (section: any) => void;
}

export function HomeView({
  units,
  onSelectUnit,
  onOpenQuickCapture,
  onNavigate,
}: HomeViewProps) {
  const [weather, setWeather] = useState<any>(null);
  const [dailyQuote, setDailyQuote] = useState<any>(null);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // The Oracle sayings
  const oracleQuotes = [
    "Revenue solves all known business doubts.",
    "Do not confuse movement with achievement. Knock on doors or make the calls.",
    "A direct debit is the founder's peaceful sleep.",
    "First deliver for the customers who paid you today.",
    "Simplicity in offer; relentless in execution.",
  ];
  const [oracleIndex, setOracleIndex] = useState(0);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [wRes, qRes, sRes, aRes, tRes] = await Promise.all([
        fetch("/api/weather"),
        fetch("/api/quotes"),
        fetch("/api/sales"),
        fetch("/api/activity?limit=6"),
        fetch("/api/tasks"),
      ]);

      if (wRes.ok) setWeather(await wRes.json());
      if (qRes.ok) {
        const qData = await qRes.json();
        setDailyQuote(qData.daily_quote);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSalesSummary(sData.summary);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setRecentActivities(aData.activities || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        const overdues = (tData.tasks || []).filter((t: any) => t.is_overdue);
        setOverdueTasks(overdues.slice(0, 5));
      }
    } catch (err) {
      console.error("HomeView fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const [todayDateFormatted, setTodayDateFormatted] = useState("");

  useEffect(() => {
    setTodayDateFormatted(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    fetchHomeData();
  }, []);

  const handleShuffleQuote = async () => {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "shuffle" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quote) setDailyQuote(data.quote);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavouriteQuote = async () => {
    if (!dailyQuote?.id) return;
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_favourite", id: dailyQuote.id }),
      });
      setDailyQuote((prev: any) => ({
        ...prev,
        is_favourite: prev.is_favourite ? 0 : 1,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Greeting & Date */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Daily Executive Briefing
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Morning, operator.
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            {todayDateFormatted} • 9 Ventures in Active Orbit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHomeData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-medium text-[#5E6454] hover:bg-[#F6F1E8] transition-colors shadow-2xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Pulse</span>
          </button>
          <button
            onClick={onOpenQuickCapture}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Capture</span>
          </button>
        </div>
      </div>

      {/* 2. Top Banner Row: Weather Advisory & Daily Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weather Module with Cold-Weather Phone Advisory */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#5E6454]">
                <CloudSun className="w-4 h-4 text-[#E8BC57]" />
                <span>
                  {weather?.city || "London"}, {weather?.country || "UK"}
                </span>
                <span className="text-[10px] text-[#5E6454]/60">• {weather?.last_updated || "Live"}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-heading font-extrabold text-3xl text-[#252820]">
                  {weather ? `${weather.temperature}°C` : "9°C"}
                </span>
                <span className="text-xs font-medium text-[#5E6454]">
                  Feels like {weather ? `${weather.feels_like}°C` : "8°C"} • {weather?.condition || "Partly Cloudy"}
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] font-medium text-[#5E6454]">
              <div>H: {weather?.high || 12}° • L: {weather?.low || 5}°</div>
              <div>Rain: {weather?.precipitation_probability ?? 10}%</div>
            </div>
          </div>

          {/* Cold Advisory Highlight */}
          <div className="mt-4 p-3 rounded-xl bg-[#F6F1E8] border border-[#E8E2D5] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E98569]/15 flex items-center justify-center shrink-0">
              <PhoneCall className="w-3.5 h-3.5 text-[#E98569]" />
            </div>
            <p className="text-xs font-medium text-[#252820] leading-snug">
              {weather?.advice || "Maybe stick to the phone 🤭"}
            </p>
          </div>
        </div>

        {/* Daily Quote Module */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs flex flex-col justify-between relative group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6454] px-2 py-0.5 rounded-md bg-[#F6F1E8]">
              {dailyQuote?.category || "Operator Wisdom"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleFavouriteQuote}
                className="p-1.5 rounded-lg text-[#5E6454] hover:text-[#E8BC57] transition-colors"
                title="Save as favourite"
              >
                <Star
                  className={`w-4 h-4 ${
                    dailyQuote?.is_favourite ? "fill-[#E8BC57] text-[#E8BC57]" : ""
                  }`}
                />
              </button>
              <button
                onClick={handleShuffleQuote}
                className="p-1.5 rounded-lg text-[#5E6454] hover:text-[#252820] hover:bg-[#F6F1E8] transition-colors"
                title="Shuffle another quote"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="my-3">
            <blockquote className="font-editorial italic text-lg md:text-xl text-[#252820] leading-snug">
              “{dailyQuote?.text || "Another day, another dollar."}”
            </blockquote>
            <p className="text-xs font-medium text-[#5E6454] mt-1.5 text-right">
              — {dailyQuote?.attribution || "Operator Motto"}
            </p>
          </div>

          <div className="text-[10px] text-[#5E6454]/70 flex items-center justify-between border-t border-[#E8E2D5]/50 pt-2">
            <span>Curated mindset engine</span>
            <span>Tap shuffle for fresh inspiration</span>
          </div>
        </div>
      </div>

      {/* 3. Portfolio Scoreboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-sm text-[#252820] tracking-tight">
            Portfolio Scoreboard
          </h3>
          <span className="text-[11px] text-[#5E6454]">
            Confirmed figures from source records only
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5E6454]">Cash Collected</span>
              <div className="w-7 h-7 rounded-lg bg-[#769B83]/15 flex items-center justify-center text-[#769B83]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="font-heading font-extrabold text-2xl text-[#252820] mt-2">
              £{(salesSummary?.total_cash_received || 20).toFixed(2)}
            </div>
            <p className="text-[11px] text-[#769B83] font-medium mt-1">
              Settled cash in bank
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5E6454]">Contracted MRR</span>
              <div className="w-7 h-7 rounded-lg bg-[#7796C9]/15 flex items-center justify-center text-[#7796C9]">
                <Repeat className="w-4 h-4" />
              </div>
            </div>
            <div className="font-heading font-extrabold text-2xl text-[#252820] mt-2">
              £{(salesSummary?.active_mrr || 150).toFixed(2)}
              <span className="text-xs font-normal text-[#5E6454]">/mo</span>
            </div>
            <p className="text-[11px] text-[#7796C9] font-medium mt-1">
              {salesSummary?.active_subscriptions_count || 2} Active Direct Debits
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5E6454]">Stated Snapshot MTD</span>
              <div className="w-7 h-7 rounded-lg bg-[#E98569]/15 flex items-center justify-center text-[#E98569]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="font-heading font-extrabold text-2xl text-[#252820] mt-2">
              £300.00
            </div>
            <p className="text-[11px] text-[#E98569] font-medium mt-1">
              NFC user-stated figure
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5E6454]">Open Deliverables</span>
              <div className="w-7 h-7 rounded-lg bg-[#E8BC57]/15 flex items-center justify-center text-[#E8BC57]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="font-heading font-extrabold text-2xl text-[#252820] mt-2">
              2 Urgent
            </div>
            <p className="text-[11px] text-[#E8BC57] font-medium mt-1">
              Website Package fulfilment
            </p>
          </div>
        </div>
      </div>

      {/* 4. Business Pulse: All 9 Portfolio Units */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-[#252820] tracking-tight">
              Business Pulse
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#769B83]/15 text-[#769B83]">
              Inactivity Engine Active
            </span>
          </div>
          <button
            onClick={() => onNavigate("businesses")}
            className="text-xs font-medium text-[#E98569] hover:underline flex items-center gap-1"
          >
            <span>View all 9 ventures</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {units.map((unit) => {
            const isPaused = unit.status === "Paused";
            const isQuiet = unit.metrics?.pulse_state === "quiet";
            const isAttention = unit.metrics?.pulse_state === "attention";

            return (
              <div
                key={unit.id}
                onClick={() => onSelectUnit(unit.id)}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer hover:shadow-md hover:border-[#D5CCBA] flex flex-col justify-between ${
                  isQuiet
                    ? "border-[#E98569]/40 bg-[#FFF9F7]"
                    : "border-[#E8E2D5]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: unit.accent }}
                      />
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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

                    {isQuiet && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E98569]/15 text-[#E98569] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Quiet
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-sm text-[#252820] tracking-tight truncate">
                    {unit.name}
                  </h4>
                  <p className="text-[11px] text-[#5E6454] line-clamp-2 mt-0.5 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E8E2D5]/60 flex items-center justify-between text-[11px]">
                  <div className="text-[#5E6454]">
                    {unit.metrics?.mrr > 0 ? (
                      <span className="font-semibold text-[#252820]">
                        £{unit.metrics.mrr}/mo MRR
                      </span>
                    ) : unit.metrics?.mtd_revenue > 0 ? (
                      <span className="font-semibold text-[#252820]">
                        £{unit.metrics.mtd_revenue} cash
                      </span>
                    ) : (
                      <span className="text-[#5E6454]">
                        {unit.metrics?.open_tasks || 0} open task(s)
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-medium text-[#5E6454]">
                    {isPaused
                      ? "Alerts suppressed"
                      : unit.metrics?.days_since_activity < 999
                      ? `${unit.metrics.days_since_activity}d ago`
                      : "No activity"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Split: Today's Priorities & The Oracle / Aristotle Element */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Priorities / Deliverables */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-[#252820] tracking-tight">
                Operating Missions & Deliverables
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E98569]/15 text-[#E98569]">
                Action Needed
              </span>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs font-medium text-[#E98569] hover:underline"
            >
              Task manager
            </button>
          </div>

          <div className="space-y-2.5">
            {overdueTasks.length > 0 ? (
              overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        soundFx.playTaskComplete();
                        await fetch("/api/tasks", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: task.id, status: "done" }),
                        });
                        fetchHomeData();
                      }}
                      className="w-5 h-5 rounded-md border border-[#D5CCBA] hover:border-[#769B83] hover:bg-[#769B83]/10 flex items-center justify-center transition-colors"
                      title="Mark as done"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-transparent hover:text-[#769B83]" />
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-[#252820] leading-tight">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#5E6454] mt-0.5">
                        {task.unit_name} • {task.notes || "Priority deliverable"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E98569]/15 text-[#E98569] shrink-0">
                    Overdue
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#5E6454]">
                All pending deliverables are up to date. Excellent operating rhythm.
              </div>
            )}
          </div>
        </div>

        {/* The Oracle Module (Gucci Aristotle) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FCFAF6] border border-[#E8E2D5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8BC57]" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#252820]">
                  The Oracle
                </h3>
              </div>
              <button
                onClick={() =>
                  setOracleIndex((prev) => (prev + 1) % oracleQuotes.length)
                }
                className="text-[10px] font-medium text-[#5E6454] hover:text-[#252820] px-2 py-0.5 rounded-md bg-white border border-[#E8E2D5]"
              >
                Next Word
              </button>
            </div>

            <div className="flex items-center gap-3.5 my-2">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#E8BC57] shrink-0 shadow-xs bg-[#E8E2D5]">
                {/* Served from public directory */}
                <img
                  src="/assets/dashboard/ARISTOLE GUCCI.jpg"
                  alt="Gucci Aristotle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6454]">
                  Aristotle Gucci
                </span>
                <p className="font-editorial italic text-xs text-[#252820] mt-0.5 leading-snug">
                  “{oracleQuotes[oracleIndex]}”
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E2D5] text-[10px] text-[#5E6454] flex items-center justify-between">
            <span>Executive Counsel</span>
            <span className="text-[#E98569] font-medium">Keep moving</span>
          </div>
        </div>
      </div>
    </div>
  );
}
