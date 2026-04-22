import re

def normalize(s):
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

html = open('index.html').read()
js = open('js/predictor.js').read()

html_ids = re.findall(r'id="([^"]+)"', html)
js_ids = re.findall(r"getElementById\('([^']+)'\)", js)

# Add subjects
js_ids.extend(['physics', 'chemistry', 'math'])

print("Comparing normalized IDs...")
for jid in set(js_ids):
    njid = normalize(jid)
    found = False
    for hid in html_ids:
        if njid == normalize(hid):
            if jid != hid:
                print(f"Subtle Mismatch: JS '{jid}' vs HTML '{hid}'")
            found = True
            break
    if not found:
        print(f"JS ID '{jid}' has NO match in HTML even when normalized")

for hid in html_ids:
    nhid = normalize(hid)
    found = False
    for jid in js_ids:
        if nhid == normalize(jid):
            found = True
            break
    if not found:
        print(f"HTML ID '{hid}' has NO match in JS even when normalized")
