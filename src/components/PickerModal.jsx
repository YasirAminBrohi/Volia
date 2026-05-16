import { triggerDownload } from '../cobalt';

const TYPE_ICONS = {
  video: '🎬',
  photo: '📸',
  gif: '🎞️',
};

export default function PickerModal({ data, onClose }) {
  if (!data || !data.picker || data.picker.length === 0) return null;

  async function handleDownloadItem(item) {
    try {
      await triggerDownload(item.url, null, 'tunnel');
    } catch (e) {
      console.error(e);
    }
  }

  function handleDownloadAll() {
    data.picker.forEach((item, i) => {
      setTimeout(async () => {
        try {
          await triggerDownload(item.url, null, 'tunnel');
        } catch (e) { console.error(e); }
      }, i * 500); // stagger downloads to avoid browser blocking
    });
    if (data.audio) {
      setTimeout(async () => {
        try {
          await triggerDownload(data.audio, data.audioFilename || 'audio', 'tunnel');
        } catch (e) { console.error(e); }
      }, data.picker.length * 500);
    }
  }

  async function handleDownloadAudio() {
    if (data.audio) {
      try {
        await triggerDownload(data.audio, data.audioFilename || 'audio', 'tunnel');
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="picker-overlay" onClick={onClose} id="picker-overlay">
      <div className="picker-modal animate-slide" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3>📦 Multiple Items Found ({data.picker.length})</h3>
          <button className="picker-close" onClick={onClose} id="picker-close">✕</button>
        </div>

        <p className="picker-desc">
          This post contains multiple items. Download them individually or all at once.
        </p>

        <div className="picker-grid">
          {data.picker.map((item, i) => (
            <div
              key={i}
              className="picker-item"
              onClick={() => handleDownloadItem(item)}
              id={`picker-item-${i}`}
            >
              {item.thumb ? (
                <img src={item.thumb} alt={`Item ${i + 1}`} className="picker-thumb" loading="lazy" />
              ) : (
                <div className="picker-thumb-placeholder">
                  {TYPE_ICONS[item.type] || '📁'}
                </div>
              )}
              <div className="picker-item-info">
                <span className="picker-type-badge">
                  {TYPE_ICONS[item.type] || '📁'} {item.type || 'file'}
                </span>
                <span className="picker-item-num">#{i + 1}</span>
              </div>
              <div className="picker-item-dl">⬇️</div>
            </div>
          ))}
        </div>

        <div className="picker-actions">
          <button
            className="download-action-btn"
            onClick={handleDownloadAll}
            id="download-all-btn"
          >
            ⬇️ Download All ({data.picker.length} items)
          </button>

          {data.audio && (
            <button
              className="picker-audio-btn"
              onClick={handleDownloadAudio}
              id="download-audio-btn"
            >
              🎵 Download Audio Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
