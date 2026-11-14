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

print("\n--- 3. Testing Portfolio & Inactivity Pulse ---")
port_raw = test_get("/api/portfolio", "Portfolio Units API")
if port_raw:
    pdata = json.loads(port_raw.decode("utf-8"))
    units = pdata.get("units", [])
    print(f"Total units returned: {len(units)}")
    for u in units:
        print(f" - [{u['status']}] {u['name']}: MRR £{u['metrics']['mrr']}, Pulse: {u['metrics']['pulse_state']} ('{u['metrics']['pulse_message']}')")

print("\n--- 4. Testing Weather API ---")
w_raw = test_get("/api/weather", "Live Weather Feed")
if w_raw:
    wdata = json.loads(w_raw.decode("utf-8"))
    print(f"Weather: {wdata.get('temperature')}°C in {wdata.get('city')}, {wdata.get('condition')}")
    print(f"Cold Weather Advisory: '{wdata.get('advice')}' (Below 6°C alert: {wdata.get('is_cold_alert')})")

print("\n--- 5. Testing Aggregate Outreach Capture (17 calls, 5 hours) ---")
res_outreach = test_post("/api/activity", {
    "portfolio_unit_id": "unit-web-pkg",
    "activity_type": "outreach",
    "method": "calls",
    "quantity": 17,
    "unit": "calls",
    "notes": "17 cold calls completed without single contact logging",
    "qualifies_for_pulse": True
}, "Log Aggregate Outreach (17 calls)")

print("\n--- 6. Testing Confirmed Sale Recording (£20 NFC Cards) ---")
res_sale = test_post("/api/sales", {
    "portfolio_unit_id": "unit-nfc",
    "type": "sale",
    "amount": 20.0,
    "customer_label": "Automated Test Client",
    "product_service": "NFC Review Cards",
    "payment_method": "cash",
    "payment_status": "received",
    "notes": "Verified cash received transaction"
}, "Record £20 Sale with Cash Settlement")

print("\n--- 7. Testing Sales Summary Reconciliation ---")
s_raw = test_get("/api/sales", "Sales Summary API")
if s_raw:
    sdata = json.loads(s_raw.decode("utf-8"))
    summ = sdata.get("summary", {})
    print(f"Reconciled Cash Received: £{summ.get('total_cash_received')}")
    print(f"Active Contracted MRR: £{summ.get('active_mrr')}/mo ({summ.get('active_subscriptions_count')} active subscribers)")

print("\n--- 8. Testing CSV & AI Report Exports ---")
test_get("/api/export?format=csv&type=sales", "Sales CSV Export")
test_get("/api/export?format=csv&type=tasks", "Tasks CSV Export")
test_get("/api/export?format=json", "AI Analysis JSON Dump")

print("\nAll automated integration tests finished.")
