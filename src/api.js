/**
 * Volia API Service
 * Handles all communication with the backend API
 */

const API_BASE = '/api';

export async function fetchPlatforms() {
  const res = await fetch(`${API_BASE}/platforms`);
  if (!res.ok) throw new Error('Failed to fetch platforms');
  return res.json();
}

export async function detectPlatform(url) {
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Detection failed');
  return res.json();
}

export async function extractMediaInfo(url, platform = null) {
  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, platform }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to extract media info');
  }
  return res.json();
}

export async function downloadMedia(url, formatId, platform = null, taskId = null) {
  const res = await fetch(`${API_BASE}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format_id: formatId, platform, task_id: taskId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Download failed');
  }
  return res.json();
}

export async function fetchProgress(taskId) {
  const res = await fetch(`${API_BASE}/progress/${taskId}`);
  if (!res.ok) return null;
  return res.json();
}

export function getDownloadFileUrl(filename) {
  return `${API_BASE}/download/file/${encodeURIComponent(filename)}`;
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}

// ─── Cookie / Browser Settings ─────────────────────────────────────

export async function getCookieSettings() {
  const res = await fetch(`${API_BASE}/settings/cookies`);
  if (!res.ok) throw new Error('Failed to fetch cookie settings');
  return res.json();
}

export async function setCookieBrowser(browser) {
  const res = await fetch(`${API_BASE}/settings/cookies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ browser }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to set browser');
  }
  return res.json();
}

export async function setupCookies() {
  const res = await fetch(`${API_BASE}/settings/cookies/setup`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Cookie setup failed');
  }
  return res.json();
}

export async function exportCookies(browser) {
  const res = await fetch(`${API_BASE}/settings/cookies/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ browser }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Cookie export failed');
  }
  return res.json();
}

