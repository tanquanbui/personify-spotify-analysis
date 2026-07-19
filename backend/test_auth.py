"""Test Spotify authentication end-to-end."""
import os, sys
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
ENV_FILE = BACKEND_DIR / ".env"
REFRESH_KEY = "SPOTIFY_REFRESH_TOKEN"


def check_env():
    print("=" * 50)
    print("TEST 1: Environment check")
    
    if not ENV_FILE.exists():
        print("FAIL - no backend/.env file")
        print("Create it with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET")
        print("=" * 50)
        return False
    
    from dotenv import load_dotenv
    load_dotenv(ENV_FILE)
    
    cid = os.getenv("SPOTIFY_CLIENT_ID")
    secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    
    ok = True
    for name, val in [("CLIENT_ID", cid), ("CLIENT_SECRET", secret)]:
        if val:
            print("  [PASS] " + name + " set")
        else:
            print("  [FAIL] " + name + " missing")
            ok = False
    
    if cid and len(cid) != 32:
        print("  [WARN] CLIENT_ID is " + str(len(cid)) + " chars (expected 32)")
    
    print("=" * 50)
    return ok


def check_auth():
    print()
    print("=" * 50)
    print("TEST 2: Spotify authentication")
    
    from auth import SpotifyAuth
    sa = SpotifyAuth()
    
    try:
        result = sa.validate()
        if result.get("ok"):
            print("  [PASS] User: " + result["user"])
            print("  [PASS] Country: " + str(result.get("country", "?")))
            recent = result.get("has_recently_played")
            print("  [PASS] Has recent plays: " + str(recent))
            print("=" * 50)
            return True
        else:
            print("  [FAIL] " + str(result.get("error", "unknown")))
            print("=" * 50)
            return False
    except Exception as e:
        print("  [FAIL] Exception: " + str(e))
        print("=" * 50)
        return False


def check_token_saved():
    print()
    print("=" * 50)
    print("TEST 3: Token persistence")
    
    from auth import _read_refresh_token
    token = _read_refresh_token()
    
    if token:
        print("  [PASS] Token saved: " + str(len(token)) + " chars")
        if len(token) > 16:
            print("  [INFO] " + token[:8] + "..." + token[-8:])
        print("=" * 50)
        return True
    
    print("  [FAIL] No token in .env")
    print("=" * 50)
    return False


def check_api():
    print()
    print("=" * 50)
    print("TEST 4: Spotify API calls")
    
    from auth import SpotifyAuth
    sa = SpotifyAuth()
    client = sa.get_client()
    all_ok = True
    
    try:
        recent = client.current_user_recently_played(limit=5)
        n = len(recent.get("items", []))
        print("  [PASS] Recently played: " + str(n) + " tracks")
    except Exception as e:
        print("  [FAIL] Recently played: " + str(e))
        all_ok = False
    
    try:
        top = client.current_user_top_artists(limit=3, time_range="short_term")
        names = [a["name"] for a in top.get("items", [])]
        print("  [PASS] Top artists: " + ", ".join(names) if names else "  [INFO] No top artists yet")
    except Exception as e:
        print("  [FAIL] Top artists: " + str(e))
        all_ok = False
    
    print("=" * 50)
    return all_ok


def reset():
    if ENV_FILE.exists():
        kept = []
        with open(ENV_FILE) as f:
            for line in f:
                if not line.startswith(REFRESH_KEY):
                    kept.append(line)
        with open(ENV_FILE, "w") as f:
            for line in kept:
                f.write(line)
    cache = BACKEND_DIR / ".spotify_cache"
    if cache.exists():
        cache.unlink()
    print("Auth reset.")


def main():
    if "--reset" in sys.argv:
        reset()
        print()
    
    results = [check_env()]
    if not results[-1]:
        print("\nFix .env and retry.")
        sys.exit(1)
    
    results.append(check_auth())
    if not results[-1]:
        print("\nAuth failed.")
        sys.exit(1)
    
    results.append(check_token_saved())
    results.append(check_api())
    
    n = sum(results)
    t = len(results)
    print()
    print("RESULTS: " + str(n) + "/" + str(t) + " passed")
    if n == t:
        print("All tests passed.")
    else:
        print("Some failures.")


if __name__ == "__main__":
    main()
