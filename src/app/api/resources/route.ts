import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    let query = `
      SELECT r.*, p.name as unit_name, p.accent as unit_accent
      FROM resources r
      LEFT JOIN portfolio_units p ON r.portfolio_unit_id = p.id
    `;
    const params: any[] = [];
    if (unitId) {
      query += ` WHERE r.portfolio_unit_id = ?`;
      params.push(unitId);
    }
    query += ` ORDER BY r.created_at DESC`;

    const resources = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolio_unit_id, title, resource_type = "link", url, file_path, notes, tags } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });
    }

    const resId = `res-${Date.now()}`;
    db.prepare(`
      INSERT INTO resources (id, portfolio_unit_id, title, resource_type, url, file_path, notes, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(resId, portfolio_unit_id || null, title, resource_type, url || null, file_path || null, notes || "", tags || "");

    return NextResponse.json({ success: true, id: resId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
