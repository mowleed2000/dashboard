import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json"; // 'json' or 'csv'
    const type = searchParams.get("type") || "portfolio"; // 'portfolio', 'sales', 'tasks', 'activities', 'inventory'
    const unitId = searchParams.get("unitId");

    const now = new Date();
    const meta = {
      generated_at: now.toISOString(),
      report_date_local: now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      currency: "GBP",
      timezone: "Europe/London",
      source: "Business Command Operating System",
      data_integrity_notice: "Estimated figures and unverified historical snapshots are labeled. Cash figures reflect confirmed settled transactions only."
    };

    if (format === "csv") {
      if (type === "sales") {
        const rows = db.prepare(`
          SELECT t.id, p.name as venture, t.occurred_at, t.type, t.amount, t.currency, t.payment_status, t.payment_method, t.customer_label, t.product_service, t.notes
          FROM transactions t
          JOIN portfolio_units p ON t.portfolio_unit_id = p.id
          ORDER BY t.occurred_at DESC
        `).all() as any[];

        const header = "ID,Venture,Date,Type,Amount,Currency,Payment Status,Payment Method,Customer,Product/Service,Notes\n";
        const csvRows = rows.map((r) => 
          `"${r.id}","${r.venture}","${r.occurred_at}","${r.type}",${r.amount},"${r.currency}","${r.payment_status}","${r.payment_method}","${r.customer_label || ""}","${r.product_service || ""}","${(r.notes || "").replace(/"/g, '""')}"`
        ).join("\n");

        return new Response(header + csvRows, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="business-command-sales-${now.toISOString().split("T")[0]}.csv"`
          }
        });
      }

      if (type === "tasks") {
        const rows = db.prepare(`
          SELECT t.id, p.name as venture, t.title, t.status, t.priority, t.due_at, t.completed_at, t.notes
          FROM tasks t
          JOIN portfolio_units p ON t.portfolio_unit_id = p.id
          ORDER BY t.due_at ASC
        `).all() as any[];

        const header = "ID,Venture,Title,Status,Priority,Due Date,Completed Date,Notes\n";
        const csvRows = rows.map((r) => 
          `"${r.id}","${r.venture}","${r.title}","${r.status}","${r.priority}","${r.due_at || ""}","${r.completed_at || ""}","${(r.notes || "").replace(/"/g, '""')}"`
        ).join("\n");

        return new Response(header + csvRows, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="business-command-tasks-${now.toISOString().split("T")[0]}.csv"`
          }
        });
      }

      if (type === "activities") {
        const rows = db.prepare(`
          SELECT a.id, p.name as venture, a.occurred_at, a.activity_type, a.method, a.quantity, a.unit, a.notes
          FROM activity_entries a
          JOIN portfolio_units p ON a.portfolio_unit_id = p.id
          ORDER BY a.occurred_at DESC
        `).all() as any[];

        const header = "ID,Venture,Date,Type,Method,Quantity,Unit,Notes\n";
        const csvRows = rows.map((r) => 
          `"${r.id}","${r.venture}","${r.occurred_at}","${r.activity_type}","${r.method || ""}",${r.quantity || 0},"${r.unit || ""}","${(r.notes || "").replace(/"/g, '""')}"`
        ).join("\n");

        return new Response(header + csvRows, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="business-command-activity-${now.toISOString().split("T")[0]}.csv"`
          }
        });
      }
    }

    // Default: Comprehensive JSON Export for AI analysis / report generation
    const units = db.prepare(`SELECT * FROM portfolio_units ORDER BY sort_order ASC`).all();
    const transactions = db.prepare(`SELECT * FROM transactions ORDER BY occurred_at DESC`).all();
    const recurring = db.prepare(`SELECT * FROM recurring_agreements ORDER BY status ASC`).all();
    const tasks = db.prepare(`SELECT * FROM tasks ORDER BY due_at ASC`).all();
    const projects = db.prepare(`SELECT * FROM projects`).all();
    const inventory = db.prepare(`SELECT * FROM inventory_items`).all();
    const activities = db.prepare(`SELECT * FROM activity_entries ORDER BY occurred_at DESC LIMIT 100`).all();
    const opportunities = db.prepare(`SELECT * FROM opportunities`).all();

    return NextResponse.json({
      meta,
      portfolio_units: units,
      transactions,
      recurring_agreements: recurring,
      tasks,
      projects,
      inventory,
      recent_activities: activities,
      opportunities,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
