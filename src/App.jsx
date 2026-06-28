import { useState, useCallback, useEffect } from 'react';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import PlatformSelector from './components/PlatformSelector';
import UrlInput from './components/UrlInput';
import QualitySelector from './components/QualitySelector';
import PickerModal from './components/PickerModal';
import HistoryPanel from './components/HistoryPanel';
import AboutSection from './components/AboutSection';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import DownloadProgress from './components/DownloadProgress';
import { extractInfo, startDownload, getDownloadUrl } from './utils/api';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('home');
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [pickerData, setPickerData] = useState(null);
  const [qualityOptions, setQualityOptions] = useState({
    videoQuality: '1080',
    downloadMode: 'auto',
    audioFormat: 'mp3',
    selectedFormat: '',
  });

  // URL input and background type detection state
  const [url, setUrl] = useState('');
  const [isImageLink, setIsImageLink] = useState(false);
  const [cachedInfo, setCachedInfo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reset image detection immediately when URL is modified
  useEffect(() => {
    setIsImageLink(false);
    setCachedInfo(null);
    setQualityOptions(prev => ({ ...prev, selectedFormat: '' }));
  }, [url]);

  // Debounced background extraction to detect if URL is for images or video
  useEffect(() => {
    if (!url.trim()) {
      setIsImageLink(false);
      setCachedInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      const trimmedUrl = url.trim();
      const isSocial = /instagram\.com|twitter\.com|x\.com|facebook\.com|youtu|spotify\.com/i.test(trimmedUrl);
      if (!isSocial) return;

      setIsAnalyzing(true);
      try {
        const info = await extractInfo(trimmedUrl, platform);
        setCachedInfo(info);
        setIsImageLink(!!info.is_image);
      } catch (err) {
        console.error("Background extraction failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [url, platform]);
  const [progress, setProgress] = useState({
    status: 'idle',
    percent: '0%',
    speed: '',
    eta: '',
    filename: '',
    message: ''
  });

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function handleNavigate(view) {
    setCurrentView(view);
  }

  function resetState() {
    setError(null);
    setPickerData(null);
    setProgress({ status: 'idle', percent: '0%', speed: '', eta: '', filename: '', message: '' });
  }

  async function handleDownload(downloadUrl) {
    resetState();
    setLoading(true);

    try {
      let info = cachedInfo;
      if (!info || info.url !== downloadUrl) {
        addToast('info', 'Extracting media information...');
        info = await extractInfo(downloadUrl, platform);
      }
      
      const bestFormat = findBestFormat(info.formats, qualityOptions.videoQuality, qualityOptions.downloadMode);
      
      if (!bestFormat) {
        // Soft warning — the backend SSE endpoint handles format selection
        // independently via get_format_for_url, so we can still proceed
        addToast('info', 'Exact quality not available, downloading best available quality.');
      }

      addToast('info', `Preparing download: ${info.title}`);
      
      // Map qualityOptions to parameters expected by the backend
      let mode = 'both';
      if (qualityOptions.downloadMode === 'audio') {
        mode = 'audio';
      } else if (qualityOptions.downloadMode === 'mute') {
        mode = 'video';
      }

      // Map format (only relevant for audio mode)
      const audioFormat = qualityOptions.audioFormat || 'mp3';
      const format = mode === 'audio' ? audioFormat : null;

      // Map quality (only relevant for video/both mode)
      let quality = qualityOptions.videoQuality;
      if (quality !== 'max') {
        if (quality === '2160') {
          quality = '4k';
        } else if (quality === '1440') {
          quality = '2k';
        } else if (quality && !quality.endsWith('p')) {
          quality = quality + 'p';
        }
      }

      // Use Server-Sent Events for real-time progress
      let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      backendUrl = backendUrl.trim();
      if (backendUrl && !backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
        backendUrl = `https://${backendUrl}`;
      }
      
      let selectedFormat = qualityOptions.selectedFormat;
      if (!selectedFormat) {
        if (info.platform === 'spotify') {
          const hasAllSongs = info.formats?.some(f => f.format_id === 'all_songs');
          selectedFormat = hasAllSongs ? 'all_songs' : 'mp3';
        } else if (info.is_image) {
          // If it's an image post, check if there's an all_images format (ZIP)
          const hasAllImages = info.formats?.some(f => f.format_id === 'all_images');
          selectedFormat = hasAllImages ? 'all_images' : 'image_0';
        } else {
          if (qualityOptions.downloadMode === 'audio') {
            selectedFormat = format;
          } else {
            // Let the backend choose the closest available YouTube format for
            // normal quality downloads. Exact yt-dlp format IDs can disappear
            // between extraction and download, so only send one when the user
            // explicitly selected it from the format dropdown.
            selectedFormat = null;
          }
        }
      }

      const params = new URLSearchParams({
        url: url,
        mode: mode,
      });
      if (selectedFormat) {
        params.append('format', selectedFormat);
      }
      if (quality) params.append('quality', quality);

      const eventSourceUrl = `${backendUrl}/api/download-progress?${params.toString()}`;
      
      setProgress({
        status: 'starting',
        percent: '0%',
        speed: '',
        eta: '',
        filename: info.title,
        message: ''
      });

      const eventSource = new EventSource(eventSourceUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(prev => ({
            ...prev,
            ...data
          }));

          if (data.status === 'complete') {
            eventSource.close();
            setLoading(false);
            addToast('success', `Download complete: ${info.title}`);
            
            if (data.filename) {
              const fileUrl = `${backendUrl}/api/download-file/${encodeURIComponent(data.filename)}`;
              setProgress(prev => ({
                ...prev,
                ...data,
                percent: '100%',
                downloadUrl: fileUrl
              }));
              
              // Fetch the file as a blob to bypass cross-origin browser download restrictions
              fetch(fileUrl)
                .then(response => {
                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                  return response.blob();
                })
                .then(blob => {
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = data.filename;
                  a.style.display = 'none';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(blobUrl);
                })
                .catch(err => {
                  console.error('Error fetching file as blob:', err);
                  // Fallback: Try opening in a new tab if blob fetch fails
                  window.open(fileUrl, '_blank');
                });
            }
          }

          if (data.status === 'error') {
            eventSource.close();
            setLoading(false);
            setError(data.message || 'Download failed');
            addToast('error', data.message || 'Download failed');
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource.close();
        setLoading(false);
        setProgress(prev => ({ ...prev, status: 'error', message: 'Connection lost' }));
        addToast('error', 'Connection to download server lost');
      };

    } catch (err) {
      const msg = err.message || 'Download failed. Please try again.';
      setError(msg);
      addToast('error', msg);
      setLoading(false);
    }
  }

  function findBestFormat(formats, quality, mode) {
    if (!formats || formats.length === 0) return null;
    
    if (mode === 'audio') {
      return formats.find(f => !f.has_video && f.has_audio) || formats.find(f => f.has_audio);
    }
    
    // Try to find a match for the resolution (e.g. 1080)
    const matches = formats.filter(f => f.has_video && (f.resolution?.includes(quality) || f.label?.includes(quality)));
    if (matches.length > 0) return matches[0];
    
    // Fallback to highest quality video
    return formats.filter(f => f.has_video).sort((a, b) => {
      const getRes = (s) => parseInt(s?.match(/\d+/)?.[0] || '0');
      return getRes(b.resolution) - getRes(a.resolution);
    })[0] || formats[0];
  }

  function handlePickerClose() {
    setPickerData(null);
  }

  return (
    <div className="app-wrapper">
      <Particles />
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Picker Modal (Could be adapted for custom backend if needed) */}
      {pickerData && (
        <PickerModal data={pickerData} onClose={handlePickerClose} />
      )}

      {currentView === 'home' && (
        <>
          {/* Hero */}
          <section className="hero container animate-fade">
            <div className="hero-badge">
              <span className="dot"></span>
              Powered by NAAADLI
            </div>
            <h1>
              Volia Gives Your Media{' '}
              <span className="gradient-text">Freedom</span>
            </h1>
            <p className="hero-sub">
              Download videos, images, audio, and Spotify playlists through a
              clean tool built for creators, students, and everyday explorers.
            </p>
          </section>

          <div className="container">
            {/* Platform Selector */}
            <PlatformSelector selected={platform} onSelect={setPlatform} />

            {/* URL Input */}
            <UrlInput
              url={url}
              setUrl={setUrl}
              platform={platform}
              onSubmit={handleDownload}
              loading={loading}
              isAnalyzing={isAnalyzing}
              isImageLink={isImageLink}
            />

            {/* Quality Options - show when video platform detected or cachedInfo ready */}
            {(() => {
              const detectedPlatform = url.trim() && /youtube\.com|youtu\.be|twitter\.com|x\.com|facebook\.com|fb\.watch|instagram\.com/i.test(url.trim());
              const showQuality = (detectedPlatform || (cachedInfo && cachedInfo.platform !== 'spotify')) && !isImageLink;
              return showQuality ? (
                <QualitySelector
                  options={qualityOptions}
                  onChange={setQualityOptions}
                  formats={cachedInfo?.formats}
                  isLoading={isAnalyzing}
                />
              ) : null;
            })()}

            {/* Loading State */}
            {loading && progress.status === 'idle' && (
              <div className="loading-overlay">
                <div className="spinner spinner-lg spinner-purple"></div>
                <p>Preparing your Volia download...</p>
              </div>
            )}

            {/* Download Progress */}
            {progress.status !== 'idle' && (
              <DownloadProgress progress={progress} />
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="error-state animate-fade">
                <div className="error-icon">!</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={resetState} id="retry-btn">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {currentView === 'history' && (
        <div className="container" style={{ paddingTop: 40 }}>
          <HistoryPanel />
        </div>
      )}

      {currentView === 'about' && (
        <div className="container">
          <AboutSection />
        </div>
      )}

      {currentView === 'settings' && (
        <div className="container" style={{ paddingTop: 40 }}>
          <SettingsPanel />
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-logo-text">Volia</span>
              <p className="footer-tagline">Giving media its freedom. Simple, fast, and local.</p>
            </div>
            <div className="footer-naaadli">
              <span className="naaadli-badge">NAAADLI INITIATIVE</span>
              <p className="naaadli-expanded">Nahḍat al-ʿAṣr al-Dhahabī lil-Islām</p>
              <p className="naaadli-translation">The Revival & Renaissance of the Golden Age of Islam</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-author">
              © {new Date().getFullYear()} Volia. Built by{' '}
              <a
                href="https://www.linkedin.com/in/muhammad-yasir-402a67237"
                target="_blank"
                rel="noopener noreferrer"
                className="author-link"
              >
                Muhammad Yasir
              </a>
            </p>
            <div className="footer-links">
              <a
                href="https://www.instagram.com/yasiraminbrohi/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/muhammad-yasir-402a67237"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
