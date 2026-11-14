import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const generalRow = db.prepare(`SELECT value_json FROM settings WHERE key = 'general'`).get() as { value_json: string } | undefined;
    const mappingRow = db.prepare(`SELECT value_json FROM settings WHERE key = 'asset_mappings'`).get() as { value_json: string } | undefined;

    return NextResponse.json({
      success: true,
      general: generalRow ? JSON.parse(generalRow.value_json) : {},
      asset_mappings: mappingRow ? JSON.parse(mappingRow.value_json) : {},
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Key and value required" }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO settings (key, value_json, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now')
    `).run(key, JSON.stringify(value));

    // If updating asset_mappings, synchronize with portfolio_units table
    if (key === "asset_mappings" && typeof value === "object") {
      const updateUnitLogo = db.prepare(`
        UPDATE portfolio_units
        SET logo_asset_path = ?, logo_asset_alt_path = ?
        WHERE id = ?
      `);

      for (const [unitId, mapping] of Object.entries(value as Record<string, any>)) {
        updateUnitLogo.run(mapping.assigned_asset || null, mapping.alt_asset || null, unitId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
