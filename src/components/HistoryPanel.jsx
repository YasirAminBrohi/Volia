import { useState, useEffect } from 'react';
import { fetchHistory, clearHistory } from '../api';

const platformIcons = {
  youtube: '🎬',
  twitter: '𝕏',
  facebook: '📘',
  instagram: '📸',
};

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      await clearHistory();
      setHistory([]);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="history-panel animate-fade">
        <h3>📋 Download History</h3>
        <div className="loading-overlay" style={{ padding: '30px 0' }}>
          <div className="spinner spinner-lg spinner-purple"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
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
