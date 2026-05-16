import { useState, useEffect } from 'react';

const PLATFORM_MAP = {
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

function detectFromUrl(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  if (/instagram\.com/i.test(url)) return 'instagram';
  return null;
}

export default function UrlInput({ platform, onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [detected, setDetected] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const d = detectFromUrl(url);
    setDetected(d);
  }, [url]);

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim() && !loading) {
      onSubmit(url.trim(), detected || platform);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setUrl(text);
    }
  }

  function handlePaste(e) {
    // Allow native paste, just track
    setTimeout(() => {
      const val = e.target.value;
      setUrl(val);
    }, 0);
  }

  return (
    <div className={`url-section ${dragOver ? 'drop-zone-active' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div
          className="url-input-wrapper"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="input-icon">🔗</div>
          <input
            type="text"
            className="url-input"
            placeholder={dragOver ? "Drop your URL here..." : "Paste video or media URL here... (or drag & drop)"}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onPaste={handlePaste}
            disabled={loading}
            id="url-input"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="url-submit-btn"
            disabled={!url.trim() || loading}
            id="fetch-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>⬇️ Download</>
            )}
          </button>
        </div>
      </form>
      {detected && !loading && (
        <div className="detected-badge">
          ✨ Auto-detected: <strong>{PLATFORM_MAP[detected] || detected}</strong>
        </div>
      )}
    </div>
  );
}
