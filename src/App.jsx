import { useState, useCallback } from 'react';
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
import { downloadWithCobalt, triggerDownload, addToHistory, detectPlatform } from './cobalt';

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
  }

  async function handleDownload(url) {
    resetState();
    setLoading(true);

    const detectedPlatform = detectPlatform(url) || platform;

    try {
      addToast('info', 'Processing your download...');
      const result = await downloadWithCobalt(url, qualityOptions);

      if (result.status === 'redirect' || result.status === 'tunnel') {
        // Direct download
        triggerDownload(result.url, result.filename, result.status);
        addToast('success', `Download started: ${result.filename || 'media file'}`);

        // Save to local history
        addToHistory({
          url,
          platform: detectedPlatform,
          filename: result.filename || 'Unknown',
        });
      } else if (result.status === 'picker') {
        // Multiple items — show picker modal
        setPickerData(result);
        addToast('info', `Found ${result.picker.length} items to choose from`);
      }
    } catch (err) {
      const msg = err.message || 'Download failed. Please try again.';
      setError(msg);
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
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

      {/* Picker Modal */}
      {pickerData && (
        <PickerModal data={pickerData} onClose={handlePickerClose} />
      )}

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
              onSubmit={handleDownload}
              loading={loading}
            />

            {/* Quality Options */}
            <QualitySelector
              options={qualityOptions}
              onChange={setQualityOptions}
            />

            {/* Loading State */}
            {loading && (
              <div className="loading-overlay">
                <div className="spinner spinner-lg spinner-purple"></div>
                <p>Processing your download via Cobalt...</p>
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
          <p className="cobalt-badge">
            Powered by <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer">Cobalt</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
