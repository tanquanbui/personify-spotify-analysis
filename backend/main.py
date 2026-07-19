from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from contextlib import asynccontextmanager
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from auth import SpotifyAuth, _read_refresh_token

sa = SpotifyAuth()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Personify API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    token = _read_refresh_token()
    return {
        "status": "ok",
        "service": "personify",
        "authenticated": bool(token),
    }


@app.get("/api/auth/login")
async def login():
    """Redirect to Spotify for authorization."""
    auth = sa._build_auth()
    auth_url = auth.get_authorize_url()
    return RedirectResponse(auth_url)


@app.get("/api/auth/callback")
async def auth_callback(request: Request):
    """Handle Spotify OAuth redirect. Exchanges code for token."""
    code = request.query_params.get("code")
    error = request.query_params.get("error")

    if error:
        return HTMLResponse(
            "<h2>Auth failed</h2><p>" + error + "</p>",
            status_code=400,
        )

    if not code:
        return HTMLResponse(
            "<h2>No code received</h2>"
            "<p>This is the callback URL. Visit "
            "<a href='/api/auth/login'>/api/auth/login</a> to start.</p>",
            status_code=400,
        )

    try:
        # Exchange code for token
        client = sa.get_client()
        me = client.current_user()
        return HTMLResponse("""
        <html>
        <body style="font-family:Inter,sans-serif;text-align:center;padding-top:80px;
                    background:linear-gradient(135deg,#e2d8ee,#d8e4f2,#efe4d6,#e4daef);
                    min-height:100vh;color:#12101a">
            <h1 style="font-size:28px">&#9989; Connected!</h1>
            <p>Logged in as <strong>""" + me["display_name"] + """</strong></p>
            <p>You can close this window.</p>
        </body>
        </html>
        """)
    except Exception as e:
        return HTMLResponse(
            "<h2>Auth error</h2><p>" + str(e) + "</p>",
            status_code=500,
        )


@app.get("/api/auth/validate")
async def validate():
    """Check if authenticated. Returns user info or redirect to login."""
    token = _read_refresh_token()
    if not token:
        login_url = "/api/auth/login"
        return HTMLResponse(
            "<h2>Not authenticated</h2>"
            "<p><a href='" + login_url + "'>Click here to log in with Spotify</a></p>",
            status_code=401,
        )
    return sa.validate()
