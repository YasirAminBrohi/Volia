import { useState, useEffect } from 'react';

const PLATFORM_MAP = {
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  spotify: 'Spotify',
};

function detectFromUrl(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/spotify\.com/i.test(url)) return 'spotify';
  return null;
}

export default function UrlInput({ url, setUrl, platform, onSubmit, loading, isAnalyzing, isImageLink, downloadDisabled = false }) {
  const [detected, setDetected] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const d = detectFromUrl(url);
    setDetected(d);
  }, [url]);

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim() && !loading && !downloadDisabled) {
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
    setTimeout(() => {
      setUrl(e.target.value);
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
          <div className="input-icon">{isImageLink ? 'IMG' : 'URL'}</div>
          <input
            type="text"
            className="url-input"
            placeholder={dragOver ? 'Drop your link here' : 'Paste a media link and let Volia prepare it'}
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
            disabled={!url.trim() || loading || downloadDisabled}
            id="fetch-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Working...
              </>
            ) : downloadDisabled ? (
              <>Preparing Formats...</>
            ) : isImageLink ? (
              <>Download Images</>
            ) : (
              <>Start Download</>
            )}
          </button>
        </div>
      </form>
      {detected && !loading && (
        <div className="detected-badge">
          Auto-detected: <strong>{PLATFORM_MAP[detected] || detected}</strong>
          {isImageLink && <span className="image-badge">Image post</span>}
          {isAnalyzing && <span className="analyzing-badge">Analyzing...</span>}
        </div>
      )}
    </div>
  );
}
