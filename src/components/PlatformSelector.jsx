const PLATFORMS = {
  youtube: { icon: '🎬', name: 'YouTube', desc: 'Videos, Shorts & Audio', accent: 'rgba(255,0,0,0.12)' },
  twitter: { icon: '𝕏', name: 'X (Twitter)', desc: 'Videos & Images', accent: 'rgba(29,161,242,0.12)' },
  facebook: { icon: '📘', name: 'Facebook', desc: 'Videos & Reels', accent: 'rgba(24,119,242,0.12)' },
  instagram: { icon: '📸', name: 'Instagram', desc: 'Posts, Reels & Stories', accent: 'rgba(228,64,95,0.12)' },
};

export default function PlatformSelector({ selected, onSelect }) {
  return (
    <div className="platform-section animate-fade">
      <p className="section-label">Select a Platform</p>
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
