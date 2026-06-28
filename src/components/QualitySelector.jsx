const DOWNLOAD_MODES = [
  { value: 'auto', icon: '🎬', label: 'Video + Audio' },
  { value: 'audio', icon: '🎵', label: 'Audio Only' },
  { value: 'mute', icon: '🔇', label: 'Video Only' },
];

export default function QualitySelector({ options, onChange, formats, isLoading }) {
  function update(key, value) {
    if (key === 'downloadMode') {
      onChange({ ...options, downloadMode: value, selectedFormat: '' });
    } else {
      onChange({ ...options, [key]: value });
    }
  }

  const filteredFormats = (formats || []).filter(f => {
    if (options.downloadMode === 'audio') {
      return f.has_audio && !f.has_video;
    }

    if (options.downloadMode === 'mute') {
      return f.has_video && !f.has_audio;
    }

    return f.has_video && f.has_audio;
  });

  const autoLabel = options.downloadMode === 'audio'
    ? 'Auto Select (MP3 Audio)'
    : options.downloadMode === 'mute'
      ? 'Auto Select (Best Video)'
      : 'Auto Select (Best Video + Audio)';

  return (
    <div className="quality-section animate-fade">
      <p className="section-label">Download Mode</p>
      <div className="quality-mode-grid">
        {DOWNLOAD_MODES.map(m => (
          <button
            key={m.value}
            className={`quality-mode-btn ${options.downloadMode === m.value ? 'active' : ''}`}
            onClick={() => update('downloadMode', m.value)}
            id={`mode-${m.value}`}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
          </button>
        ))}
      </div>

      {isLoading && filteredFormats.length === 0 ? (
        <div style={{ marginTop: '24px' }}>
          <p className="section-label">Resolution / Format</p>
          <div style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxSizing: 'border-box'
          }}>
            <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
            Fetching available formats...
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '24px' }}>
          <p className="section-label">Resolution / Format</p>
          <select
            value={options.selectedFormat || ''}
            onChange={e => update('selectedFormat', e.target.value)}
            disabled={filteredFormats.length === 0}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: filteredFormats.length === 0 ? 'not-allowed' : 'pointer',
              opacity: filteredFormats.length === 0 ? 0.7 : 1,
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
          >
            <option value="">{autoLabel}</option>
            {filteredFormats.map(f => (
              <option key={f.format_id} value={f.format_id}>
                {f.label || `${f.resolution || 'Unknown'} (${f.extension})`}
              </option>
            ))}
          </select>
          {options.selectedFormat && (
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎯</span> Downloading the exact selected format.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
