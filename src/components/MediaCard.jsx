function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const platformColors = {
  youtube: { bg: 'rgba(255,0,0,0.15)', color: '#ff4444' },
  twitter: { bg: 'rgba(29,161,242,0.15)', color: '#1DA1F2' },
  facebook: { bg: 'rgba(24,119,242,0.15)', color: '#1877F2' },
  instagram: { bg: 'rgba(228,64,95,0.15)', color: '#E4405F' },
};

export default function MediaCard({ media }) {
  if (!media) return null;

  const duration = formatDuration(media.duration);
  const pColor = platformColors[media.platform] || { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' };

  return (
    <div className="media-card animate-slide">
      {media.thumbnail && (
        <div className="media-thumbnail">
          <img src={media.thumbnail} alt={media.title} loading="lazy" />
          {duration && <span className="media-duration">{duration}</span>}
        </div>
      )}
      <div className="media-info-body">
        <h2 className="media-title">{media.title}</h2>
        <div className="media-uploader">
          {media.uploader && <span>👤 {media.uploader}</span>}
          <span
            className="media-platform-tag"
            style={{ background: pColor.bg, color: pColor.color }}
          >
            {media.platform}
          </span>
        </div>
      </div>
    </div>
  );
}
