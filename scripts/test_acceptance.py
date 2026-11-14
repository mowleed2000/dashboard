import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

base_url = "http://localhost:3000"

def test_get(endpoint, desc):
    url = f"{base_url}{endpoint}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            print(f"PASS: {desc} -> HTTP {resp.status} ({len(data)} bytes)")
            return data
    except Exception as e:
        print(f"FAIL: {desc} -> {e}")
        return None

def test_post(endpoint, payload, desc):
    url = f"{base_url}{endpoint}"
    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            print(f"PASS: {desc} -> HTTP {resp.status}")
            return json.loads(data.decode("utf-8"))
    except Exception as e:
        print(f"FAIL: {desc} -> {e}")
        return None

print("--- 1. Testing Web Page & Routes ---")
test_get("/", "Homepage Render")

print("\n--- 2. Testing Static Assets Serving ---")
test_get("/assets/dashboard/Rod%20Wave%20-%20LaCosa%20Nostra%20(Official%20Audio)%20-%20RodWave.mp3", "Soundtrack MP3")
test_get("/assets/dashboard/ARISTOLE%20GUCCI.jpg", "Aristotle Gucci Image")
test_get("/assets/dashboard/CCR%20OUR%20LOGO.png", "CCR Logo")
test_get("/assets/dashboard/CollabCreateCall.png", "CollabCreateCall Logo")
test_get("/assets/dashboard/logo%20website%20package.jpg", "Website Package Logo")
test_get("/assets/dashboard/collabcreate-nfc-logo.svg", "CollabCreateNFC SVG Logo")
test_get("/assets/dashboard/substack-logo.svg", "Substack SVG Logo")

print("\n--- 3. Testing Portfolio & Inactivity Pulse ---")
port_raw = test_get("/api/portfolio", "Portfolio Units API")
if port_raw:
    pdata = json.loads(port_raw.decode("utf-8"))
    units = pdata.get("units", [])
    print(f"Total units returned: {len(units)}")
    for u in units:
        print(f" - [{u['status']}] {u['name']} (Logo: {u.get('logo_asset_path')}): MRR £{u['metrics']['mrr']}, Pulse: {u['metrics']['pulse_state']}")

print("\n--- 4. Testing Weather API ---")
w_raw = test_get("/api/weather", "Live Weather Feed")
if w_raw:
    wdata = json.loads(w_raw.decode("utf-8"))
    print(f"Weather: {wdata.get('temperature')}°C in {wdata.get('city')}, {wdata.get('condition')}")
    print(f"Cold Weather Advisory: '{wdata.get('advice')}' (Below 6°C alert: {wdata.get('is_cold_alert')})")

print("\n--- 5. Testing NFC Inventory & Stock Representation ---")
inv_raw = test_get("/api/inventory?unitId=unit-nfc", "NFC Inventory API")
if inv_raw:
    idata = json.loads(inv_raw.decode("utf-8"))
    nfc_items = idata.get("items", [])
    print(f"Found {len(nfc_items)} NFC Inventory lines:")
    for item in nfc_items:
        print(f" - {item['name']}: {item['quantity_on_hand']} {item['unit']} (Cost: £{item['purchase_cost']}, Retail: £{item['selling_price']})")

print("\n--- 6. Testing Restock Dropdown Movement Action ---")
if inv_raw:
    first_item = idata.get("items", [])[0]
    res_restock = test_post("/api/inventory", {
        "action": "record_movement",
        "inventory_item_id": first_item["id"],
        "movement_type": "received",
        "quantity": 10,
        "notes": "Acceptance test replenishment"
    }, f"Replenish 10x {first_item['name']}")
    print(f"Restock result: {res_restock}")

print("\n--- 7. Testing Sales Summary Reconciliation (Including £260 15 Cards Sale) ---")
s_raw = test_get("/api/sales?unitId=unit-nfc", "NFC Sales API")
if s_raw:
    sdata = json.loads(s_raw.decode("utf-8"))
    summ = sdata.get("summary", {})
    print(f"NFC Reconciled Cash Received: £{summ.get('total_cash_received')}")
    txs = sdata.get("transactions", [])
    print(f"Total NFC transactions: {len(txs)}")
    for t in txs:
        print(f" - £{t['amount']} ({t['product_service']}) -> Status: {t['payment_status']}")

print("\n--- 8. Testing CSV & AI Report Exports ---")
test_get("/api/export?format=csv&type=sales", "Sales CSV Export")
test_get("/api/export?format=csv&type=tasks", "Tasks CSV Export")
test_get("/api/export?format=json", "AI Analysis JSON Dump")


print("\nAll automated integration tests finished.")
