import re

html_bytes = open('index.html', 'rb').read()
js_bytes = open('js/predictor.js', 'rb').read()

html_ids = re.findall(b'id="([^"]+)"', html_bytes)
js_ids = re.findall(b"getElementById\('([^']+)'\)", js_bytes)

print("--- Strict ID Comparison ---")
for jid in set(js_ids):
    if jid not in html_ids:
        print(f"Mismatch: JS ID {jid} not in HTML")
        # Check for case mismatch
        for hid in html_ids:
            if jid.lower() == hid.lower():
                print(f"  Found case mismatch: JS={jid}, HTML={hid}")
    else:
        print(f"Match: {jid}")

# Also check subjectInputs specifically
subject_match = re.search(b"const subjectInputs = \[(.*?)\];", js_bytes)
if subject_match:
    subjects = [s.strip().strip(b"'").strip(b'"') for s in subject_match.group(1).split(b',')]
    for sub in subjects:
        if sub not in html_ids:
            print(f"Subject Mismatch: JS {sub} not in HTML")
