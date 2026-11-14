import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const status = searchParams.get("status");

    let query = `
      SELECT 
        t.*,
        p.name as unit_name,
        p.accent as unit_accent,
        p.slug as unit_slug,
        pr.title as project_title
      FROM tasks t
      JOIN portfolio_units p ON t.portfolio_unit_id = p.id
      LEFT JOIN projects pr ON t.project_id = pr.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (unitId) {
      conditions.push("t.portfolio_unit_id = ?");
      params.push(unitId);
    }
    if (status) {
      conditions.push("t.status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY 
      CASE WHEN t.status = 'done' OR t.status = 'cancelled' THEN 2 ELSE 1 END,
      CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
      t.due_at ASC,
      t.created_at DESC
    `;

    const tasks = db.prepare(query).all(...params) as any[];
    const todayStr = new Date().toISOString().split("T")[0];

    const processedTasks = tasks.map((task) => ({
      ...task,
      is_overdue: task.status !== "done" && task.status !== "cancelled" && task.due_at && task.due_at < todayStr,
    }));

    return NextResponse.json({ success: true, tasks: processedTasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolio_unit_id, project_id, title, status = "not_started", priority = "medium", due_at, notes } = body;

    if (!portfolio_unit_id || !title) {
      return NextResponse.json({ success: false, error: "Venture and task title are required" }, { status: 400 });
    }

    const taskId = `task-${Date.now()}`;
    db.prepare(`
      INSERT INTO tasks (id, portfolio_unit_id, project_id, title, status, priority, due_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(taskId, portfolio_unit_id, project_id || null, title, status, priority, due_at || null, notes || "");

    return NextResponse.json({ success: true, id: taskId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, title, priority, due_at, notes, project_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID required" }, { status: 400 });
    }

    const nowStr = new Date().toISOString();
    let completedAt = null;
    if (status === "done") {
      completedAt = nowStr;
    }

    db.prepare(`
      UPDATE tasks
      SET 
        status = COALESCE(?, status),
        title = COALESCE(?, title),
        priority = COALESCE(?, priority),
        due_at = COALESCE(?, due_at),
        notes = COALESCE(?, notes),
        project_id = COALESCE(?, project_id),
        completed_at = CASE WHEN ? = 'done' THEN ? WHEN ? IS NOT NULL THEN NULL ELSE completed_at END
      WHERE id = ?
    `).run(status, title, priority, due_at, notes, project_id, status, completedAt, status === "not_started" || status === "in_progress" ? 1 : null, id);

    // If task completed, record an activity entry for the portfolio pulse
    if (status === "done") {
      const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id) as any;
      if (task) {
        db.prepare(`
          INSERT INTO activity_entries (id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse)
          VALUES (?, ?, 'milestone', 'task_completion', 1, 'task', ?, ?, 1)
        `).run(`act-${Date.now()}`, task.portfolio_unit_id, new Date().toISOString().split("T")[0], `Completed task: ${task.title}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID required" }, { status: 400 });
    }

    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
