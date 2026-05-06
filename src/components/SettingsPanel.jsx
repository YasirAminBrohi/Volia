import { useState, useEffect } from 'react';
import { getCookieSettings, setCookieBrowser, setupCookies, exportCookies } from '../api';

const BROWSER_ICONS = {
  edge: '🌐',
  chrome: '🔵',
  firefox: '🦊',
  brave: '🦁',
  opera: '🔴',
  chromium: '⚪',
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getCookieSettings();
      setSettings(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load settings: ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSetBrowser(browser) {
    try {
      setActionLoading('set-' + browser);
      setMessage(null);
      const result = await setCookieBrowser(browser);
      setMessage({ type: 'success', text: result.message });
      await loadSettings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAutoSetup() {
    try {
      setActionLoading('auto');
      setMessage(null);
      const result = await setupCookies();
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
      await loadSettings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExport(browser) {
    try {
      setActionLoading('export-' + browser);
      setMessage(null);
      const result = await exportCookies(browser);
      setMessage({ type: 'success', text: result.message });
      await loadSettings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="settings-panel animate-fade">
        <h2 className="settings-title">⚙️ Settings</h2>
        <div className="settings-loading">
          <div className="spinner spinner-purple"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel animate-fade">
      <h2 className="settings-title">⚙️ Settings</h2>

      {/* Cookie Status */}
      <div className="settings-section">
        <h3 className="settings-section-title">🍪 Browser Cookies</h3>
        <p className="settings-description">
          Volia uses your browser cookies to access content that requires login
          (age-restricted YouTube videos, Instagram posts, etc). Select which browser
          to read cookies from.
        </p>

        {/* Status indicator */}
        <div className="cookie-status">
          <div className={`status-dot ${settings?.preferred_browser || settings?.cookie_file ? 'active' : 'inactive'}`}></div>
          <span className="status-text">
            {settings?.preferred_browser
              ? `Using cookies from: ${settings.preferred_browser.charAt(0).toUpperCase() + settings.preferred_browser.slice(1)}`
              : settings?.cookie_file
                ? `Using cookie file`
                : 'No browser configured'}
          </span>
        </div>

        {/* Auto-setup button */}
        <button
          className="settings-btn primary"
          onClick={handleAutoSetup}
          disabled={actionLoading !== null}
          id="auto-setup-cookies"
        >
          {actionLoading === 'auto' ? (
            <><span className="spinner spinner-sm"></span> Detecting...</>
          ) : (
            <>🔍 Auto-Detect Best Browser</>
          )}
        </button>
      </div>

      {/* Browser Selection */}
      <div className="settings-section">
        <h3 className="settings-section-title">🌐 Select Browser</h3>
        <p className="settings-description">
          Choose the browser where you are logged into the platforms you want to download from.
          Make sure you are signed in on that browser.
        </p>

        <div className="browser-grid">
          {settings?.supported_browsers?.map(browser => (
            <div
              key={browser}
              className={`browser-card ${settings.preferred_browser === browser ? 'selected' : ''}`}
            >
              <div className="browser-card-header">
                <span className="browser-icon">{BROWSER_ICONS[browser] || '🌐'}</span>
                <span className="browser-name">{browser.charAt(0).toUpperCase() + browser.slice(1)}</span>
                {settings.preferred_browser === browser && (
                  <span className="browser-active-badge">Active</span>
                )}
              </div>
              <div className="browser-card-actions">
                <button
                  className="settings-btn sm"
                  onClick={() => handleSetBrowser(browser)}
                  disabled={actionLoading !== null}
                  id={`set-browser-${browser}`}
                >
                  {actionLoading === 'set-' + browser ? (
                    <span className="spinner spinner-sm"></span>
                  ) : (
                    'Select'
                  )}
                </button>
                <button
                  className="settings-btn sm outline"
                  onClick={() => handleExport(browser)}
                  disabled={actionLoading !== null}
                  id={`export-browser-${browser}`}
                  title="Export cookies from this browser to a file"
                >
                  {actionLoading === 'export-' + browser ? (
                    <span className="spinner spinner-sm"></span>
                  ) : (
                    '📤 Export'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">❓ Troubleshooting</h3>
        <div className="settings-help">
          <div className="help-item">
            <strong>⚠️ "Please sign in" error</strong>
            <p>This means YouTube requires authentication. Click "Auto-Detect" above, or select the browser where you're logged into YouTube.</p>
          </div>
          <div className="help-item">
            <strong>⚠️ "Database is locked" error</strong>
            <p>Close your browser completely, click "Export" to save cookies to a file, then reopen your browser. The exported cookies will be used instead.</p>
          </div>
          <div className="help-item">
            <strong>⚠️ Instagram/Facebook not working</strong>
            <p>Make sure you're logged into these platforms in the selected browser, then click "Export" to refresh the cookie file.</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}
    </div>
  );
}
