const TYPE_LABELS = {
  video: 'Video',
  photo: 'Image',
  gif: 'GIF',
};

export default function PickerModal({ data, onClose }) {
  if (!data || !data.picker || data.picker.length === 0) return null;

  async function handleDownloadItem(item) {
    try {
      window.open(item.url, '_blank');
    } catch (e) {
      console.error(e);
    }
  }

  function handleDownloadAll() {
    data.picker.forEach((item, i) => {
      setTimeout(async () => {
        try {
          window.open(item.url, '_blank');
        } catch (e) { console.error(e); }
      }, i * 500);
    });
    if (data.audio) {
      setTimeout(async () => {
        try {
          window.open(data.audio, '_blank');
        } catch (e) { console.error(e); }
      }, data.picker.length * 500);
    }
  }

  async function handleDownloadAudio() {
    if (data.audio) {
      try {
        window.open(data.audio, '_blank');
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="picker-overlay" onClick={onClose} id="picker-overlay">
      <div className="picker-modal animate-slide" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3>Multiple Items Found ({data.picker.length})</h3>
          <button className="picker-close" onClick={onClose} id="picker-close">Close</button>
        </div>

        <p className="picker-desc">
          Volia found several files in this post. Choose individual items or download the full set.
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
                  {TYPE_LABELS[item.type] || 'File'}
                </div>
              )}
              <div className="picker-item-info">
                <span className="picker-type-badge">
                  {TYPE_LABELS[item.type] || item.type || 'File'}
                </span>
                <span className="picker-item-num">#{i + 1}</span>
              </div>
              <div className="picker-item-dl">Download</div>
            </div>
          ))}
        </div>

        <div className="picker-actions">
          <button
            className="download-action-btn"
            onClick={handleDownloadAll}
            id="download-all-btn"
          >
            Download All ({data.picker.length} items)
          </button>

          {data.audio && (
            <button
              className="picker-audio-btn"
              onClick={handleDownloadAudio}
              id="download-audio-btn"
            >
              Download Audio Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
