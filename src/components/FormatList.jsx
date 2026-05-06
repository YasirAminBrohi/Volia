import { useState, useMemo } from 'react';

function formatBytes(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

function getQualityBadge(format) {
  if (!format.has_video && format.has_audio) return '♪ Audio';
  if (format.resolution) {
    const h = format.resolution.split('x')[1];
    if (h) return `${h}p`;
  }
  return format.extension.toUpperCase();
}

export default function FormatList({ formats, selected, onSelect }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!formats) return [];
    if (filter === 'video') return formats.filter(f => f.has_video && f.has_audio);
    if (filter === 'videoonly') return formats.filter(f => f.has_video && !f.has_audio);
    if (filter === 'audio') return formats.filter(f => !f.has_video && f.has_audio);
    return formats;
  }, [formats, filter]);

  if (!formats || formats.length === 0) return null;

  const hasVideoAudio = formats.some(f => f.has_video && f.has_audio);
  const hasVideoOnly = formats.some(f => f.has_video && !f.has_audio);
  const hasAudioOnly = formats.some(f => !f.has_video && f.has_audio);

  return (
    <div className="formats-section animate-fade">
      <div className="formats-header">
        <h3>📦 Available Formats ({formats.length})</h3>
        <div className="formats-tabs">
          <button className={`format-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {hasVideoAudio && <button className={`format-tab ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>Video+Audio</button>}
          {hasVideoOnly && <button className={`format-tab ${filter === 'videoonly' ? 'active' : ''}`} onClick={() => setFilter('videoonly')}>Video</button>}
          {hasAudioOnly && <button className={`format-tab ${filter === 'audio' ? 'active' : ''}`} onClick={() => setFilter('audio')}>Audio</button>}
        </div>
      </div>
      <div className="formats-list">
        {filtered.map((f) => {
          const size = f.filesize || f.filesize_approx;
          return (
            <div
              key={f.format_id}
              className={`format-item ${selected === f.format_id ? 'selected' : ''}`}
              onClick={() => onSelect(f.format_id)}
              id={`format-${f.format_id}`}
            >
              <div className="format-left">
                <span className="format-type-icon">
                  {f.has_video ? '🎬' : '🎵'}
                </span>
                <span className="format-quality-badge">{getQualityBadge(f)}</span>
                <span className="format-label">{f.label}</span>
              </div>
              {size > 0 && <span className="format-size">~{formatBytes(size)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
