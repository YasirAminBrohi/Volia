import { useState, useEffect } from 'react';
import { getHistory, clearAllHistory } from '../cobalt';

const platformIcons = {
  youtube: '🎬',
  twitter: '𝕏',
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
  reddit: '📱',
  soundcloud: '🔊',
  vimeo: '🎥',
  twitch: '🟣',
};

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleClear() {
    clearAllHistory();
    setHistory([]);
  }

  return (
    <div className="history-panel animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>📋 Download History</h3>
        {history.length > 0 && (
          <button className="history-clear-btn" onClick={handleClear} id="clear-history">
            🗑️ Clear All
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="history-empty">
          <p>📭 No downloads yet. Your download history will appear here.</p>
          <p style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--text-muted)' }}>
            History is stored locally in your browser.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, i) => (
            <div key={i} className="history-item">
              <span className="h-platform">{platformIcons[item.platform] || '📁'}</span>
              <span className="h-filename" title={item.filename}>{item.filename}</span>
              <span className="h-date">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
