import { useState, useEffect } from 'react';
import { getCookieSettings, setCookieBrowser, syncCookies, getStoredCookies, saveStoredCookies, clearStoredCookies, analyzeCookiesLocally } from '../utils/api';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({ 
    theme: localStorage.getItem('volia_theme') || 'dark',
    autoDownload: localStorage.getItem('volia_auto_download') === 'true'
  });
  const [saved, setSaved] = useState(false);

  // Cookie/Browser settings state (for localhost only)
  const [cookieInfo, setCookieInfo] = useState({
    preferred_browser: 'edge',
    cookie_file: null,
    supported_browsers: ['edge', 'chrome', 'firefox', 'brave', 'opera', 'chromium']
  });
  const [syncStatus, setSyncStatus] = useState({ success: null, message: '' });
  const [syncing, setSyncing] = useState(false);

  // Custom user cookies upload state (client-side localStorage)
  const [customCookies, setCustomCookies] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ success: null, message: '' });
  const [cookieAnalysis, setCookieAnalysis] = useState(null);
  const [hasSavedCookies, setHasSavedCookies] = useState(false);

  // Load existing cookies from localStorage on mount
  useEffect(() => {
    const existing = getStoredCookies();
    if (existing) {
      setHasSavedCookies(true);
      const analysis = analyzeCookiesLocally(existing);
      setCookieAnalysis(analysis);
    }
  }, []);

  // Load server-side cookie settings (for localhost browser sync)
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
        setCookieInfo(prev => ({ ...prev, cookie_file: res.cookie_file, cookie_analysis: res.cookie_analysis }));
      } else {
        setSyncStatus({ success: false, message: res.message || 'Sync failed.' });
      }
    } catch (err) {
      setSyncStatus({ success: false, message: err.message || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomCookies(event.target.result);
      setUploadStatus({ success: null, message: `Loaded file: ${file.name}` });
    };
    reader.readAsText(file);
  }

  function handleUploadCookies() {
    if (!customCookies || !customCookies.trim()) {
      setUploadStatus({ success: false, message: 'Please upload a cookies.txt file or paste cookie content.' });
      return;
    }

    // Analyze cookies client-side
    const analysis = analyzeCookiesLocally(customCookies);
    if (analysis.num_cookies === 0) {
      setUploadStatus({ success: false, message: 'No valid Netscape-format cookies found in the input. Make sure the file uses tab-separated fields.' });
      return;
    }

    // Save to localStorage — instant, no server call needed
    saveStoredCookies(customCookies);
    setCookieAnalysis(analysis);
    setHasSavedCookies(true);
    setUploadStatus({ success: true, message: `✅ ${analysis.message}. Cookies saved to your browser and will be sent with every download request.` });
    setCustomCookies(''); // clear textarea after save
  }

  function handleDeleteCookies() {
    clearStoredCookies();
    setCookieAnalysis(null);
    setHasSavedCookies(false);
    setUploadStatus({ success: true, message: 'Custom cookies cleared from your browser.' });
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

      {/* Browser Cookie Sync — localhost only */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div className="settings-section" style={{ marginTop: '32px' }}>
          <h3 className="settings-section-title">Browser Cookie Sync (Local Only)</h3>
          <p className="settings-description" style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sync cookies directly from a browser on this machine. Only available when running locally.
          </p>

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
        </div>
      )}

      {/* Custom Cookies Upload — works everywhere, stored in user's browser */}
      <div className="settings-section" style={{ marginTop: '32px' }}>
        <h3 className="settings-section-title">Upload Custom Cookies.txt</h3>
        <p className="settings-description" style={{ marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Upload or paste a Netscape-format <code>cookies.txt</code> file to authorize your download requests (useful for age-restricted or private content).
        </p>
        <p className="settings-description" style={{ marginBottom: '12px', fontSize: '0.8rem', color: 'var(--accent-purple)' }}>
          🔒 Cookies are stored privately in <strong>your browser only</strong> and are never shared with other users.
        </p>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              border: '1px dashed var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                📁 Click or drag standard cookies.txt file to upload
              </span>
            </div>

            <textarea
              placeholder={"# Netscape HTTP Cookie File\n# This file was generated by cookies exporter..."}
              value={customCookies}
              onChange={e => setCustomCookies(e.target.value)}
              rows="6"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={handleUploadCookies}
                className="settings-btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Cookies
              </button>

              {hasSavedCookies && (
                <button
                  onClick={handleDeleteCookies}
                  className="settings-btn"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Clear Cookies
                </button>
              )}
            </div>

            {uploadStatus.message && (
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: uploadStatus.success === true ? 'rgba(34, 197, 94, 0.1)' : uploadStatus.success === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                border: uploadStatus.success === true ? '1px solid rgba(34, 197, 94, 0.2)' : uploadStatus.success === false ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                color: uploadStatus.success === true ? '#22c55e' : uploadStatus.success === false ? '#ef4444' : '#6366f1',
                fontSize: '0.85rem'
              }}>
                {uploadStatus.message}
              </div>
            )}

            {/* Cookie diagnostics panel */}
            {cookieAnalysis && cookieAnalysis.exists && (
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontWeight: '500', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📊 Cookie Diagnostics:
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Cookies:</span>
                  <span>{cookieAnalysis.num_cookies}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>YouTube Cookies:</span>
                  <span style={{ 
                    color: cookieAnalysis.youtube_cookies_count > 0 ? '#22c55e' : '#ef4444',
                    fontWeight: cookieAnalysis.youtube_cookies_count > 0 ? '500' : 'normal'
                  }}>
                    {cookieAnalysis.youtube_cookies_count}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Google Cookies:</span>
                  <span style={{ 
                    color: cookieAnalysis.google_cookies_count > 0 ? '#22c55e' : '#ef4444',
                    fontWeight: cookieAnalysis.google_cookies_count > 0 ? '500' : 'normal'
                  }}>
                    {cookieAnalysis.google_cookies_count}
                  </span>
                </div>
                {cookieAnalysis.youtube_cookies_count === 0 && (
                  <div style={{ 
                    marginTop: '4px', 
                    color: '#f59e0b', 
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '6px',
                    lineHeight: '1.4'
                  }}>
                    ⚠️ <strong>Warning:</strong> No YouTube session cookies found. yt-dlp might fail to authenticate. Please make sure you are logged in to YouTube in the browser you exported cookies from.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
