import { useState, useEffect } from 'react';
import { getCookieSettings, setCookieBrowser, syncCookies } from '../utils/api';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({ 
    theme: localStorage.getItem('volia_theme') || 'dark',
    autoDownload: localStorage.getItem('volia_auto_download') === 'true'
  });
  const [saved, setSaved] = useState(false);

  // Cookie/Browser settings state
  const [cookieInfo, setCookieInfo] = useState({
    preferred_browser: 'edge',
    cookie_file: null,
    supported_browsers: ['edge', 'chrome', 'firefox', 'brave', 'opera', 'chromium']
  });
  const [syncStatus, setSyncStatus] = useState({ success: null, message: '' });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function loadCookieSettings() {
      try {
        const data = await getCookieSettings();
        if (data) {
          setCookieInfo(data);
        }
      } catch (err) {
        console.error("Failed to load cookie settings:", err);
      }
    }
    loadCookieSettings();
  }, []);

  async function handleBrowserChange(browser) {
    try {
      const res = await setCookieBrowser(browser);
      if (res.success) {
        setCookieInfo(prev => ({ ...prev, preferred_browser: browser }));
      }
    } catch (err) {
      console.error("Failed to set preferred browser:", err);
    }
  }

  async function handleSyncCookies() {
    setSyncing(true);
    setSyncStatus({ success: null, message: '' });
    try {
      const res = await syncCookies();
      if (res.success) {
        setSyncStatus({ success: true, message: res.message || 'Successfully synced cookies!' });
        setCookieInfo(prev => ({ ...prev, cookie_file: res.cookie_file }));
      } else {
        setSyncStatus({ success: false, message: res.message || 'Sync failed.' });
      }
    } catch (err) {
      setSyncStatus({ success: false, message: err.message || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  }

  function handleSave() {
    localStorage.setItem('volia_theme', settings.theme);
    localStorage.setItem('volia_auto_download', settings.autoDownload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="settings-panel animate-fade">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>
        <p className="settings-description">
          Tune Volia so the workspace feels comfortable on your device.
        </p>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={e => setSettings({ ...settings, theme: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
          </select>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: '32px' }}>
        <h3 className="settings-section-title">Preferences</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="autoDownload"
            checked={settings.autoDownload}
            onChange={e => setSettings({ ...settings, autoDownload: e.target.checked })}
          />
          <label htmlFor="autoDownload" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Auto-start download after extraction
          </label>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: '32px' }}>
        <h3 className="settings-section-title">Cookie Syncing for Restricted Content</h3>
        <p className="settings-description" style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Some age-restricted or private media needs browser cookies from an account where you are logged in.
        </p>

        {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select Browser to Sync From
            </label>
            <select
              value={cookieInfo.preferred_browser || 'edge'}
              onChange={e => handleBrowserChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                marginBottom: '16px'
              }}
            >
              {cookieInfo.supported_browsers.map(b => (
                <option key={b} value={b}>{b.toUpperCase()}</option>
              ))}
            </select>

            <button 
              onClick={handleSyncCookies} 
              disabled={syncing}
              className={`settings-btn ${syncing ? 'loading' : ''}`}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '500',
                cursor: syncing ? 'not-allowed' : 'pointer'
              }}
            >
              {syncing ? 'Syncing Cookies...' : 'Sync Browser Cookies'}
            </button>

            {syncStatus.message && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)',
                backgroundColor: syncStatus.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: syncStatus.success ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                color: syncStatus.success ? '#22c55e' : '#ef4444',
                fontSize: '0.85rem'
              }}>
                {syncStatus.message}
              </div>
            )}

            {cookieInfo.cookie_file && (
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Active cookie file: <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{cookieInfo.cookie_file}</code>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
              ☁️ Cloud Deployment Mode
            </p>
            Automatic browser cookie syncing is only supported when running Volia on your local machine.
            <br /><br />
            To download age-restricted, private, or rate-limited media in production:
            <ol style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>Export your cookies in Netscape format (using browser extensions like <i>Get cookies.txt LOCALLY</i>).</li>
              <li>Save the file as <code>cookies.txt</code>.</li>
              <li>Place it inside the <code>volia-backend/</code> directory and redeploy to Railway.</li>
            </ol>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={handleSave} className="settings-btn primary" style={{ width: 'auto' }}>
          Save Settings
        </button>
        {saved && <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>Settings saved</span>}
      </div>
    </div>
  );
}
