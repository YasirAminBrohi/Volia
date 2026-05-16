import { useState, useEffect } from 'react';
import { getCobaltSettings, saveCobaltSettings } from '../cobalt';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({ url: '', apiKey: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getCobaltSettings());
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    saveCobaltSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    </div>
  );
}
