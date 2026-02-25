#!/usr/bin/env python3
"""Helper to search for JEE Mains information using SearXNG"""

import requests
import json

def search_web(query, instance="https://search.sapti.me"):
    """Search using public SearXNG instance"""
    try:
        response = requests.get(
            f"{instance}/search",
            params={"q": query, "format": "json"},
            timeout=30
        )
        return response.json()
    except Exception as e:
        return {"error": str(e), "results": []}

def fetch_url(url):
    """Fetch content from a URL"""
    try:
        response = requests.get(url, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        return response.text[:8000]
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        query = sys.argv[1]
        results = search_web(query)
        print(json.dumps(results, indent=2))
    else:
        print("Usage: python search_helper.py 'search query'")
