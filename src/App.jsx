import { useState, useCallback } from 'react';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import PlatformSelector from './components/PlatformSelector';
import UrlInput from './components/UrlInput';
import MediaCard from './components/MediaCard';
import FormatList from './components/FormatList';
import HistoryPanel from './components/HistoryPanel';
import AboutSection from './components/AboutSection';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { extractMediaInfo, downloadMedia, getDownloadFileUrl, fetchProgress } from './api';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('home');
  const [platform, setPlatform] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null);

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
    if (view === 'home') {
      // Don't reset state when navigating home
    }
  }

  function resetState() {
    setMediaInfo(null);
    setSelectedFormat(null);
    setError(null);
  }

  async function handleFetch(url, detectedPlatform) {
    resetState();
    setLoading(true);
    try {
      const info = await extractMediaInfo(url, detectedPlatform || platform);
      setMediaInfo(info);
      if (info.formats && info.formats.length > 0) {
        // Auto-select first video+audio format, or first format
        const best = info.formats.find(f => f.has_video && f.has_audio) || info.formats[0];
        setSelectedFormat(best.format_id);
      }
      addToast('success', `Found ${info.formats?.length || 0} formats for "${info.title}"`);
    } catch (err) {
      setError(err.message || 'Failed to extract media info');
      addToast('error', err.message || 'Failed to extract media info');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!mediaInfo || !selectedFormat) return;
    setDownloading(true);
    setDownloadProgress(null);
    addToast('info', 'Starting download...');
    
    const taskId = Date.now().toString() + Math.random().toString(36).substring(7);
    let progressInterval = null;
    
    try {
      progressInterval = setInterval(async () => {
        try {
          const prog = await fetchProgress(taskId);
          if (prog && prog.status === 'downloading') {
            setDownloadProgress(prog);
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 1000);
      
      const result = await downloadMedia(mediaInfo.url, selectedFormat, mediaInfo.platform, taskId);
      
      clearInterval(progressInterval);
      setDownloadProgress(null);
      
      if (result.success && result.filename) {
        addToast('success', `Download complete: ${result.filename}`);
        // Trigger browser download
        const fileUrl = getDownloadFileUrl(result.filename);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        addToast('error', result.message || 'Download failed');
      }
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setDownloadProgress(null);
      addToast('error', err.message || 'Download failed');
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
    }
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

      {currentView === 'home' && (
        <>
          {/* Hero */}
          <section className="hero container animate-fade">
            <div className="hero-badge">
              <span className="dot"></span>
              Universal Media Downloader
            </div>
            <h1>
              Download Media with{' '}
              <span className="gradient-text">Freedom</span>
            </h1>
            <p className="hero-sub">
              Grab videos, images, and audio from YouTube, X, Facebook, Instagram
              and more — in any quality you want.
            </p>
          </section>

          <div className="container">
            {/* Platform Selector */}
            <PlatformSelector selected={platform} onSelect={setPlatform} />

            {/* URL Input */}
            <UrlInput
              platform={platform}
              onSubmit={handleFetch}
              loading={loading}
            />

            {/* Loading State */}
            {loading && (
              <div className="loading-overlay">
                <div className="spinner spinner-lg spinner-purple"></div>
                <p>Extracting media information...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="error-state animate-fade">
                <div className="error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={resetState} id="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {/* Media Card */}
            {mediaInfo && !loading && (
              <>
                <MediaCard media={mediaInfo} />
                <FormatList
                  formats={mediaInfo.formats}
                  selected={selectedFormat}
                  onSelect={setSelectedFormat}
                />
                <button
                  className="download-action-btn"
                  onClick={handleDownload}
                  disabled={!selectedFormat || downloading}
                  id="download-btn"
                >
                  {downloading ? (
                    <>
                      <span className="spinner"></span>
                      Downloading...
                    </>
                  ) : (
                    <>⬇️ Download Selected Format</>
                  )}
                </button>
                {downloading && downloadProgress && (
                  <div className="progress-container">
                    <div className="progress-bar-wrapper">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${downloadProgress.total_bytes ? (downloadProgress.downloaded_bytes / downloadProgress.total_bytes) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{formatBytes(downloadProgress.downloaded_bytes)} / {formatBytes(downloadProgress.total_bytes)}</span>
                      {downloadProgress.speed > 0 && <span>{formatBytes(downloadProgress.speed)}/s</span>}
                      {downloadProgress.eta > 0 && <span>{formatTime(downloadProgress.eta)} remaining</span>}
                    </div>
                  </div>
                )}
              </>
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
        <div className="container">
          <p>© 2026 Volia — Built with ⚡ for freedom</p>
        </div>
      </footer>
    </div>
  );
}
