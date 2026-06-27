const getBackendUrl = () => {
  let url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  url = url.trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getBackendUrl();

export async function extractInfo(url, platform = null) {
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, platform })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Extraction failed' }));
    throw new Error(error.detail || 'Extraction failed');
  }
  return res.json();
}

export async function startDownload(url, format_id, platform = null) {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format_id, platform })
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
