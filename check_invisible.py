import re

def get_ids(text):
    return re.findall(r'id="([^"]+)"', text)

def get_js_ids(text):
    return re.findall(r"getElementById\('([^']+)'\)", text)

with open('index.html', 'r') as f:
    html = f.read()
    h_ids = get_ids(html)

with open('js/predictor.js', 'r') as f:
    js = f.read()
    j_ids = get_js_ids(js)

print("HTML IDs:", h_ids)
print("JS IDs:", j_ids)

for jid in j_ids:
    if jid not in h_ids:
        print(f"MISMATCH: '{jid}' not in HTML")
        # Check if it exists with different bytes
        found = False
        for hid in h_ids:
             if jid.encode() == hid.encode():
                 found = True
        if not found:
             print(f"  Definitely missing: {jid}")

for hid in h_ids:
    if hid not in j_ids and hid not in ['physics', 'chemistry', 'math']:
         print(f"HTML ID '{hid}' not in JS")
