import { useState, useEffect, useRef } from 'react';
import { getCobaltSettings, saveCobaltSettings } from '../cobalt';
import { parseCookiesTxt, toCobaltCookiesJson } from '../utils/cookieParser';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({ url: '', apiKey: '' });
  const [saved, setSaved] = useState(false);
  
  // Cookies state
  const [cookieStatus, setCookieStatus] = useState('idle'); // idle, uploading, success, error
  const [cookieError, setCookieError] = useState('');
  const [lastUploaded, setLastUploaded] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSettings(getCobaltSettings());
    const savedTime = localStorage.getItem('volia_cookie_uploaded');
    if (savedTime) setLastUploaded(savedTime);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    saveCobaltSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCookieStatus('uploading');
    setCookieError('');

    try {
      const text = await file.text();
      const parsed = parseCookiesTxt(text);
      
      if (parsed.length === 0) {
        throw new Error('No YouTube cookies found in this file. Make sure you are logged into YouTube and using the correct extension.');
      }

      const payload = toCobaltCookiesJson(parsed);

      const res = await fetch('/api/update-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: payload })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update cookies');
      }

      setCookieStatus('success');
      const now = new Date().toISOString();
      setLastUploaded(now);
      localStorage.setItem('volia_cookie_uploaded', now);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setCookieStatus('error');
      setCookieError(err.message);
    }
  }

  function getCookieAgeWarning() {
    if (!lastUploaded) return null;
    const daysOld = (new Date() - new Date(lastUploaded)) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) {
      return <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>⚠️ Cookies may be expired. Please re-upload.</span>;
    }
    return null;
  }

  return (
    <div className="settings-panel animate-fade">
      <h2 className="settings-title">⚙️ Settings</h2>

      <div className="settings-section">
        <h3 className="settings-section-title">🔌 Cobalt API Configuration</h3>
        <p className="settings-description">
          By default, Volia uses a private Cobalt instance. If you are experiencing errors or want to use your own, 
          you can configure a custom self-hosted Cobalt instance URL or provide an API key.
        </p>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Instance URL
            </label>
            <input
              type="url"
              value={settings.url}
              onChange={e => setSettings({ ...settings, url: e.target.value })}
              placeholder={import.meta.env.VITE_COBALT_API || "https://cobalt-xyz.up.railway.app"}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              API Key (Optional)
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="Enter your Api-Key here"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="submit" className="settings-btn primary" style={{ width: 'auto' }}>
              💾 Save Settings
            </button>
            {saved && <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>✅ Saved successfully</span>}
          </div>
        </form>
      </div>

      <div className="settings-section" style={{ marginTop: '32px' }}>
        <h3 className="settings-section-title">🍪 YouTube Cookie Manager</h3>
        <p className="settings-description">
          To download age-restricted or premium YouTube videos, you need to provide your YouTube cookies. 
          Install the <a href="https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Get cookies.txt LOCALLY</a> extension, 
          visit youtube.com while logged in, click the extension and export <code>cookies.txt</code>.
        </p>

        <div style={{ background: 'var(--bg-glass)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Status: </span>
            {lastUploaded ? (
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                Cookies active (Uploaded {new Date(lastUploaded).toLocaleDateString()})
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No cookies uploaded</span>
            )}
            {getCookieAgeWarning()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="file" 
              accept=".txt" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="cookie-upload"
            />
            
            <button 
              className="settings-btn primary" 
              onClick={() => document.getElementById('cookie-upload').click()}
              disabled={cookieStatus === 'uploading'}
              style={{ width: 'auto', alignSelf: 'flex-start' }}
            >
              {cookieStatus === 'uploading' ? '⏳ Pushing to Cobalt...' : '📤 Upload cookies.txt'}
            </button>

            {cookieStatus === 'success' && (
              <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '4px', color: '#22c55e', fontSize: '0.85rem' }}>
                ✅ Cookies uploaded! Cobalt is restarting (takes ~30 seconds)
              </div>
            )}

            {cookieStatus === 'error' && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '0.85rem' }}>
                ❌ Error: {cookieError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
