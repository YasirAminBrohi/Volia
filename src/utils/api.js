const getBackendUrl = () => {
  let url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  url = url.trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getBackendUrl();

const COOKIES_STORAGE_KEY = 'volia_custom_cookies';

/** Get user's custom cookies from localStorage */
export function getStoredCookies() {
  return localStorage.getItem(COOKIES_STORAGE_KEY) || null;
}

/** Save custom cookies to localStorage */
export function saveStoredCookies(cookiesText) {
  localStorage.setItem(COOKIES_STORAGE_KEY, cookiesText);
}

/** Clear custom cookies from localStorage */
export function clearStoredCookies() {
  localStorage.removeItem(COOKIES_STORAGE_KEY);
}

export async function extractInfo(url, platform = null) {
  const cookies = getStoredCookies();
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, platform, cookies })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Extraction failed' }));
    throw new Error(error.detail || 'Extraction failed');
  }
  return res.json();
}

export async function startDownload(url, format_id, platform = null) {
  const cookies = getStoredCookies();
  const res = await fetch(`${API_BASE}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format_id, platform, cookies })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Download failed' }));
    throw new Error(error.detail || 'Download failed');
  }
  return res.json();
}

export function getDownloadUrl(filename) {
  return `${API_BASE}/api/download-file/${encodeURIComponent(filename)}`;
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) return { history: [] };
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/api/history`, { method: 'DELETE' });
  return res.json();
}

export async function getCookieSettings() {
  const res = await fetch(`${API_BASE}/api/settings/cookies`);
  if (!res.ok) return null;
  return res.json();
}

export async function setCookieBrowser(browser) {
  const res = await fetch(`${API_BASE}/api/settings/cookies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ browser })
  });
  return res.json();
}

export async function syncCookies() {
  const res = await fetch(`${API_BASE}/api/settings/cookies/setup`, {
    method: 'POST'
  });
  return res.json();
}

/** Parse cookie text client-side and return analysis */
export function analyzeCookiesLocally(cookiesText) {
  if (!cookiesText || !cookiesText.trim()) {
    return { exists: false, num_cookies: 0, youtube_cookies_count: 0, google_cookies_count: 0, message: 'No cookies' };
  }
  const lines = cookiesText.split('\n');
  let num_cookies = 0, youtube_cookies = 0, google_cookies = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('\t');
    if (parts.length >= 7) {
      num_cookies++;
      const domain = parts[0].toLowerCase();
      if (domain.includes('youtube.com')) youtube_cookies++;
      else if (domain.includes('google.com')) google_cookies++;
    }
  }
  return {
    exists: true,
    num_cookies,
    youtube_cookies_count: youtube_cookies,
    google_cookies_count: google_cookies,
    message: `Loaded ${num_cookies} cookies (${youtube_cookies} YouTube, ${google_cookies} Google)`
  };
}
