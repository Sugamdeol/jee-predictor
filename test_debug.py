from playwright.sync_api import sync_playwright
import os
import subprocess
import time
import signal

def test_debug():
    server = subprocess.Popen(["python3", "-m", "http.server", "8004"])
    time.sleep(2)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            page.add_init_script("""
                const originalGetElementById = document.getElementById;
                document.getElementById = function(id) {
                    const el = originalGetElementById.call(document, id);
                    if (!el) {
                        console.log('MISSING_ELEMENT: ' + id);
                    } else {
                        console.log('FOUND_ELEMENT: ' + id);
                    }
                    return el;
                };
            """)

            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            page.goto("http://localhost:8004/index.html")

            print("--- Filling totalMarks ---")
            page.fill("#totalMarks", "200")

            print("--- Clicking Predict ---")
            page.click("button:has-text('Predict My Rank')")

            page.wait_for_timeout(1000)
            browser.close()
    finally:
        os.kill(server.pid, signal.SIGTERM)

if __name__ == "__main__":
    test_debug()
