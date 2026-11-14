import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    let txQuery = `
      SELECT t.*, p.name as unit_name, p.accent as unit_accent, p.slug as unit_slug
      FROM transactions t
      JOIN portfolio_units p ON t.portfolio_unit_id = p.id
    `;
    let recQuery = `
      SELECT r.*, p.name as unit_name, p.accent as unit_accent
      FROM recurring_agreements r
      JOIN portfolio_units p ON r.portfolio_unit_id = p.id
    `;
    let expQuery = `
      SELECT e.*, p.name as unit_name, p.accent as unit_accent
      FROM expenses e
      JOIN portfolio_units p ON e.portfolio_unit_id = p.id
    `;

    const txParams: any[] = [];
    const recParams: any[] = [];
    const expParams: any[] = [];

    if (unitId) {
      txQuery += ` WHERE t.portfolio_unit_id = ?`;
      recQuery += ` WHERE r.portfolio_unit_id = ?`;
      expQuery += ` WHERE e.portfolio_unit_id = ?`;
      txParams.push(unitId);
      recParams.push(unitId);
      expParams.push(unitId);
    }

    txQuery += ` ORDER BY t.occurred_at DESC, t.created_at DESC`;
    recQuery += ` ORDER BY r.status ASC, r.customer_label ASC`;
    expQuery += ` ORDER BY e.date DESC`;

    const transactions = db.prepare(txQuery).all(...txParams) as any[];
    const recurringAgreements = db.prepare(recQuery).all(...recParams) as any[];
    const expenses = db.prepare(expQuery).all(...expParams) as any[];

    // Calculate core financial metrics with explicit definitions
    let totalGrossSales = 0;
    let totalCashReceived = 0;
    let totalInvoicedPending = 0;
    let totalRefunds = 0;

    for (const t of transactions) {
      if (t.type === "sale") {
        totalGrossSales += t.amount;
        if (t.payment_status === "received") {
          totalCashReceived += t.amount;
        } else if (t.payment_status === "invoiced" || t.payment_status === "pending") {
          totalInvoicedPending += t.amount;
        }
      } else if (t.type === "refund" || t.type === "adjustment") {
        totalRefunds += Math.abs(t.amount);
        totalCashReceived -= Math.abs(t.amount);
      }
    }

    // Calculate MRR from active recurring subscriptions only
    let activeMRR = 0;
    let activeSubscriptionsCount = 0;
    for (const r of recurringAgreements) {
      if (r.status === "active") {
        activeMRR += r.amount;
        activeSubscriptionsCount++;
      }
    }

    let totalExpenses = 0;
    for (const e of expenses) {
      totalExpenses += e.amount;
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_gross_sales: totalGrossSales,
        total_cash_received: totalCashReceived,
        total_invoiced_pending: totalInvoicedPending,
        total_refunds: totalRefunds,
        active_mrr: activeMRR,
        active_subscriptions_count: activeSubscriptionsCount,
        total_expenses: totalExpenses,
        currency: "GBP",
        // Net profit is only derived where expenses are provided; profit basis clearly disclosed
        net_cash_flow: totalCashReceived - totalExpenses,
        has_expenses_recorded: expenses.length > 0
      },
      transactions,
      recurring_agreements: recurringAgreements,
      expenses
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      portfolio_unit_id,
      type = "sale",
      amount,
      currency = "GBP",
      occurred_at,
      payment_status = "received",
      payment_method = "cash",
      customer_label,
      product_service,
      notes,
      related_project_id
    } = body;

    if (!portfolio_unit_id || amount === undefined || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Valid venture and amount required" }, { status: 400 });
    }

    const txId = `tx-${Date.now()}`;
    const dateStr = occurred_at || new Date().toISOString().split("T")[0];

    db.prepare(`
      INSERT INTO transactions (
        id, portfolio_unit_id, type, amount, currency, occurred_at, payment_status, payment_method, customer_label, product_service, notes, related_project_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      txId,
      portfolio_unit_id,
      type,
      Number(amount),
      currency,
      dateStr,
      payment_status,
      payment_method,
      customer_label || "Customer",
      product_service || "Direct Sale",
      notes || "",
      related_project_id || null
    );

    // Also record an activity entry for the timeline
    const activityId = `act-${Date.now()}`;
    db.prepare(`
      INSERT INTO activity_entries (
        id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse
      ) VALUES (?, ?, 'sale', ?, 1, 'sale', ?, ?, 1)
    `).run(
      activityId,
      portfolio_unit_id,
      payment_method,
      dateStr,
      `Recorded ${type}: £${Number(amount).toFixed(2)} - ${product_service || "Sale"} (${customer_label || "Customer"})`
    );

    // Audit event for financial record
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, after_json)
      VALUES (?, 'transaction', ?, 'create', ?)
    `).run(`aud-${Date.now()}`, txId, JSON.stringify(body));

    return NextResponse.json({
      success: true,
      transaction_id: txId,
      message: "Transaction logged successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, payment_status, status, collection_status, amount, notes } = body;

    if (action === "update_transaction") {
      const before = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id);
      db.prepare(`
        UPDATE transactions
        SET 
          payment_status = COALESCE(?, payment_status),
          amount = COALESCE(?, amount),
          notes = COALESCE(?, notes),
          updated_at = datetime('now')
        WHERE id = ?
      `).run(payment_status, amount !== undefined ? Number(amount) : null, notes, id);

      const after = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id);

      db.prepare(`
        INSERT INTO audit_events (id, entity_type, entity_id, action, before_json, after_json)
        VALUES (?, 'transaction', ?, 'adjust', ?, ?)
      `).run(`aud-${Date.now()}`, id, JSON.stringify(before), JSON.stringify(after));

      return NextResponse.json({ success: true, transaction: after });
    }

    if (action === "update_recurring") {
      const before = db.prepare(`SELECT * FROM recurring_agreements WHERE id = ?`).get(id);
      db.prepare(`
        UPDATE recurring_agreements
        SET 
          status = COALESCE(?, status),
          collection_status = COALESCE(?, collection_status),
          notes = COALESCE(?, notes)
        WHERE id = ?
      `).run(status, collection_status, notes, id);

      const after = db.prepare(`SELECT * FROM recurring_agreements WHERE id = ?`).get(id);
      return NextResponse.json({ success: true, agreement: after });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
