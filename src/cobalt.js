/**
 * Cobalt API Service
 * Handles all communication with the Cobalt public API
 * Replaces the old backend API layer entirely
 */

/**
 * Get Cobalt Settings from localStorage
 */
export function getCobaltSettings() {
  try {
    const raw = localStorage.getItem('volia_cobalt_settings');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { url: import.meta.env.VITE_COBALT_API || 'https://cobalt-xyz.up.railway.app', apiKey: '' };
}

/**
 * Save Cobalt Settings to localStorage
 */
export function saveCobaltSettings(settings) {
  try {
    localStorage.setItem('volia_cobalt_settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Map Cobalt error codes to user-friendly messages
 */
const ERROR_MESSAGES = {
  'error.api.link.invalid': 'Invalid URL. Please check the link and try again.',
  'error.api.link.unsupported': 'This platform is not supported. Try YouTube, Instagram, Twitter/X, or Facebook.',
  'error.api.fetch.fail': 'Could not fetch this video. It may be private, deleted, or unavailable.',
  'error.api.fetch.critical': 'A critical error occurred while fetching. Please try again later.',
  'error.api.fetch.empty': 'No downloadable content found at this URL.',
  'error.api.content.video.unavailable': 'This video is unavailable or geo-restricted.',
  'error.api.content.video.live': 'Live videos cannot be downloaded.',
  'error.api.content.video.age': 'This video is age-restricted and cannot be accessed.',
  'error.api.content.post.unavailable': 'This post is unavailable. It may be private or deleted.',
  'error.api.rate_exceeded': 'Too many requests. Please wait a moment and try again.',
  'error.api.auth.jwt.missing': 'This Cobalt instance requires authentication.',
  'error.api.auth.jwt.invalid': 'Authentication token is invalid or expired.',
};

/**
 * Get a user-friendly error message from a Cobalt error code
 */
function mapErrorCode(code, context) {
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];

  // Handle dynamic error patterns
  if (code?.startsWith('error.api.auth')) return 'Authentication required by the download service.';
  if (code?.startsWith('error.api.fetch')) return 'Failed to fetch the content. Please try again.';
  if (code?.startsWith('error.api.content')) return 'This content is not available for download.';
  if (code?.startsWith('error.api.link')) return 'The provided URL is not valid or supported.';

  return `Download failed (${code || 'unknown error'}). Please try a different URL.`;
}

/**
 * Main download function — calls the Cobalt API
 *
 * @param {string} url - The media URL to download
 * @param {object} options - Quality options
 * @param {string} options.videoQuality - '144'|'360'|'480'|'720'|'1080'|'1440'|'2160'|'4320'|'max'
 * @param {string} options.downloadMode - 'auto'|'audio'|'mute'
 * @param {string} options.audioFormat - 'best'|'mp3'|'ogg'|'wav'|'opus'
 * @returns {Promise<object>} Parsed Cobalt response
 */
export async function downloadWithCobalt(url, options = {}) {
  const body = {
    url,
    videoQuality: options.videoQuality || '1080',
    downloadMode: options.downloadMode || 'auto',
    audioFormat: options.audioFormat || 'mp3',
    filenameStyle: 'pretty',
  };

  const settings = getCobaltSettings();
  const defaultApi = import.meta.env.VITE_COBALT_API || 'https://cobalt-xyz.up.railway.app';
  const apiUrl = settings.url ? settings.url.replace(/\/$/, '') : defaultApi;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (settings.apiKey) {
    headers['Authorization'] = `Api-Key ${settings.apiKey}`;
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Try to parse error body
    const errorData = await res.json().catch(() => null);
    if (errorData?.error?.code) {
      throw new Error(mapErrorCode(errorData.error.code, errorData.error.context));
    }
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(`Download service returned an error (HTTP ${res.status}). Please try again.`);
  }

  const data = await res.json();

  switch (data.status) {
    case 'redirect':
    case 'tunnel':
      return {
        status: data.status,
        url: data.url,
        filename: data.filename || generateFilename(url),
      };

    case 'picker':
      return {
        status: 'picker',
        picker: data.picker || [],
        audio: data.audio || null,
        audioFilename: data.audioFilename || null,
      };

    case 'error':
      throw new Error(mapErrorCode(data.error?.code, data.error?.context));

    default:
      throw new Error('Unexpected response from download service.');
  }
}

/**
 * Trigger a browser download for a given URL
 * Handles both redirect (direct link) and tunnel (stream) scenarios
 * Mobile-friendly: avoids blob URLs on iOS
 *
 * @param {string} url - The download URL
 * @param {string} filename - Suggested filename
 * @param {string} status - 'redirect' or 'tunnel'
 */
export async function triggerDownload(url, filename, status = 'tunnel') {
  if (status === 'redirect') {
    // Direct URL — open in new tab (lets browser handle the download)
    window.open(url, '_blank');
    return;
  }

  // Tunnel URL — must be fetched and streamed as a blob
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'video';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download error:', err);
    throw err;
  }
}

/**
 * Generate a fallback filename from URL
 */
function generateFilename(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '').split('.')[0];
    const ts = Date.now().toString(36);
    return `${host}_${ts}`;
  } catch {
    return `download_${Date.now().toString(36)}`;
  }
}

// ─── localStorage History ──────────────────────────────────────────

const HISTORY_KEY = 'volia_history';
const MAX_HISTORY = 50;

/**
 * Add an item to download history (localStorage)
 */
export function addToHistory(item) {
  try {
    const history = getHistory();
    history.unshift({
      url: item.url,
      platform: item.platform || 'unknown',
      filename: item.filename || 'Unknown',
      date: new Date().toLocaleString(),
    });
    // Keep only the last MAX_HISTORY items
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get download history from localStorage
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all download history
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

/**
 * Detect platform from URL (client-side)
 */
export function detectPlatform(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/reddit\.com/i.test(url)) return 'reddit';
  if (/pinterest\.com/i.test(url)) return 'pinterest';
  if (/tumblr\.com/i.test(url)) return 'tumblr';
  if (/soundcloud\.com/i.test(url)) return 'soundcloud';
  if (/twitch\.tv/i.test(url)) return 'twitch';
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  return null;
}
