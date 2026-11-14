import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = `SELECT * FROM quotes WHERE is_active = 1`;
    const params: any[] = [];
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    query += ` ORDER BY is_favourite DESC, RANDOM()`;

    const quotes = db.prepare(query).all(...params) as any[];

    // Select daily quote (or first one from result)
    const dailyQuote = quotes.length > 0 ? quotes[0] : {
      id: "fallback",
      text: "Another day, another dollar.",
      category: "ambition",
      attribution: "Operator Motto",
      is_favourite: 1,
    };

    return NextResponse.json({
      success: true,
      daily_quote: dailyQuote,
      quotes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, text, category = "ambition", attribution = "Unknown" } = body;

    if (action === "toggle_favourite") {
      db.prepare(`UPDATE quotes SET is_favourite = CASE WHEN is_favourite = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(id);
      return NextResponse.json({ success: true });
    }

    if (action === "shuffle") {
      const quote = db.prepare(`SELECT * FROM quotes WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1`).get();
      return NextResponse.json({ success: true, quote });
    }

    if (!text) {
      return NextResponse.json({ success: false, error: "Text required" }, { status: 400 });
    }

    const quoteId = `q-${Date.now()}`;
    db.prepare(`
      INSERT INTO quotes (id, text, category, attribution, is_favourite, is_active)
      VALUES (?, ?, ?, ?, 0, 1)
    `).run(quoteId, text, category, attribution);

    return NextResponse.json({ success: true, id: quoteId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
