"use client";

import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Package,
  Lightbulb,
  FolderArchive,
  FileBarChart,
  Settings,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export type NavSection =
  | "home"
  | "businesses"
  | "journal"
  | "tasks"
  | "sales"
  | "inventory"
  | "opportunities"
  | "library"
  | "reports"
  | "settings";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenQuickCapture: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  activeVenturesCount: number;
}

export function Sidebar({
  currentSection,
  onSelectSection,
  onOpenQuickCapture,
  isMobileOpen,
  onToggleMobile,
  activeVenturesCount,
}: SidebarProps) {
  const navItems: { id: NavSection; label: string; icon: any; badge?: string }[] = [
    { id: "home", label: "Command Centre", icon: LayoutDashboard },
    { id: "businesses", label: "My Businesses", icon: Briefcase, badge: "9" },
    { id: "journal", label: "Activity Journal", icon: BookOpen },
    { id: "tasks", label: "Tasks & Projects", icon: CheckSquare },
    { id: "sales", label: "Sales & Revenue", icon: TrendingUp },
    { id: "inventory", label: "Stock & Assets", icon: Package },
    { id: "opportunities", label: "Opportunity Board", icon: Lightbulb },
    { id: "library", label: "Business Library", icon: FolderArchive },
    { id: "reports", label: "Reports & Capsules", icon: FileBarChart },
    { id: "settings", label: "Settings & Assets", icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#FCFAF6] border-r border-[#E8E2D5] text-[#252820] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E8E2D5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#252820] text-white flex items-center justify-center font-heading font-black text-sm shadow-xs">
            BC
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm tracking-tight leading-tight text-[#252820]">
              BUSINESS COMMAND
            </h1>
            <p className="text-[11px] font-medium text-[#5E6454]">
              Personal Operator Layer
            </p>
          </div>
        </div>
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-1 rounded-lg text-[#5E6454] hover:bg-[#E8E2D5]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Capture CTA */}
      <div className="p-3">
        <button
          onClick={onOpenQuickCapture}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-medium text-xs shadow-xs transition-all active:scale-[0.98] group"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Quick Capture</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                if (isMobileOpen) onToggleMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#252820] text-white shadow-xs"
                  : "text-[#5E6454] hover:bg-[#E8E2D5]/50 hover:text-[#252820]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#E8BC57]" : "text-[#5E6454]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#E8E2D5] text-[#252820]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator Footer Status */}
      <div className="p-4 border-t border-[#E8E2D5] bg-[#F6F1E8]/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#769B83] animate-pulse" />
          <span className="font-semibold text-[#252820]">9 Ventures Active</span>
        </div>
        <p className="text-[11px] text-[#5E6454] mt-0.5">
          Local database online • London GMT
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 no-print">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Mobile slide-over drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden no-print ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
}
