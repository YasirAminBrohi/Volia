import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../utils/api';

const platformLabels = {
  youtube: 'YT',
  twitter: 'X',
  facebook: 'FB',
  instagram: 'IG',
  spotify: 'SP',
  tiktok: 'TT',
  reddit: 'RD',
  soundcloud: 'SC',
  vimeo: 'VM',
  twitch: 'TW',
};

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getHistory();
        setHistory(data.history || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  async function handleClear() {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }

  return (
    <div className="history-panel animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Download History</h3>
        {history.length > 0 && (
          <button className="history-clear-btn" onClick={handleClear} id="clear-history">
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading history...</p>
      ) : history.length === 0 ? (
        <div className="history-empty">
          <p>No downloads yet. Volia will list your completed files here.</p>
          <p style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--text-muted)' }}>
            History is stored on the local backend.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, i) => (
            <div key={i} className="history-item">
              <span className="h-platform">{platformLabels[item.platform] || 'DL'}</span>
              <div className="h-info">
                <span className="h-filename" title={item.filename}>{item.filename}</span>
                <span className="h-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
