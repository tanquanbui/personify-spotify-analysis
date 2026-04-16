import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from './Login';

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
    delete window.location;
    window.location = { hash: '', href: '' };
    localStorage.clear();
});
afterEach(() => {
    window.location = originalLocation;
});

describe('Login URL construction', () => {
    test('login link encodes the redirect URI', () => {
        render(<Login />);
        const link = screen.getByRole('link', { name: /login to spotify/i });
        const href = link.getAttribute('href');

        // redirect_uri must be percent-encoded so the URL is well-formed
        expect(href).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
        expect(href).not.toMatch(/redirect_uri=http:\/\//);
    });

    test('login link encodes all scopes (space becomes %20)', () => {
        render(<Login />);
        const link = screen.getByRole('link', { name: /login to spotify/i });
        const href = link.getAttribute('href');

        // A raw space in the URL would truncate the second scope
        expect(href).not.toContain('scope=user-top-read playlist-read-private');
        expect(href).toContain('scope=user-top-read%20playlist-read-private');
    });

    test('login link includes both required scopes', () => {
        render(<Login />);
        const link = screen.getByRole('link', { name: /login to spotify/i });
        const href = link.getAttribute('href');
        const url = new URL(href);

        const scopes = url.searchParams.get('scope').split(' ');
        expect(scopes).toContain('user-top-read');
        expect(scopes).toContain('playlist-read-private');
    });

    test('login link targets the Spotify auth endpoint', () => {
        render(<Login />);
        const link = screen.getByRole('link', { name: /login to spotify/i });
        const href = link.getAttribute('href');

        expect(href).toMatch(/^https:\/\/accounts\.spotify\.com\/authorize/);
        expect(href).toContain('response_type=token');
    });
});

describe('Login token handling from URL hash', () => {
    test('stores token and expiry in localStorage under correct keys on callback', () => {
        const expiresIn = 3600;
        const fakeToken = 'test-access-token-abc';
        window.location.hash = `#access_token=${fakeToken}&expires_in=${expiresIn}`;

        render(<Login />);

        expect(localStorage.getItem('spotifyToken')).toBe(fakeToken);
        expect(localStorage.getItem('spotifyTokenExpiry')).not.toBeNull();
    });

    test('reads existing valid token from localStorage and shows logged-in state', () => {
        const futureExpiry = new Date().getTime() + 60 * 60 * 1000; // 1h from now
        localStorage.setItem('spotifyToken', 'stored-token');
        localStorage.setItem('spotifyTokenExpiry', String(futureExpiry));
        window.location.hash = '';

        render(<Login />);

        expect(screen.getByText(/you are logged in/i)).toBeInTheDocument();
    });

    test('shows login link when no token exists', () => {
        window.location.hash = '';

        render(<Login />);

        expect(screen.getByRole('link', { name: /login to spotify/i })).toBeInTheDocument();
    });
});
