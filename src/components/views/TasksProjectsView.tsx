"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  PlusCircle,
  Check,
  FolderKanban,
  Flag,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface TasksProjectsViewProps {
  units: any[];
  onOpenQuickCapture: () => void;
}

export function TasksProjectsView({ units, onOpenQuickCapture }: TasksProjectsViewProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVenture, setFilterVenture] = useState("");
  const [filterView, setFilterView] = useState<"all" | "overdue" | "today" | "completed">("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks(tData.tasks || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setProjects(pData.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
    fetchData();
  }, []);

  const handleToggleTask = async (task: any) => {
    const isDone = task.status === "done";
    const newStatus = isDone ? "not_started" : "done";

    if (!isDone) {
      soundFx.playTaskComplete();
      soundFx.triggerConfetti();
    }

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterVenture && t.portfolio_unit_id !== filterVenture) return false;
    if (filterView === "overdue") return t.is_overdue;
    if (filterView === "today") return t.due_at === todayStr && t.status !== "done";
    if (filterView === "completed") return t.status === "done";
    return true;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgent":
        return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E98569]/15 text-[#E98569]">Urgent</span>;
      case "high":
        return <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8BC57]/20 text-[#252820]">High</span>;
      default:
        return <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F6F1E8] text-[#5E6454]">{p}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D5]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#E98569]">
            Execution & Delivery Engine
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#252820] tracking-tight mt-0.5">
            Tasks & Projects
          </h2>
          <p className="text-xs md:text-sm text-[#5E6454] mt-1 font-medium">
            Track commitments, client website delivery obligations, and milestones.
          </p>
        </div>

        <button
          onClick={onOpenQuickCapture}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E98569] hover:bg-[#E98569]/90 text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Projects Overview Row */}
      <div>
        <h3 className="font-heading font-bold text-sm text-[#252820] mb-3">
          Active Projects & Milestones ({projects.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E98569]">
                    {proj.unit_name}
                  </span>
                  <h4 className="font-heading font-bold text-base text-[#252820] mt-0.5">
                    {proj.title}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-[#769B83] bg-[#769B83]/15 px-2.5 py-0.5 rounded-full">
                  {proj.calculated_progress}% Complete
                </span>
              </div>

              <p className="text-xs text-[#5E6454] leading-relaxed">
                {proj.description}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[#E8E2D5]/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#769B83] h-full rounded-full transition-all duration-300"
                  style={{ width: `${proj.calculated_progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5E6454] pt-1">
                <span>{proj.completed_tasks} of {proj.total_tasks} deliverables completed</span>
                <span>Target: {proj.target_date || "Ongoing"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter / View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8E2D5]">
          {[
            { id: "all", label: "All Tasks" },
            { id: "today", label: "Due Today" },
            { id: "overdue", label: "Overdue" },
            { id: "completed", label: "Completed" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setFilterView(v.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterView === v.id
                  ? "bg-[#252820] text-white shadow-xs"
                  : "text-[#5E6454] hover:bg-[#F6F1E8]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <select
          value={filterVenture}
          onChange={(e) => setFilterVenture(e.target.value)}
          className="px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#252820] focus:ring-2 focus:ring-[#E98569] focus:outline-hidden"
        >
          <option value="">Filter by Venture: All 9</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#5E6454]">Loading task list...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5E6454]">
            No tasks match the selected criteria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                task.status === "done"
                  ? "bg-[#FCFAF6] border-[#E8E2D5]/60 opacity-60"
                  : task.is_overdue
                  ? "bg-[#FFF9F7] border-[#E98569]/30"
                  : "bg-white border-[#E8E2D5]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    task.status === "done"
                      ? "bg-[#769B83] border-[#769B83] text-white"
                      : "border-[#D5CCBA] hover:border-[#769B83]"
                  }`}
                  title={task.status === "done" ? "Mark incomplete" : "Mark done"}
                >
                  {task.status === "done" && <Check className="w-3.5 h-3.5" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: task.unit_accent || "#E98569" }}
                    />
                    <span className="font-heading font-semibold text-[11px] text-[#5E6454]">
                      {task.unit_name}
                    </span>
                    {task.project_title && (
                      <span className="text-[10px] text-[#5E6454]/60">
                        • {task.project_title}
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-semibold text-xs mt-0.5 ${
                      task.status === "done" ? "line-through text-[#5E6454]" : "text-[#252820]"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.notes && (
                    <p className="text-[11px] text-[#5E6454] mt-0.5">{task.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {getPriorityBadge(task.priority)}
                <span
                  className={`text-[11px] font-medium ${
                    task.is_overdue ? "text-[#E98569] font-bold" : "text-[#5E6454]"
                  }`}
                >
                  {task.is_overdue
                    ? `Overdue (${task.due_at})`
                    : task.due_at
                    ? `Due ${task.due_at}`
                    : "No due date"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
