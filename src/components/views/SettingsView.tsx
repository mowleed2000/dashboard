"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Image as ImageIcon,
  Save,
  Check,
  Volume2,
  CloudSun,
  ShieldAlert,
  Database,
  Download,
  CheckCircle2,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface SettingsViewProps {
  units: any[];
  onRefresh: () => void;
}

export function SettingsView({ units, onRefresh }: SettingsViewProps) {
  const [settings, setSettings] = useState<any>(null);
  const [assetMappings, setAssetMappings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  // Inspectable assets in public/assets/dashboard
  const availableAssets = [
    { filename: "ARISTOLE GUCCI.jpg", path: "/assets/dashboard/ARISTOLE GUCCI.jpg", note: "The Oracle / Aristotle Element" },
    { filename: "CCR OUR LOGO.png", path: "/assets/dashboard/CCR OUR LOGO.png", note: "CCR Logo (Transparent RGBA)" },
    { filename: "CollabCreateCall.png", path: "/assets/dashboard/CollabCreateCall.png", note: "CollabCreateCall Primary Logo" },
    { filename: "CollabCreateCall Neon Voice Logo.png", path: "/assets/dashboard/CollabCreateCall Neon Voice Logo.png", note: "CollabCreateCall Neon Voice (Alternate)" },
    { filename: "logo website package.jpg", path: "/assets/dashboard/logo website package.jpg", note: "Website Package Logo" },
    { filename: "Rest Assured Pet Recovery.png", path: "/assets/dashboard/Rest Assured Pet Recovery.png", note: "Pet Recovery Brand Mark" },
    { filename: "superpower-project-favicon.svg (2).png", path: "/assets/dashboard/superpower-project-favicon.svg (2).png", note: "Super Power Project Mark" },
    { filename: "uber eats referals.png", path: "/assets/dashboard/uber eats referals.png", note: "Uber Eats Referrals Logo" },
    { filename: "UK Utility guys.webp", path: "/assets/dashboard/UK Utility guys.webp", note: "UK Utility Guys Logo" },
  ];

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.general || {});
        setAssetMappings(data.asset_mappings || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "general", value: settings }),
      });
      soundFx.playTaskComplete();
      setSaveMessage("Settings saved successfully!");
      onRefresh();
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMappings = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "asset_mappings", value: assetMappings }),
      });
      soundFx.playTaskComplete();
      setSaveMessage("Asset mappings updated across portfolio!");
      onRefresh();
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const updateMapping = (unitId: string, assignedPath: string) => {
    setAssetMappings((prev: any) => ({
      ...prev,
      [unitId]: {
        ...(prev[unitId] || {}),
        assigned_asset: assignedPath === "none" ? null : assignedPath,
      },
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            System Configuration & Branding
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Settings & Asset Mapping
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Manage logo-to-venture assignments, weather parameters, sound rules, and backups.
          </p>
        </div>

        {saveMessage && (
          <span className="text-xs font-semibold text-[#769B83] flex items-center gap-1.5 self-start md:self-auto bg-[#769B83]/15 px-3 py-1.5 rounded-xl border border-[#769B83]/30">
            <CheckCircle2 className="w-4 h-4" />
            {saveMessage}
          </span>
        )}
      </div>

      {/* 1. Interactive Asset-Mapping Review UI */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E98569]" />
              <h3 className="font-heading font-bold text-base text-[#252820]">
                Asset-Mapping Review & Assignment
              </h3>
            </div>
            <p className="text-xs text-[#5E6454] mt-0.5">
              Review inspected asset thumbnails and assign logos to the 9 portfolio units without modifying original files.
            </p>
          </div>

          <button
            onClick={handleSaveMappings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#252820] hover:bg-[#252820]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Mappings</span>
          </button>
        </div>

        {/* Gallery / Assignment Table */}
        <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden divide-y divide-[#E8E2D5]">
          {units.map((unit) => {
            const currentAssignment = assetMappings[unit.id]?.assigned_asset || unit.logo_asset_path;
            return (
              <div
                key={unit.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FCFAF6] hover:bg-white transition-colors text-xs"
              >
                {/* Venture Info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: unit.accent }}
                  />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#252820]">
                      {unit.name}
                    </h4>
                    <span className="text-[10px] font-semibold uppercase text-[#5E6454]">
                      {unit.type.replace(/_/g, " ")} • {unit.status}
                    </span>
                  </div>
                </div>

                {/* Assigned Thumbnail Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-[#E8E2D5] bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {currentAssignment ? (
                      <img
                        src={currentAssignment}
                        alt="Thumbnail"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-[#5E6454] text-center font-bold">
                        Badge
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5E6454] max-w-[180px] truncate">
                    {currentAssignment ? currentAssignment.split("/").pop() : "Typographic badge"}
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div className="min-w-[260px]">
                  <select
                    value={currentAssignment || "none"}
                    onChange={(e) => updateMapping(unit.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
                  >
                    <option value="none">— No file (use styled badge) —</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.path} value={asset.path}>
                        {asset.filename} ({asset.note})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Weather & Operational Thresholds */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-[#E8BC57]" />
          <h3 className="font-heading font-bold text-base text-[#252820]">
            Weather Integration & Field Advisory
          </h3>
        </div>

        {settings && (
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#5E6454] mb-1">City</label>
                <input
                  type="text"
                  value={settings.weather_location?.city || "London"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weather_location: { ...settings.weather_location, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-[#252820]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#5E6454] mb-1">Country</label>
                <input
                  type="text"
                  value={settings.weather_location?.country || "UK"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weather_location: { ...settings.weather_location, country: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-[#252820]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#5E6454] mb-1">Cold Advisory Threshold (°C)</label>
                <input
                  type="number"
                  value={settings.cold_weather_threshold ?? 6}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cold_weather_threshold: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-[#252820]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#5E6454] mb-1">Advisory Copy</label>
                <input
                  type="text"
                  value={settings.cold_weather_message || "Maybe stick to the phone 🤭"}
                  onChange={(e) =>
                    setSettings({ ...settings, cold_weather_message: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-[#252820]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Data Protection & Full Export */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#769B83]" />
          <h3 className="font-heading font-bold text-base text-[#252820]">
            Data Export & Backup
          </h3>
        </div>
        <p className="text-xs text-[#5E6454]">
          Export all portfolio ledgers, task records, and financial transactions for independent local archive or external analysis.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/api/export?format=json"
            download="business-command-full-backup.json"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#252820] hover:bg-[#F6F1E8]"
          >
            <Download className="w-3.5 h-3.5 text-[#5E6454]" />
            <span>Download Full JSON Backup</span>
          </a>
          <a
            href="/api/export?format=csv&type=sales"
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#252820] hover:bg-[#F6F1E8]"
          >
            <Download className="w-3.5 h-3.5 text-[#5E6454]" />
            <span>Export Transactions (CSV)</span>
          </a>
          <a
            href="/api/export?format=csv&type=tasks"
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FCFAF6] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#252820] hover:bg-[#F6F1E8]"
          >
            <Download className="w-3.5 h-3.5 text-[#5E6454]" />
            <span>Export Tasks (CSV)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
