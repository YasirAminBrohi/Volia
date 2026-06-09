const PLATFORMS = {
  youtube: { icon: 'YT', name: 'YouTube', desc: 'Videos, shorts, and audio', accent: 'rgba(255,0,0,0.12)' },
  twitter: { icon: 'X', name: 'X / Twitter', desc: 'Posts, clips, and media', accent: 'rgba(29,161,242,0.12)' },
  facebook: { icon: 'FB', name: 'Facebook', desc: 'Videos, reels, and posts', accent: 'rgba(24,119,242,0.12)' },
  instagram: { icon: 'IG', name: 'Instagram', desc: 'Posts, reels, and stories', accent: 'rgba(228,64,95,0.12)' },
  spotify: { icon: 'SP', name: 'Spotify', desc: 'Tracks, albums, and playlists', accent: 'rgba(30,215,96,0.12)' },
};

export default function PlatformSelector({ selected, onSelect }) {
  return (
    <div className="platform-section animate-fade">
      <p className="section-label">Choose your source</p>
      <div className="platform-grid">
        {Object.entries(PLATFORMS).map(([key, p]) => (
          <div
            key={key}
            className={`platform-card ${selected === key ? 'selected' : ''}`}
            style={{ '--card-accent': p.accent }}
            onClick={() => onSelect(selected === key ? null : key)}
            id={`platform-${key}`}
          >
            <div className="p-icon">{p.icon}</div>
            <div className="p-name">{p.name}</div>
            <div className="p-desc">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
