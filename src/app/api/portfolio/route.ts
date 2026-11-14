import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const units = db.prepare(`
      SELECT * FROM portfolio_units ORDER BY sort_order ASC, name ASC
    `).all() as any[];

    const todayStr = new Date().toISOString().split("T")[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const enrichedUnits = units.map((unit) => {
      // Calculate MTD Revenue
      const mtdSales = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
        FROM transactions
        WHERE portfolio_unit_id = ? AND payment_status = 'received' AND occurred_at >= ?
      `).get(unit.id, firstDayOfMonth) as { total: number; count: number };

      // Calculate MRR from active recurring agreements
      const mrrData = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as mrr, COUNT(*) as active_count
        FROM recurring_agreements
        WHERE portfolio_unit_id = ? AND status = 'active'
      `).get(unit.id) as { mrr: number; active_count: number };

      // Calculate tasks status
      const taskStats = db.prepare(`
        SELECT 
          COUNT(CASE WHEN status != 'done' AND status != 'cancelled' THEN 1 END) as open_tasks,
          COUNT(CASE WHEN status != 'done' AND status != 'cancelled' AND due_at < ? THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks
        FROM tasks
        WHERE portfolio_unit_id = ?
      `).get(todayStr, unit.id) as { open_tasks: number; overdue_tasks: number; completed_tasks: number };

      // Calculate projects status
      const projectStats = db.prepare(`
        SELECT COUNT(*) as open_projects
        FROM projects
        WHERE portfolio_unit_id = ? AND status != 'completed'
      `).get(unit.id) as { open_projects: number };

      // Find last qualifying activity
      const lastActivity = db.prepare(`
        SELECT occurred_at, activity_type, notes
        FROM activity_entries
        WHERE portfolio_unit_id = ? AND qualifies_for_pulse = 1
        ORDER BY occurred_at DESC, created_at DESC
        LIMIT 1
      `).get(unit.id) as { occurred_at: string; activity_type: string; notes: string } | undefined;

      let daysSinceActivity = 999;
      if (lastActivity && lastActivity.occurred_at) {
        const lastDate = new Date(lastActivity.occurred_at).getTime();
        const diffDays = Math.floor((new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24));
        daysSinceActivity = Math.max(0, diffDays);
      }

      // Determine Pulse status:
      // Paused: suppress alerts
      // Active: alert if daysSinceActivity >= 3 ("It's getting quiet in here...")
      // Pending/Development: alert only if open deliverables or overdue tasks exist
      let pulseState = "healthy";
      let pulseMessage = "Operations normal";

      if (unit.status === "Paused") {
        pulseState = "paused";
        pulseMessage = "Paused — inactivity alerts suppressed";
      } else if (unit.status === "Active") {
        if (daysSinceActivity >= 3) {
          pulseState = "quiet";
          pulseMessage = `No qualifying activity for ${daysSinceActivity} days. It's getting quiet in here...`;
        } else {
          pulseState = "active";
          pulseMessage = "Recent activity recorded";
        }
      } else if (unit.status === "Pending" || unit.status === "Development") {
        if (taskStats.overdue_tasks > 0) {
          pulseState = "attention";
          pulseMessage = `${taskStats.overdue_tasks} overdue launch milestone(s)`;
        } else {
          pulseState = "development";
          pulseMessage = "In incubation / pre-launch";
        }
      }

      return {
        ...unit,
        metrics: {
          mtd_revenue: mtdSales.total,
          mtd_sales_count: mtdSales.count,
          mrr: mrrData.mrr,
          active_subscriptions: mrrData.active_count,
          open_tasks: taskStats.open_tasks,
          overdue_tasks: taskStats.overdue_tasks,
          completed_tasks: taskStats.completed_tasks,
          open_projects: projectStats.open_projects,
          last_activity: lastActivity || null,
          days_since_activity: daysSinceActivity,
          pulse_state: pulseState,
          pulse_message: pulseMessage,
        },
      };
    });

    return NextResponse.json({ success: true, units: enrichedUnits });
  } catch (error: any) {
    console.error("Error fetching portfolio units:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, type, status, description, accent, logo_asset_path, logo_asset_alt_path, target_revenue } = body;

    const unitId = id || `unit-${Date.now()}`;
    const unitSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const stmt = db.prepare(`
      INSERT INTO portfolio_units (id, name, slug, type, status, description, accent, logo_asset_path, logo_asset_alt_path, target_revenue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      unitId,
      name,
      unitSlug,
      type || "operating_business",
      status || "Pending",
      description || "",
      accent || "#E98569",
      logo_asset_path || null,
      logo_asset_alt_path || null,
      target_revenue || 0
    );

    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, after_json)
      VALUES (?, 'portfolio_unit', ?, 'create', ?)
    `).run(`aud-${Date.now()}`, unitId, JSON.stringify(body));

    return NextResponse.json({ success: true, id: unitId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, accent, logo_asset_path, logo_asset_alt_path, target_revenue, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing unit ID" }, { status: 400 });
    }

    const before = db.prepare(`SELECT * FROM portfolio_units WHERE id = ?`).get(id);

    db.prepare(`
      UPDATE portfolio_units
      SET 
        status = COALESCE(?, status),
        accent = COALESCE(?, accent),
        logo_asset_path = COALESCE(?, logo_asset_path),
        logo_asset_alt_path = COALESCE(?, logo_asset_alt_path),
        target_revenue = COALESCE(?, target_revenue),
        description = COALESCE(?, description),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, accent, logo_asset_path, logo_asset_alt_path, target_revenue, description, id);

    const after = db.prepare(`SELECT * FROM portfolio_units WHERE id = ?`).get(id);

    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, before_json, after_json)
      VALUES (?, 'portfolio_unit', ?, 'update', ?, ?)
    `).run(`aud-${Date.now()}`, id, JSON.stringify(before), JSON.stringify(after));

    return NextResponse.json({ success: true, unit: after });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
