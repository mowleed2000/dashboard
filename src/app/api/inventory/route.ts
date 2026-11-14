import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    let query = `
      SELECT i.*, p.name as unit_name, p.accent as unit_accent, p.slug as unit_slug
      FROM inventory_items i
      JOIN portfolio_units p ON i.portfolio_unit_id = p.id
    `;
    const params: any[] = [];
    if (unitId) {
      query += ` WHERE i.portfolio_unit_id = ?`;
      params.push(unitId);
    }
    query += ` ORDER BY i.name ASC`;

    const items = db.prepare(query).all(...params) as any[];

    // Calculate valuations and low stock alerts
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;

    const processedItems = items.map((item) => {
      const isLowStock = item.quantity_on_hand <= item.reorder_level;
      if (isLowStock) lowStockCount++;

      const costVal = item.quantity_on_hand * (item.purchase_cost || 0);
      const retailVal = item.quantity_on_hand * (item.selling_price || 0);

      totalCostValuation += costVal;
      totalRetailValuation += retailVal;

      return {
        ...item,
        cost_valuation: costVal,
        retail_valuation: retailVal,
        is_low_stock: isLowStock,
      };
    });

    // Recent movements
    let movQuery = `
      SELECT sm.*, i.name as item_name, p.name as unit_name
      FROM stock_movements sm
      JOIN inventory_items i ON sm.inventory_item_id = i.id
      JOIN portfolio_units p ON sm.portfolio_unit_id = p.id
    `;
    const movParams: any[] = [];
    if (unitId) {
      movQuery += ` WHERE sm.portfolio_unit_id = ?`;
      movParams.push(unitId);
    }
    movQuery += ` ORDER BY sm.occurred_at DESC, sm.created_at DESC LIMIT 20`;
    const movements = db.prepare(movQuery).all(...movParams);

    return NextResponse.json({
      success: true,
      items: processedItems,
      movements,
      summary: {
        total_items_count: items.length,
        low_stock_count: lowStockCount,
        total_cost_valuation: totalCostValuation,
        total_retail_valuation: totalRetailValuation,
        valuation_disclaimer: "Valuations are derived from recorded unit costs or user estimates. Estimates are clearly distinguished from audited purchase invoices.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_item") {
      const { portfolio_unit_id, name, sku, unit = "pcs", quantity_on_hand = 0, purchase_cost = 0, selling_price = 0, reorder_level = 10, supplier_name, valuation_basis = "cost_value", notes } = body;

      const itemId = `inv-${Date.now()}`;
      db.prepare(`
        INSERT INTO inventory_items (
          id, portfolio_unit_id, name, sku, unit, quantity_on_hand, purchase_cost, selling_price, reorder_level, supplier_name, valuation_basis, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        itemId,
        portfolio_unit_id,
        name,
        sku || null,
        unit,
        Number(quantity_on_hand),
        Number(purchase_cost),
        Number(selling_price),
        Number(reorder_level),
        supplier_name || null,
        valuation_basis,
        notes || ""
      );

      return NextResponse.json({ success: true, item_id: itemId });
    }

    if (action === "record_movement") {
      const { inventory_item_id, movement_type, quantity, unit_cost, supplier, notes, occurred_at } = body;

      const item = db.prepare(`SELECT * FROM inventory_items WHERE id = ?`).get(inventory_item_id) as any;
      if (!item) {
        return NextResponse.json({ success: false, error: "Inventory item not found" }, { status: 404 });
      }

      const qty = Number(quantity);
      let newQty = item.quantity_on_hand;
      if (movement_type === "received" || movement_type === "returned") {
        newQty += qty;
      } else if (movement_type === "sold" || movement_type === "written_off") {
        newQty = Math.max(0, newQty - qty);
      } else if (movement_type === "adjusted") {
        newQty = qty;
      }

      db.prepare(`UPDATE inventory_items SET quantity_on_hand = ? WHERE id = ?`).run(newQty, inventory_item_id);

      const movId = `mov-${Date.now()}`;
      const dateStr = occurred_at || new Date().toISOString().split("T")[0];

      db.prepare(`
        INSERT INTO stock_movements (id, inventory_item_id, portfolio_unit_id, movement_type, quantity, unit_cost, occurred_at, supplier, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(movId, inventory_item_id, item.portfolio_unit_id, movement_type, qty, unit_cost !== undefined ? Number(unit_cost) : item.purchase_cost, dateStr, supplier || item.supplier_name, notes || "");

      // Record activity entry
      db.prepare(`
        INSERT INTO activity_entries (id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse)
        VALUES (?, ?, 'stock', ?, ?, ?, ?, ?, 1)
      `).run(`act-${Date.now()}`, item.portfolio_unit_id, movement_type, qty, item.unit || "pcs", dateStr, `Stock ${movement_type}: ${qty} ${item.unit || "pcs"} of ${item.name}`);

      return NextResponse.json({ success: true, new_quantity: newQty });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
