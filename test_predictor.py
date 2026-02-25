#!/usr/bin/env python3
"""Playwright test for JEE Predictor"""

from playwright.sync_api import sync_playwright
import os

def test_jee_predictor():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        
        # Load the page
        file_path = os.path.abspath('/root/.nanobot/workspace/jee-predictor/index.html')
        page.goto(f'file://{file_path}')
        
        print("✅ Page loaded successfully")
        
        # Wait for page to be ready
        page.wait_for_selector('#physics', timeout=5000)
        
        # Fill in the form
        print("\n📝 Filling in form values...")
        
        # Physics = 60
        page.fill('#physics', '60')
        print("   - Physics: 60")
        
        # Chemistry = 70
        page.fill('#chemistry', '70')
        print("   - Chemistry: 70")
        
        # Math = 80
        page.fill('#math', '80')
        print("   - Math: 80")
        
        # Category = General (already default, but let's verify)
        page.select_option('#category', 'General')
        print("   - Category: General")
        
        # Take screenshot before clicking
        page.screenshot(path='/root/.nanobot/workspace/jee-predictor/screenshot_before.png')
        print("\n📸 Screenshot saved: screenshot_before.png")
        
        # Click "Predict My Rank" button
        print("\n🖱️ Clicking 'Predict My Rank' button...")
        page.click('button.calculate-btn')
        
        # Wait for results to appear
        print("⏳ Waiting for results...")
        page.wait_for_selector('#results', state='visible', timeout=10000)
        
        # Wait a bit more for animations
        page.wait_for_timeout(1000)
        
        # Take screenshot after results
        page.screenshot(path='/root/.nanobot/workspace/jee-predictor/screenshot_after.png', full_page=True)
        print("📸 Screenshot saved: screenshot_after.png")
        
        # Check if results section is displayed
        results_display = page.evaluate('() => document.getElementById("results").style.display')
        print(f"\n📊 Results section display: {results_display}")
        
        # Extract results data
        percentile = page.inner_text('#predictedPercentile')
        rank = page.inner_text('#predictedRank')
        category_rank = page.inner_text('#categoryRank')
        marks = page.inner_text('#displayMarks')
        category_label = page.inner_text('#categoryLabel')
        
        print("\n📈 RESULTS EXTRACTED:")
        print(f"   - Percentile: {percentile}")
        print(f"   - All India Rank (AIR): {rank}")
        print(f"   - Category Rank: {category_rank}")
        print(f"   - Category: {category_label}")
        print(f"   - Total Marks: {marks}")
        
        # Check qualifying status
        status_text = page.inner_text('#qualifyingStatus')
        print(f"   - Qualifying Status: {status_text}")
        
        # Check colleges section
        colleges_html = page.inner_html('#collegeGrid')
        has_colleges = 'college-card' in colleges_html
        print(f"\n🏫 Colleges displayed: {'YES' if has_colleges else 'NO'}")
        
        if has_colleges:
            # Count college cards
            college_count = page.evaluate('() => document.querySelectorAll(".college-card").length')
            print(f"   - Number of colleges shown: {college_count}")
        
        # Verify all expected elements
        checks = {
            'Results section visible': results_display != 'none',
            'Percentile displayed': percentile != '--' and '%ile' in percentile,
            'Rank displayed': rank != '--' and rank != '',
            'Category Rank displayed': category_rank != '--' and category_rank != '',
            'Colleges displayed': has_colleges,
            'Qualifying status shown': 'Qualified' in status_text or 'Not Qualified' in status_text
        }
        
        print("\n✅ VERIFICATION SUMMARY:")
        all_passed = True
        for check_name, passed in checks.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {status}: {check_name}")
            if not passed:
                all_passed = False
        
        browser.close()
        
        print(f"\n{'='*50}")
        if all_passed:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️ SOME TESTS FAILED")
        print(f"{'='*50}")
        
        return all_passed

if __name__ == '__main__':
    test_jee_predictor()
