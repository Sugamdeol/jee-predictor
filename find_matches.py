import re
import difflib

html = open('index.html').read()
js = open('js/predictor.js').read()

html_ids = set(re.findall(r'id="([^"]+)"', html))
js_ids = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js))

print("Checking for mismatches...")
for jid in js_ids:
    if jid not in html_ids:
        print(f"JS ID '{jid}' NOT in HTML")
        closest = difflib.get_close_matches(jid, html_ids)
        if closest:
            print(f"  Did you mean: {closest}")

# Check subjectInputs
subject_match = re.search(r"const subjectInputs = \[(.*?)\];", js)
if subject_match:
    subjects = [s.strip().strip("'").strip('"') for s in subject_match.group(1).split(',')]
    for sub in subjects:
        if sub not in html_ids:
            print(f"Subject Input ID '{sub}' NOT in HTML")
            closest = difflib.get_close_matches(sub, html_ids)
            if closest:
                print(f"  Did you mean: {closest}")
