from playwright.sync_api import sync_playwright
import subprocess
import time
import os
import signal

def debug_playwright():
    server = subprocess.Popen(["python3", "-m", "http.server", "8005"])
    time.sleep(2)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Script to log all getElementById and check if they return null
            page.add_init_script("""
                const originalGetElementById = document.getElementById;
                document.getElementById = function(id) {
                    const el = originalGetElementById.call(document, id);
                    if (!el) {
                        console.log('DEBUG_NULL_ID: ' + id);
                    }
                    return el;
                };
            """)

            page.on("console", lambda msg: print(f"BROWSER_CONSOLE: {msg.text}"))
            page.on("pageerror", lambda exc: print(f"BROWSER_ERROR: {exc}"))

            page.goto("http://localhost:8005/index.html")

            # Give it a second to load data
            page.wait_for_timeout(1000)

            print("Action: Filling marks and clicking Predict")
            page.fill("#totalMarks", "150")
            page.click("button:has-text('Predict My Rank')")

            # Wait for any potential async actions
            page.wait_for_timeout(1000)

            # Also check What-if
            print("Action: Moving slider")
            page.evaluate("updateWhatIf(100)")

            browser.close()
    finally:
        os.kill(server.pid, signal.SIGTERM)

if __name__ == "__main__":
    debug_playwright()
