import sqlite3

conn = sqlite3.connect("data/business_command.db")
c = conn.cursor()

c.execute("UPDATE portfolio_units SET logo_asset_path = '/assets/dashboard/collabcreate-nfc-logo.svg' WHERE id = 'unit-nfc'")
c.execute("UPDATE portfolio_units SET logo_asset_path = '/assets/dashboard/substack-logo.svg' WHERE id = 'unit-substack'")

conn.commit()

c.execute("SELECT id, name, logo_asset_path FROM portfolio_units ORDER BY sort_order")
for row in c.fetchall():
    print(f"[{row[0]}] {row[1]} -> {row[2]}")

conn.close()
