import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    let query = `
      SELECT pr.*, p.name as unit_name, p.accent as unit_accent, p.slug as unit_slug
      FROM projects pr
      JOIN portfolio_units p ON pr.portfolio_unit_id = p.id
    `;
    const params: any[] = [];
    if (unitId) {
      query += ` WHERE pr.portfolio_unit_id = ?`;
      params.push(unitId);
    }
    query += ` ORDER BY pr.created_at DESC`;

    const projects = db.prepare(query).all(...params) as any[];

    // Fetch linked tasks for each project
    const enrichedProjects = projects.map((proj) => {
      const tasks = db.prepare(`
        SELECT * FROM tasks WHERE project_id = ? ORDER BY due_at ASC
      `).all(proj.id) as any[];

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "done").length;
      const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : proj.progress_percentage;

      return {
        ...proj,
        tasks,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        calculated_progress: calculatedProgress,
      };
    });

    return NextResponse.json({ success: true, projects: enrichedProjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolio_unit_id, title, status = "in_progress", target_date, description, progress_percentage = 0 } = body;

    if (!portfolio_unit_id || !title) {
      return NextResponse.json({ success: false, error: "Venture and project title are required" }, { status: 400 });
    }

    const projectId = `proj-${Date.now()}`;
    db.prepare(`
      INSERT INTO projects (id, portfolio_unit_id, title, status, target_date, description, progress_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(projectId, portfolio_unit_id, title, status, target_date || null, description || "", progress_percentage);

    return NextResponse.json({ success: true, id: projectId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
