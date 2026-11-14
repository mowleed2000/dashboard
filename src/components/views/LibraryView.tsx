"use client";

import React, { useState, useEffect } from "react";
import {
  FolderArchive,
  Search,
  ExternalLink,
  PlusCircle,
  FileText,
  Bookmark,
  Tag,
} from "lucide-react";

interface LibraryViewProps {
  units: any[];
}

export function LibraryView({ units }: LibraryViewProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("script");
  const [newUnit, setNewUnit] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          resource_type: newType,
          portfolio_unit_id: newUnit || null,
          notes: newNotes,
        }),
      });
      setNewTitle("");
      setNewUrl("");
      setNewNotes("");
      setIsAdding(false);
      fetchResources();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = resources.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(s) ||
      (r.notes && r.notes.toLowerCase().includes(s)) ||
      (r.unit_name && r.unit_name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Intellectual Capital & Reference Assets
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Business Library
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Central repository for sales scripts, supplier directories, client agreements, and reference assets.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Add Resource Drawer Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-2xl bg-[#FCFAF6] border border-[#E8E2D5] space-y-3 animate-in fade-in"
        >
          <h4 className="font-heading font-bold text-sm text-[#252820]">
            Save New Resource / Document
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#5E6454] mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. NFC Pitch Script v2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5E6454] mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
              >
                <option value="script">Sales Script</option>
                <option value="contract">Contract / Agreement</option>
                <option value="supplier">Supplier Directory</option>
                <option value="guide">Guide / Standard Operating Procedure</option>
                <option value="link">Web Link / Tool</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5E6454] mb-1">Venture</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
              >
                <option value="">Global / All Ventures</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5E6454] mb-1">URL / File Path</label>
            <input
              type="text"
              placeholder="e.g. https://... or C:\..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5E6454] mb-1">Notes / Key Takeaways</label>
            <textarea
              rows={2}
              placeholder="Key terms, pricing structure, or operating notes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#5E6454] hover:bg-[#E8E2D5]/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#E98569] text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Save Resource
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#5E6454] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search library documents, pricing formulas, agreements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D5] rounded-2xl text-xs text-[#252820] shadow-xs focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
        />
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#D5CCBA] transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F6F1E8] text-[#5E6454]">
                  {item.resource_type}
                </span>
                {item.unit_name && (
                  <span className="text-[10px] font-semibold text-[#E98569]">
                    {item.unit_name}
                  </span>
                )}
              </div>

              <h4 className="font-heading font-bold text-sm text-[#252820]">
                {item.title}
              </h4>

              {item.notes && (
                <p className="text-xs text-[#5E6454] mt-1.5 line-clamp-3 leading-relaxed">
                  {item.notes}
                </p>
              )}
            </div>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7796C9] hover:underline pt-2 border-t border-[#E8E2D5]"
              >
                <span>Open link / asset</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
