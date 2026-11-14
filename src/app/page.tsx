"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavSection } from "@/components/Sidebar";
import { AudioPlayer } from "@/components/AudioPlayer";
import { QuickCaptureModal } from "@/components/QuickCaptureModal";
import { HomeView } from "@/components/views/HomeView";
import { BusinessesView } from "@/components/views/BusinessesView";
import { ActivityJournalView } from "@/components/views/ActivityJournalView";
import { TasksProjectsView } from "@/components/views/TasksProjectsView";
import { SalesRevenueView } from "@/components/views/SalesRevenueView";
import { InventoryView } from "@/components/views/InventoryView";
import { OpportunitiesView } from "@/components/views/OpportunitiesView";
import { LibraryView } from "@/components/views/LibraryView";
import { ReportsView } from "@/components/views/ReportsView";
import { SettingsView } from "@/components/views/SettingsView";
import { Menu, PlusCircle, Sparkles } from "lucide-react";

export default function BusinessCommandApp() {
  const [currentSection, setCurrentSection] = useState<NavSection>("home");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
      }
    } catch (err) {
      console.error("Error fetching units:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSelectUnitFromPulse = (unitId: string) => {
    setSelectedUnitId(unitId);
    setCurrentSection("businesses");
  };

  return (
    <div className="min-h-screen flex bg-[#F6F1E8] text-[#252820]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          if (sec !== "businesses") setSelectedUnitId(null);
        }}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        isMobileOpen={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        activeVenturesCount={units.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-[#F6F1E8]/85 backdrop-blur-md border-b border-[#E8E2D5] no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E8E2D5] text-[#5E6454] hover:text-[#252820]"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#769B83]" />
              <span className="text-xs font-semibold text-[#5E6454] uppercase tracking-wider">
                Founder Headquarters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio soundtrack player (Rod Wave track) */}
            <AudioPlayer />

            {/* Quick Capture header CTA */}
            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Capture</span>
            </button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 px-4 md:px-8 pt-6">
          {currentSection === "home" && (
            <HomeView
              units={units}
              onSelectUnit={handleSelectUnitFromPulse}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              onNavigate={(sec) => setCurrentSection(sec)}
            />
          )}

          {currentSection === "businesses" && (
            <BusinessesView
              units={units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              onRefresh={fetchUnits}
            />
          )}

          {currentSection === "journal" && (
            <ActivityJournalView
              units={units}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
            />
          )}

          {currentSection === "tasks" && (
            <TasksProjectsView
              units={units}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
            />
          )}

          {currentSection === "sales" && (
            <SalesRevenueView
              units={units}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
            />
          )}

          {currentSection === "inventory" && (
            <InventoryView
              units={units}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
            />
          )}

          {currentSection === "opportunities" && (
            <OpportunitiesView
              units={units}
              onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
            />
          )}

          {currentSection === "library" && <LibraryView units={units} />}

          {currentSection === "reports" && <ReportsView units={units} />}

          {currentSection === "settings" && (
            <SettingsView units={units} onRefresh={fetchUnits} />
          )}
        </main>
      </div>

      {/* Universal Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        units={units}
        onSuccess={fetchUnits}
      />
    </div>
  );
}
