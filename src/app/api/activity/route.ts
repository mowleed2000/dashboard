import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = `
      SELECT 
        a.*,
        p.name as unit_name,
        p.accent as unit_accent,
        p.slug as unit_slug,
        p.logo_asset_path as unit_logo
      FROM activity_entries a
      JOIN portfolio_units p ON a.portfolio_unit_id = p.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (unitId) {
      conditions.push("a.portfolio_unit_id = ?");
      params.push(unitId);
    }
    if (type) {
      conditions.push("a.activity_type = ?");
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY a.occurred_at DESC, a.created_at DESC LIMIT ?`;
    params.push(limit);

    const entries = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, activities: entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      portfolio_unit_id,
      activity_type,
      method,
      quantity,
      unit,
      occurred_at,
      notes,
      qualifies_for_pulse,
      // Optional sale integration fields
      sale_amount,
      payment_method,
      customer_label,
      product_service
    } = body;

    if (!portfolio_unit_id || !activity_type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const activityId = `act-${Date.now()}`;
    const dateStr = occurred_at || new Date().toISOString().split("T")[0];

    // Determine if this qualifies for business pulse
    // Passive app login or raw unstructured note without business tag does not qualify
    const qualifies = qualifies_for_pulse !== undefined ? (qualifies_for_pulse ? 1 : 0) : 1;

    const insertActivity = db.prepare(`
      INSERT INTO activity_entries (
        id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertActivity.run(
      activityId,
      portfolio_unit_id,
      activity_type,
      method || null,
      quantity !== undefined && quantity !== null ? Number(quantity) : null,
      unit || null,
      dateStr,
      notes || "",
      qualifies
    );

    // If sale details were captured simultaneously, create the verified transaction record
    let transactionId = null;
    if (activity_type === "sale" && sale_amount && Number(sale_amount) > 0) {
      transactionId = `tx-${Date.now()}`;
      db.prepare(`
        INSERT INTO transactions (
          id, portfolio_unit_id, type, amount, currency, occurred_at, payment_status, payment_method, customer_label, product_service, notes
        ) VALUES (?, ?, 'sale', ?, 'GBP', ?, 'received', ?, ?, ?, ?)
      `).run(
        transactionId,
        portfolio_unit_id,
        Number(sale_amount),
        dateStr,
        payment_method || "cash",
        customer_label || "Direct Customer",
        product_service || "Direct Sale",
        notes || "Captured via Quick Capture"
      );

      // Audit event for financial record
      db.prepare(`
        INSERT INTO audit_events (id, entity_type, entity_id, action, after_json)
        VALUES (?, 'transaction', ?, 'create_sale', ?)
      `).run(`aud-${Date.now()}-tx`, transactionId, JSON.stringify({ amount: sale_amount, portfolio_unit_id }));
    }

    // Audit event for activity
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, after_json)
      VALUES (?, 'activity_entry', ?, 'create', ?)
    `).run(`aud-${Date.now()}`, activityId, JSON.stringify(body));

    return NextResponse.json({
      success: true,
      activity_id: activityId,
      transaction_id: transactionId,
      message: "Activity logged successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
