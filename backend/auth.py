"""Spotify OAuth2 authentication with refresh token persistence."""
import os
from pathlib import Path
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

SCOPE = 'user-read-recently-played user-top-read'
ENV_PATH = Path(os.getenv('PERSONIFY_ENV', Path(__file__).parent / '.env'))
TOKEN_KEY='SPOTIF...OKEN'
EQ = '='
QUOTE_CHARS = '\'"'


def _read_refresh_token():
    """Read the cached refresh token from .env."""
    if not ENV_PATH.exists():
        return None
    with open(ENV_PATH) as f:
        for line in f:
            if line.startswith(TOKEN_KEY + EQ):
                return line.split(EQ, 1)[1].strip().strip(QUOTE_CHARS)
    return None


def _write_refresh_token(value: str):
    """Write or update the refresh token in .env."""
    lines = []
    found = False
    if ENV_PATH.exists():
        with open(ENV_PATH) as f:
            lines = f.readlines()
    prefix = TOKEN_KEY + EQ
    with open(ENV_PATH, 'w') as f:
        for line in lines:
            if line.startswith(prefix):
                f.write(f'{TOKEN_KEY}{EQ}{value}\n')
                found = True
            else:
                f.write(line)
        if not found:
            f.write(f'{TOKEN_KEY}{EQ}{value}\n')


class SpotifyAuth:
    """Manages Spotify OAuth2 lifecycle."""

    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv(
            'SPOTIFY_REDIRECT_URI', 'http://localhost:8000/callback'
        )
        self._sp = None
        self._auth_manager = None

    def _build_auth(self) -> SpotifyOAuth:
        """Build auth manager, pre-load cached refresh token if available."""
        cached = _read_refresh_token()
        if cached:
            os.environ[TOKEN_KEY] = cached
        self._auth_manager = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=SCOPE,
            open_browser=False,
            cache_path=str(ENV_PATH.parent / '.spotify_cache'),
        )
        return self._auth_manager

    def get_client(self) -> spotipy.Spotify:
        """Return an authenticated Spotipy client."""
        auth = self._build_auth()
        self._auth_manager = auth

        token_info = auth.get_cached_token()
        if not token_info:
            token_info = auth.get_access_token(as_dict=True)

        refresh = None
        if token_info:
            refresh = token_info.get('refresh_token')
        if not refresh:
            refresh = os.environ.get(TOKEN_KEY)
        if refresh:
            _write_refresh_token(refresh)

        self._sp = spotipy.Spotify(auth_manager=auth)
        return self._sp

    def validate(self) -> dict:
        """Quick auth check — returns user profile if auth works."""
        sp = self.get_client()
        try:
            me = sp.current_user()
            recent = sp.current_user_recently_played(limit=1)
            return {
                'ok': True,
                'user': me['display_name'],
                'country': me.get('country'),
                'has_recently_played': bool(recent.get('items')),
            }
        except Exception as e:
            return {'ok': False, 'error': str(e)}
