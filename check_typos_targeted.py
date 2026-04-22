import re

with open('index.html', 'r') as f:
    html = f.read()

with open('js/predictor.js', 'r') as f:
    js = f.read()

# Common typos or mismatches
common_typos = [
    ('totalMarks', 'total_marks'),
    ('totalMarks', 'total-marks'),
    ('totalMarks', 'totalmarks'),
    ('predictedPercentile', 'percentileResult'),
    ('predictedPercentile', 'percentile-result'),
    ('predictedPercentile', 'expectedPercentile'),
    ('predictedRank', 'rankResult'),
    ('predictedRank', 'rank-result'),
    ('predictedRank', 'expectedRank'),
    ('categoryRank', 'catRank'),
    ('categoryRank', 'category-rank'),
    ('categoryLabel', 'category-label'),
    ('displayMarks', 'display-marks'),
    ('displayMarks', 'marksDisplay'),
    ('marksSlider', 'marks-slider'),
    ('sliderValue', 'slider-value'),
    ('whatifResult', 'whatif-result'),
    ('whatifResult', 'what-if-result'),
    ('qualifyingStatus', 'qualifying-status'),
    ('collegeGrid', 'college-grid'),
    ('marksPercentileChart', 'percentile-chart'),
    ('physics', 'phy'),
    ('chemistry', 'chem'),
    ('math', 'maths')
]

html_ids = set(re.findall(r'id="([^"]+)"', html))
js_ids = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js))

print("Checking for common mismatches...")
for js_id, html_id in common_typos:
    if js_id in js and html_id in html_ids:
        print(f"Mismatch: JS uses '{js_id}', but HTML has ID '{html_id}'")
    if html_id in js and js_id in html_ids:
        print(f"Mismatch: JS uses '{html_id}', but HTML has ID '{js_id}'")

print("\nAll getElementById calls:")
for jid in sorted(js_ids):
    if jid not in html_ids:
        print(f"  MISSING: {jid} not found in index.html")
    else:
        print(f"  OK: {jid}")

print("\nAll HTML IDs:")
for hid in sorted(html_ids):
    print(f"  ID: {hid}")
