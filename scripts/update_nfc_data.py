import sqlite3
import datetime

db_path = "data/business_command.db"
con = sqlite3.connect(db_path)
cur = con.cursor()

today_str = datetime.date.today().isoformat()

# 1. Add/Update NFC Sale for 15 cards and £260 received
tx_id = f"tx-nfc-15cards-260"
cur.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
cur.execute("""
    INSERT INTO transactions (
        id, portfolio_unit_id, type, amount, currency, occurred_at, payment_status, payment_method, customer_label, product_service, notes
    ) VALUES (?, 'unit-nfc', 'sale', 260.0, 'GBP', ?, 'received', 'cash', 'Retail & Hospitality Clients', '15x NFC Review Cards', 'Sold 15 NFC review cards for £260 received')
""", (tx_id, today_str))

act_id = f"act-nfc-15cards-260"
cur.execute("DELETE FROM activity_entries WHERE id = ?", (act_id,))
cur.execute("""
    INSERT INTO activity_entries (
        id, portfolio_unit_id, activity_type, method, quantity, unit, occurred_at, notes, qualifies_for_pulse
    ) VALUES (?, 'unit-nfc', 'sale', 'field_sales', 15, 'cards', ?, 'Sold 15 NFC cards for £260 cash received', 1)
""", (act_id, today_str))

# 2. Configure the 5 NFC stock items:
# 30 google stickers, 5 premium stickers, 10 google stands, 5 instagram stickers, 150 table tags
nfc_inventory = [
    {
        "id": "inv-nfc-google-stickers",
        "name": "Google Stickers",
        "sku": "NFC-STK-GOOG",
        "unit": "stickers",
        "quantity_on_hand": 30.0,
        "purchase_cost": 3.0,
        "selling_price": 18.0,
        "reorder_level": 10.0,
        "supplier_name": "Direct NFC Supplier",
        "valuation_basis": "cost_value",
        "notes": "30 Google review tap stickers in stock"
    },
    {
        "id": "inv-nfc-premium-stickers",
        "name": "Premium Stickers",
        "sku": "NFC-STK-PREM",
        "unit": "stickers",
        "quantity_on_hand": 5.0,
        "purchase_cost": 5.0,
        "selling_price": 25.0,
        "reorder_level": 5.0,
        "supplier_name": "Direct NFC Supplier",
        "valuation_basis": "cost_value",
        "notes": "5 luxury matte finish premium review stickers"
    },
    {
        "id": "inv-nfc-google-stands",
        "name": "Google Stands",
        "sku": "NFC-STN-GOOG",
        "unit": "stands",
        "quantity_on_hand": 10.0,
        "purchase_cost": 7.0,
        "selling_price": 35.0,
        "reorder_level": 5.0,
        "supplier_name": "Direct NFC Supplier",
        "valuation_basis": "cost_value",
        "notes": "10 acrylic counter-top Google review tap stands"
    },
    {
        "id": "inv-nfc-instagram-stickers",
        "name": "Instagram Stickers",
        "sku": "NFC-STK-INSTA",
        "unit": "stickers",
        "quantity_on_hand": 5.0,
        "purchase_cost": 3.0,
        "selling_price": 18.0,
        "reorder_level": 5.0,
        "supplier_name": "Direct NFC Supplier",
        "valuation_basis": "cost_value",
        "notes": "5 Instagram follow & review tap stickers"
    },
    {
        "id": "inv-nfc-table-tags",
        "name": "Table Tags",
        "sku": "NFC-TAG-TBL",
        "unit": "table tags",
        "quantity_on_hand": 150.0,
        "purchase_cost": 1.5,
        "selling_price": 10.0,
        "reorder_level": 30.0,
        "supplier_name": "Direct NFC Supplier",
        "valuation_basis": "cost_value",
        "notes": "150 durable hospitality table review discs"
    }
]

# Clean up older generic card line if present, replace with specific item lines
cur.execute("DELETE FROM inventory_items WHERE portfolio_unit_id = 'unit-nfc'")

for item in nfc_inventory:
    cur.execute("""
        INSERT INTO inventory_items (
            id, portfolio_unit_id, name, sku, unit, quantity_on_hand, purchase_cost, selling_price, reorder_level, supplier_name, valuation_basis, notes
        ) VALUES (:id, 'unit-nfc', :name, :sku, :unit, :quantity_on_hand, :purchase_cost, :selling_price, :reorder_level, :supplier_name, :valuation_basis, :notes)
    """, item)

con.commit()
con.close()
print("Updated database with 15 cards sold (£260 received) and 5 NFC inventory items successfully.")
