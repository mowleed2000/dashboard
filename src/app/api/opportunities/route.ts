import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const opps = db.prepare(`
      SELECT o.*, p.name as unit_name, p.accent as unit_accent, p.slug as unit_slug
      FROM opportunities o
      LEFT JOIN portfolio_units p ON o.portfolio_unit_id = p.id
      ORDER BY o.created_at DESC
    `).all() as any[];

    return NextResponse.json({ success: true, opportunities: opps });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, status, title, portfolio_unit_id, category, notes, estimated_cost, potential_value, effort, review_at } = body;

    if (action === "roulette") {
      // Pick a random unparked/unrejected idea
      const candidate = db.prepare(`
        SELECT o.*, p.name as unit_name, p.accent as unit_accent
        FROM opportunities o
        LEFT JOIN portfolio_units p ON o.portfolio_unit_id = p.id
        WHERE o.status NOT IN ('parked', 'rejected', 'converted')
        ORDER BY RANDOM()
        LIMIT 1
      `).get() as any;

      return NextResponse.json({ success: true, picked_idea: candidate || null });
    }

    if (action === "update_status") {
      db.prepare(`UPDATE opportunities SET status = ? WHERE id = ?`).run(status, id);
      return NextResponse.json({ success: true });
    }

    // Default: create new opportunity
    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const oppId = `opp-${Date.now()}`;
    db.prepare(`
      INSERT INTO opportunities (
        id, portfolio_unit_id, title, status, category, notes, estimated_cost, potential_value, effort, review_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      oppId,
      portfolio_unit_id || null,
      title,
      status || "inbox",
      category || "General",
      notes || "",
      Number(estimated_cost || 0),
      Number(potential_value || 0),
      effort || "medium",
      review_at || null
    );

    return NextResponse.json({ success: true, id: oppId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
