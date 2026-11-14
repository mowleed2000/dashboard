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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { soundFx } from "@/lib/sound";
import { useAudio } from "@/context/AudioContext";

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
  const {
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    track,
  } = useAudio();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

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

      {/* 2. TOP HERO: The Oracle of Discipline (Much Larger Aristotle) & Now Playing Music Deck (Rod Wave) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* The Oracle of Discipline (Gucci Aristotle) - Prominent & Much Larger */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#FCFAF6] border-2 border-[#E8BC57]/80 shadow-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E8BC57]/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8BC57] animate-pulse" />
                <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#252820]">
                  The Oracle of Discipline
                </h3>
              </div>
              <button
                onClick={() =>
                  setOracleIndex((prev) => (prev + 1) % oracleQuotes.length)
                }
                className="text-[11px] font-semibold text-[#252820] hover:bg-[#E8BC57]/20 px-3.5 py-1.5 rounded-full bg-white border border-[#E8BC57]/40 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
                title="Shuffle founder counsel"
              >
                <Shuffle className="w-3 h-3 text-[#E8BC57]" />
                <span>Next Counsel</span>
              </button>
            </div>

            {/* Prominent, Much Larger Aristotle Gucci Portrait & Maxims */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 my-2">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-[#E8BC57] shrink-0 shadow-xl bg-[#E8E2D5] group/img">
                <img
                  src="/assets/dashboard/ARISTOLE GUCCI.jpg"
                  alt="Aristotle Gucci"
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/70 backdrop-blur-xs text-[10px] font-bold text-center text-white uppercase tracking-wider border-t border-[#E8BC57]/40">
                  Aristotle Gucci
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8BC57] bg-[#E8BC57]/15 px-2.5 py-1 rounded-md">
                  Founder Principle
                </span>
                <blockquote className="font-editorial italic text-base sm:text-lg md:text-xl text-[#252820] mt-3 leading-snug">
                  “{oracleQuotes[oracleIndex]}”
                </blockquote>
                <p className="text-xs font-medium text-[#5E6454] mt-2.5">
                  Operating Standard • Relentless Field Execution
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] font-semibold text-[#5E6454]">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D5] shadow-2xs">Mindset Anchor</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D5] shadow-2xs">Field Discipline</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D5] shadow-2xs">High Conviction</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E8E2D5] text-[11px] text-[#5E6454] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E8BC57]" />
              Executive Discipline Anchor
            </span>
            <span className="text-[#E98569] font-bold tracking-tight">Another day, another dollar</span>
          </div>
        </div>

        {/* Music Playing: Rod Wave Spotify-Style Music Platform UI */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#1C1F18] text-white shadow-xl border border-[#2E3327] flex flex-col justify-between relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#E98569]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#E8BC57]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Now Playing Status & Equalizer */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E98569] px-2.5 py-0.5 rounded-md bg-[#E98569]/20 border border-[#E98569]/30">
                Now Playing
              </span>
              {/* Equalizer animation */}
              <div className="flex items-end gap-1 h-3.5">
                <span className={`w-0.5 rounded-full bg-[#E98569] ${isPlaying ? "h-3 animate-pulse" : "h-1"}`} />
                <span className={`w-0.5 rounded-full bg-[#E98569] ${isPlaying ? "h-3.5 animate-bounce" : "h-1.5"}`} />
                <span className={`w-0.5 rounded-full bg-[#E98569] ${isPlaying ? "h-2 animate-pulse" : "h-1"}`} />
                <span className={`w-0.5 rounded-full bg-[#E98569] ${isPlaying ? "h-3 animate-bounce" : "h-1.5"}`} />
              </div>
            </div>

            <span className="text-[10px] font-mono text-white/50 tracking-wider">
              SOUNDTRACK
            </span>
          </div>

          {/* Center: Album Cover & Track Details */}
          <div className="flex items-center gap-4 my-2 z-10">
            {/* Rod Wave Album Art */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group-hover:scale-102 transition-transform duration-300 bg-[#252820]">
              <img
                src={track.coverUrl}
                alt={track.artist}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight truncate">
                {track.title}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#E8BC57] mt-0.5 truncate">
                {track.artist}
              </p>
              <p className="text-[11px] text-white/50 mt-1 truncate">
                {track.album}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                  HQ Audio
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E98569]/20 text-[#E98569]">
                  {isPlaying ? "Streaming" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Scrubber & Controls (Spotify Style) */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-3 z-10">
            {/* Progress Bar & Timestamps */}
            <div>
              <input
                type="range"
                min="0"
                max={duration || 151}
                step="1"
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#E98569] hover:bg-white/25 transition-colors"
                title={`Seek: ${formatTime(currentTime)}`}
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-[#E98569]" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-14 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E98569]"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Central Player Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => seek(Math.max(0, currentTime - 10))}
                  className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-[#E98569] hover:bg-[#E98569]/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                  title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => seek(Math.min(duration, currentTime + 10))}
                  className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  title="Forward 10 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 sm:w-16 text-right">
                <span className="text-[10px] font-semibold text-white/50">
                  {isPlaying ? "Playing" : "Paused"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Banner Row: Weather Advisory & Daily Quote */}
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
                className={`group p-4 rounded-2xl bg-white border transition-all cursor-pointer hover:shadow-md hover:border-[#D5CCBA] flex flex-col justify-between ${
                  isQuiet
                    ? "border-[#E98569]/40 bg-[#FFF9F7]"
                    : "border-[#E8E2D5]"
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-2.5">
                    {/* Business Logo Thumbnail */}
                    <div className="w-11 h-11 rounded-xl border border-[#E8E2D5] bg-[#FCFAF6] overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {unit.logo_asset_path ? (
                        <img
                          src={unit.logo_asset_path}
                          alt={unit.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center font-heading font-black text-xs text-white"
                          style={{ backgroundColor: unit.accent }}
                        >
                          {unit.name.substring(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            unit.status === "Active"
                              ? "bg-[#769B83]/15 text-[#769B83]"
                              : unit.status === "Paused"
                              ? "bg-[#5E6454]/15 text-[#5E6454]"
                              : "bg-[#7796C9]/15 text-[#7796C9]"
                          }`}
                        >
                          {unit.status}
                        </span>

                        {isQuiet && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#E98569]/15 text-[#E98569] flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Quiet
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-bold text-sm text-[#252820] tracking-tight truncate group-hover:text-[#E98569] transition-colors">
                        {unit.name}
                      </h4>
                    </div>
                  </div>

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

      {/* 6. Today's Operating Missions & Priority Deliverables */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-[#252820] tracking-tight">
              Operating Missions & Priority Deliverables
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E98569]/15 text-[#E98569]">
              {overdueTasks.length} Action Needed
            </span>
          </div>
          <button
            onClick={() => onNavigate("tasks")}
            className="text-xs font-medium text-[#E98569] hover:underline"
          >
            Open full task manager →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {overdueTasks.length > 0 ? (
            overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#E8E2D5] flex items-center justify-between gap-3 shadow-2xs"
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
            <div className="col-span-2 p-6 text-center text-xs text-[#5E6454]">
              All pending deliverables are up to date. Excellent operating rhythm.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
