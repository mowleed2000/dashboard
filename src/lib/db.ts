import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "business_command.db");
const db = new Database(dbPath);

// Enable WAL mode for concurrency and foreign keys
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_units (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'operating_business',
      status TEXT NOT NULL DEFAULT 'Pending',
      description TEXT,
      accent TEXT NOT NULL DEFAULT '#E98569',
      logo_asset_path TEXT,
      logo_asset_alt_path TEXT,
      website_url TEXT,
      target_revenue REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'sale',
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GBP',
      occurred_at TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'received',
      payment_method TEXT DEFAULT 'cash',
      customer_label TEXT,
      product_service TEXT,
      notes TEXT,
      related_project_id TEXT,
      is_manual_entry INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recurring_agreements (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      customer_label TEXT NOT NULL,
      amount REAL NOT NULL,
      interval TEXT NOT NULL DEFAULT 'month',
      start_date TEXT NOT NULL,
      next_due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      collection_status TEXT NOT NULL DEFAULT 'received',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GBP',
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'settled',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_entries (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      method TEXT,
      quantity REAL,
      unit TEXT,
      occurred_at TEXT NOT NULL,
      notes TEXT,
      qualifies_for_pulse INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      target_date TEXT,
      description TEXT,
      progress_percentage REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_at TEXT,
      completed_at TEXT,
      notes TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurrence_rule TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sku TEXT,
      unit TEXT DEFAULT 'pcs',
      quantity_on_hand REAL NOT NULL DEFAULT 0,
      purchase_cost REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      reorder_level REAL DEFAULT 10,
      supplier_name TEXT,
      valuation_basis TEXT NOT NULL DEFAULT 'cost_value',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      portfolio_unit_id TEXT NOT NULL REFERENCES portfolio_units(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_cost REAL,
      occurred_at TEXT NOT NULL,
      supplier TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT REFERENCES portfolio_units(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inbox',
      category TEXT,
      notes TEXT,
      estimated_cost REAL DEFAULT 0,
      potential_value REAL DEFAULT 0,
      effort TEXT DEFAULT 'medium',
      review_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      portfolio_unit_id TEXT REFERENCES portfolio_units(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      resource_type TEXT NOT NULL DEFAULT 'link',
      url TEXT,
      file_path TEXT,
      notes TEXT,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'ambition',
      attribution TEXT NOT NULL DEFAULT 'Unknown',
      is_favourite INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      actor TEXT DEFAULT 'operator'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const count = db.prepare("SELECT COUNT(*) as c FROM portfolio_units").get() as { c: number };
  if (count && count.c > 0) return;

  const insertUnit = db.prepare(`
    INSERT INTO portfolio_units (id, name, slug, type, status, description, accent, logo_asset_path, logo_asset_alt_path, sort_order)
    VALUES (@id, @name, @slug, @type, @status, @description, @accent, @logo_asset_path, @logo_asset_alt_path, @sort_order)
  `);

  const units = [
    {
      id: "unit-nfc",
      name: "CollabCreateNFC",
      slug: "collabcreate-nfc",
      type: "operating_business",
      status: "Active",
      description: "NFC review cards and physical tap solutions. Field sales focus.",
      accent: "#E98569", // Coral
      logo_asset_path: "/assets/dashboard/collabcreate-nfc-logo.svg",
      logo_asset_alt_path: null,
      sort_order: 1
    },
    {
      id: "unit-web-pkg",
      name: "Website Package",
      slug: "website-package",
      type: "service_line",
      status: "Active",
      description: "£75/month direct debit managed business websites. Client delivery in progress.",
      accent: "#7796C9", // Cornflower
      logo_asset_path: "/assets/dashboard/logo website package.jpg",
      logo_asset_alt_path: null,
      sort_order: 2
    },
    {
      id: "unit-recruitment",
      name: "Collab Create Recruitment",
      slug: "collab-create-recruitment",
      type: "operating_business",
      status: "Pending",
      description: "Recruitment and placement service. Website and video launch pending.",
      accent: "#C5A1C9", // Lilac
      logo_asset_path: "/assets/dashboard/CCR OUR LOGO.png",
      logo_asset_alt_path: null,
      sort_order: 3
    },
    {
      id: "unit-spp",
      name: "Super Power Project",
      slug: "super-power-project",
      type: "project",
      status: "Pending",
      description: "Empowerment, creative & experimental community venture.",
      accent: "#E8BC57", // Marigold
      logo_asset_path: "/assets/dashboard/superpower-project-favicon.svg (2).png",
      logo_asset_alt_path: null,
      sort_order: 4
    },
    {
      id: "unit-ai",
      name: "Collab Create AI",
      slug: "collab-create-ai",
      type: "operating_business",
      status: "Pending",
      description: "Voice-agent automation and AI business solutions.",
      accent: "#2A9D8F", // Cyan/Teal
      logo_asset_path: "/assets/dashboard/CollabCreateCall.png",
      logo_asset_alt_path: "/assets/dashboard/CollabCreateCall Neon Voice Logo.png",
      sort_order: 5
    },
    {
      id: "unit-pet-recovery",
      name: "Rest Assured Pet Recovery",
      slug: "rest-assured-pet-recovery",
      type: "operating_business",
      status: "Pending",
      description: "Specialist pet search, rescue and family reunification service.",
      accent: "#769B83", // Sage
      logo_asset_path: "/assets/dashboard/Rest Assured Pet Recovery.png",
      logo_asset_alt_path: null,
      sort_order: 6
    },
    {
      id: "unit-uber-eats",
      name: "Uber Eats Referrals",
      slug: "uber-eats-referrals",
      type: "partnership",
      status: "Paused",
      description: "Referral acquisition channel. Currently paused (inactivity alerts suppressed).",
      accent: "#E76F51", // Red-Coral
      logo_asset_path: "/assets/dashboard/uber eats referals.png",
      logo_asset_alt_path: null,
      sort_order: 7
    },
    {
      id: "unit-uk-utility",
      name: "UK Utility Guys Partnership",
      slug: "uk-utility-guys-partnership",
      type: "partnership",
      status: "Pending",
      description: "Commercial utility & energy partnership brokerage.",
      accent: "#2D6A4F", // Deep Green
      logo_asset_path: "/assets/dashboard/UK Utility guys.webp",
      logo_asset_alt_path: null,
      sort_order: 8
    },
    {
      id: "unit-substack",
      name: "Substack Writing",
      slug: "substack-writing",
      type: "publishing_channel",
      status: "Active",
      description: "Entrepreneurial reflections, case studies and operator publications.",
      accent: "#D7A17C", // Warm Clay
      logo_asset_path: "/assets/dashboard/substack-logo.svg",
      logo_asset_alt_path: null,
      sort_order: 9
    }
  ];

  for (const u of units) {
    insertUnit.run(u);
  }

  const insertRecurring = db.prepare(`
    INSERT INTO recurring_agreements (id, portfolio_unit_id, customer_label, amount, interval, start_date, next_due_date, status, collection_status, notes)
    VALUES (@id, @portfolio_unit_id, @customer_label, @amount, @interval, @start_date, @next_due_date, @status, @collection_status, @notes)
  `);

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  insertRecurring.run({
    id: "rec-web-1",
    portfolio_unit_id: "unit-web-pkg",
    customer_label: "Website Client #1",
    amount: 75.0,
    interval: "month",
    start_date: todayStr,
    next_due_date: nextMonth,
    status: "active",
    collection_status: "received",
    notes: "First month direct debit collected (£75). Delivery outstanding."
  });

  insertRecurring.run({
    id: "rec-web-2",
    portfolio_unit_id: "unit-web-pkg",
    customer_label: "Website Client #2",
    amount: 75.0,
    interval: "month",
    start_date: todayStr,
    next_due_date: nextMonth,
    status: "active",
    collection_status: "received",
    notes: "First month direct debit collected (£75). Delivery outstanding."
  });

  const insertProject = db.prepare(`
    INSERT INTO projects (id, portfolio_unit_id, title, status, target_date, description, progress_percentage)
    VALUES (@id, @portfolio_unit_id, @title, @status, @target_date, @description, @progress_percentage)
  `);

  insertProject.run({
    id: "proj-web-delivery",
    portfolio_unit_id: "unit-web-pkg",
    title: "Client Website Fulfilment",
    status: "in_progress",
    target_date: nextMonth,
    description: "Design and deployment for 2 subscribed direct debit clients.",
    progress_percentage: 25
  });

  insertProject.run({
    id: "proj-nfc-growth",
    portfolio_unit_id: "unit-nfc",
    title: "NFC Field Sales & Web Setup",
    status: "in_progress",
    target_date: nextMonth,
    description: "Establish dedicated NFC order portal and lead follow-up system.",
    progress_percentage: 40
  });

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, portfolio_unit_id, project_id, title, status, priority, due_at, notes)
    VALUES (@id, @portfolio_unit_id, @project_id, @title, @status, @priority, @due_at, @notes)
  `);

  const tasks = [
    {
      id: "task-web-1",
      portfolio_unit_id: "unit-web-pkg",
      project_id: "proj-web-delivery",
      title: "Deliver Website for Client #1",
      status: "in_progress",
      priority: "urgent",
      due_at: todayStr,
      notes: "First month paid (£75). Delivery is currently outstanding."
    },
    {
      id: "task-web-2",
      portfolio_unit_id: "unit-web-pkg",
      project_id: "proj-web-delivery",
      title: "Deliver Website for Client #2",
      status: "in_progress",
      priority: "urgent",
      due_at: todayStr,
      notes: "First month paid (£75). Delivery is currently outstanding."
    },
    {
      id: "task-nfc-leads",
      portfolio_unit_id: "unit-nfc",
      project_id: "proj-nfc-growth",
      title: "Send follow-up emails to 3 interested leads",
      status: "not_started",
      priority: "high",
      due_at: todayStr,
      notes: "Leads requested info to read."
    },
    {
      id: "task-nfc-site",
      portfolio_unit_id: "unit-nfc",
      project_id: "proj-nfc-growth",
      title: "Complete CollabCreateNFC website",
      status: "not_started",
      priority: "high",
      due_at: todayStr,
      notes: "Website content is overdue."
    },
    {
      id: "task-rec-site",
      portfolio_unit_id: "unit-recruitment",
      project_id: null,
      title: "Finish Recruitment website",
      status: "not_started",
      priority: "medium",
      due_at: nextMonth,
      notes: "Recruitment portal build pending."
    },
    {
      id: "task-rec-video",
      portfolio_unit_id: "unit-recruitment",
      project_id: null,
      title: "Post Recruitment launch video",
      status: "not_started",
      priority: "medium",
      due_at: nextMonth,
      notes: "Launch content asset ready for publication."
    },
    {
      id: "task-spp-site",
      portfolio_unit_id: "unit-spp",
      project_id: null,
      title: "Complete Super Power Project website",
      status: "not_started",
      priority: "medium",
      due_at: nextMonth,
      notes: "Brand experience pending launch."
    },
    {
      id: "task-pet-site",
      portfolio_unit_id: "unit-pet-recovery",
      project_id: null,
      title: "Complete Rest Assured Pet Recovery website",
      status: "not_started",
      priority: "medium",
      due_at: nextMonth,
      notes: "Service descriptions and intake flow."
    }
  ];

  for (const t of tasks) {
    insertTask.run(t);
  }

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, portfolio_unit_id, type, amount, currency, occurred_at, payment_status, payment_method, customer_label, product_service, notes)
    VALUES (@id, @portfolio_unit_id, @type, @amount, @currency, @occurred_at, @payment_status, @payment_method, @customer_label, @product_service, @notes)
  `);

  insertTx.run({
    id: "tx-nfc-15cards-260",
    portfolio_unit_id: "unit-nfc",
    type: "sale",
    amount: 260.0,
    currency: "GBP",
    occurred_at: todayStr,
    payment_status: "received",
    payment_method: "cash",
    customer_label: "Retail & Hospitality Clients",
    product_service: "15x NFC Review Cards",
    notes: "Sold 15 NFC review cards for £260 received."
  });

  const insertInv = db.prepare(`
    INSERT INTO inventory_items (id, portfolio_unit_id, name, sku, unit, quantity_on_hand, purchase_cost, selling_price, reorder_level, supplier_name, valuation_basis, notes)
    VALUES (@id, @portfolio_unit_id, @name, @sku, @unit, @quantity_on_hand, @purchase_cost, @selling_price, @reorder_level, @supplier_name, @valuation_basis, @notes)
  `);

  const nfcItems = [
    {
      id: "inv-nfc-google-stickers",
      portfolio_unit_id: "unit-nfc",
      name: "Google Stickers",
      sku: "NFC-STK-GOOG",
      unit: "stickers",
      quantity_on_hand: 30,
      purchase_cost: 3.0,
      selling_price: 18.0,
      reorder_level: 10,
      supplier_name: "Direct NFC Supplier",
      valuation_basis: "cost_value",
      notes: "30 Google review tap stickers in stock"
    },
    {
      id: "inv-nfc-premium-stickers",
      portfolio_unit_id: "unit-nfc",
      name: "Premium Stickers",
      sku: "NFC-STK-PREM",
      unit: "stickers",
      quantity_on_hand: 5,
      purchase_cost: 5.0,
      selling_price: 25.0,
      reorder_level: 5,
      supplier_name: "Direct NFC Supplier",
      valuation_basis: "cost_value",
      notes: "5 luxury matte finish premium review stickers"
    },
    {
      id: "inv-nfc-google-stands",
      portfolio_unit_id: "unit-nfc",
      name: "Google Stands",
      sku: "NFC-STN-GOOG",
      unit: "stands",
      quantity_on_hand: 10,
      purchase_cost: 7.0,
      selling_price: 35.0,
      reorder_level: 5,
      supplier_name: "Direct NFC Supplier",
      valuation_basis: "cost_value",
      notes: "10 acrylic counter-top Google review tap stands"
    },
    {
      id: "inv-nfc-instagram-stickers",
      portfolio_unit_id: "unit-nfc",
      name: "Instagram Stickers",
      sku: "NFC-STK-INSTA",
      unit: "stickers",
      quantity_on_hand: 5,
      purchase_cost: 3.0,
      selling_price: 18.0,
      reorder_level: 5,
      supplier_name: "Direct NFC Supplier",
      valuation_basis: "cost_value",
      notes: "5 Instagram follow & review tap stickers"
    },
    {
      id: "inv-nfc-table-tags",
      portfolio_unit_id: "unit-nfc",
      name: "Table Tags",
      sku: "NFC-TAG-TBL",
      unit: "table tags",
      quantity_on_hand: 150,
      purchase_cost: 1.5,
      selling_price: 10.0,
      reorder_level: 30,
      supplier_name: "Direct NFC Supplier",
      valuation_basis: "cost_value",
      notes: "150 durable hospitality table review discs"
    }
  ];

  for (const item of nfcItems) {
    insertInv.run(item);
  }

  const insertAct = db.prepare(`
    INSERT INTO activity_entries (id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse)
    VALUES (@id, @portfolio_unit_id, @activity_type, @method, @quantity, @unit, @occurred_at, @notes, @qualifies_for_pulse)
  `);

  insertAct.run({
    id: "act-nfc-1",
    portfolio_unit_id: "unit-nfc",
    activity_type: "sale",
    method: "field_sales",
    quantity: 1,
    unit: "sale",
    occurred_at: todayStr,
    notes: "Sold NFC cards for £20. Customer also expressed interest in Website Package meeting.",
    qualifies_for_pulse: 1
  });

  insertAct.run({
    id: "act-web-1",
    portfolio_unit_id: "unit-web-pkg",
    activity_type: "outreach",
    method: "calls",
    quantity: 17,
    unit: "calls",
    occurred_at: todayStr,
    notes: "Cold outreach campaign for local business websites.",
    qualifies_for_pulse: 1
  });

  const insertQuote = db.prepare(`
    INSERT INTO quotes (id, text, category, attribution, is_favourite, is_active)
    VALUES (@id, @text, @category, @attribution, @is_favourite, @is_active)
  `);

  const quotes = [
    {
      id: "q-1",
      text: "Another day, another dollar.",
      category: "ambition",
      attribution: "Operator Motto",
      is_favourite: 1,
      is_active: 1
    },
    {
      id: "q-2",
      text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      category: "discipline",
      attribution: "Will Durant (on Aristotle)",
      is_favourite: 1,
      is_active: 1
    },
    {
      id: "q-3",
      text: "Action produces information. When in doubt, make the call.",
      category: "sales",
      attribution: "Unattributed founder saying",
      is_favourite: 0,
      is_active: 1
    },
    {
      id: "q-4",
      text: "Cash flow is the oxygen of independence. Protect it daily.",
      category: "money",
      attribution: "Venture Wisdom",
      is_favourite: 0,
      is_active: 1
    },
    {
      id: "q-5",
      text: "Simplicity is prerequisite for reliability.",
      category: "wisdom",
      attribution: "Edsger W. Dijkstra",
      is_favourite: 0,
      is_active: 1
    },
    {
      id: "q-6",
      text: "The secret of getting ahead is getting started.",
      category: "entrepreneurship",
      attribution: "Mark Twain",
      is_favourite: 0,
      is_active: 1
    }
  ];

  for (const q of quotes) {
    insertQuote.run(q);
  }

  const insertSetting = db.prepare(`
    INSERT INTO settings (key, value_json) VALUES (@key, @value_json)
  `);

  insertSetting.run({
    key: "general",
    value_json: JSON.stringify({
      display_name: "Operator",
      timezone: "Europe/London",
      currency: "GBP",
      weather_location: {
        city: "London",
        country: "UK",
        lat: 51.5074,
        lon: -0.1278
      },
      cold_weather_threshold: 6,
      cold_weather_message: "Maybe stick to the phone 🤭",
      soundtrack_enabled: false,
      soundtrack_volume: 0.6,
      sound_effects_enabled: true
    })
  });

  insertSetting.run({
    key: "asset_mappings",
    value_json: JSON.stringify({
      "unit-nfc": { assigned_asset: null, note: "Typographic badge used until custom logo provided" },
      "unit-web-pkg": { assigned_asset: "/assets/dashboard/logo website package.jpg", note: "Website Package Logo" },
      "unit-recruitment": { assigned_asset: "/assets/dashboard/CCR OUR LOGO.png", note: "CCR Our Logo" },
      "unit-spp": { assigned_asset: "/assets/dashboard/superpower-project-favicon.svg (2).png", note: "Super Power Project Mark" },
      "unit-ai": { assigned_asset: "/assets/dashboard/CollabCreateCall.png", alt_asset: "/assets/dashboard/CollabCreateCall Neon Voice Logo.png", note: "CollabCreateCall (Primary + Neon)" },
      "unit-pet-recovery": { assigned_asset: "/assets/dashboard/Rest Assured Pet Recovery.png", note: "Rest Assured Pet Recovery" },
      "unit-uber-eats": { assigned_asset: "/assets/dashboard/uber eats referals.png", note: "Uber Eats Referrals" },
      "unit-uk-utility": { assigned_asset: "/assets/dashboard/UK Utility guys.webp", note: "UK Utility Guys" },
      "unit-substack": { assigned_asset: null, note: "Typographic badge" }
    })
  });
}

// Ensure database is initialized
initDatabase();

export default db;
