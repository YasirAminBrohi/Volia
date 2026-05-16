import { useState } from 'react';

const VIDEO_QUALITIES = [
  { value: 'max', label: 'Max', desc: 'Best available' },
  { value: '2160', label: '4K', desc: '2160p' },
  { value: '1440', label: '2K', desc: '1440p' },
  { value: '1080', label: '1080p', desc: 'Full HD' },
  { value: '720', label: '720p', desc: 'HD' },
  { value: '480', label: '480p', desc: 'SD' },
  { value: '360', label: '360p', desc: 'Low' },
];

const DOWNLOAD_MODES = [
  { value: 'auto', icon: '🎬', label: 'Video + Audio' },
  { value: 'audio', icon: '🎵', label: 'Audio Only' },
  { value: 'mute', icon: '🔇', label: 'Video Only' },
];

const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3' },
  { value: 'best', label: 'Best' },
  { value: 'ogg', label: 'OGG' },
  { value: 'wav', label: 'WAV' },
  { value: 'opus', label: 'OPUS' },
];

export default function QualitySelector({ options, onChange }) {
  const [expanded, setExpanded] = useState(false);

  function update(key, value) {
    onChange({ ...options, [key]: value });
  }

  return (
    <div className="quality-section animate-fade">
      {/* Download Mode */}
      <p className="section-label">Download Mode</p>
      <div className="quality-mode-grid">
        {DOWNLOAD_MODES.map(m => (
          <button
            key={m.value}
            className={`quality-mode-btn ${options.downloadMode === m.value ? 'active' : ''}`}
            onClick={() => update('downloadMode', m.value)}
            id={`mode-${m.value}`}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Video Quality - only when not audio-only */}
      {options.downloadMode !== 'audio' && (
        <>
          <p className="section-label">Video Quality</p>
          <div className="quality-pills">
            {VIDEO_QUALITIES.map(q => (
              <button
                key={q.value}
                className={`quality-pill ${options.videoQuality === q.value ? 'active' : ''}`}
                onClick={() => update('videoQuality', q.value)}
                title={q.desc}
                id={`quality-${q.value}`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Audio Format - toggle expand */}
      {options.downloadMode === 'audio' && (
        <>
          <p className="section-label">Audio Format</p>
          <div className="quality-pills">
            {AUDIO_FORMATS.map(f => (
              <button
                key={f.value}
                className={`quality-pill ${options.audioFormat === f.value ? 'active' : ''}`}
                onClick={() => update('audioFormat', f.value)}
                id={`audio-${f.value}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Advanced toggle */}
      {options.downloadMode !== 'audio' && (
        <button
          className="quality-advanced-toggle"
          onClick={() => setExpanded(!expanded)}
          id="advanced-toggle"
        >
          {expanded ? '▲ Less options' : '▼ More options'}
        </button>
      )}

      {expanded && options.downloadMode !== 'audio' && (
        <div className="quality-advanced animate-fade">
          <p className="section-label">Audio Format</p>
          <div className="quality-pills">
            {AUDIO_FORMATS.map(f => (
              <button
                key={f.value}
                className={`quality-pill ${options.audioFormat === f.value ? 'active' : ''}`}
                onClick={() => update('audioFormat', f.value)}
                id={`audio-adv-${f.value}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
