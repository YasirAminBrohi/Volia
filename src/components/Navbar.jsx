export default function Navbar({ theme, onToggleTheme, currentView, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="#" className="logo" onClick={e => { e.preventDefault(); onNavigate('home'); }}>
          <img src="/volia-logo.svg" alt="Volia by NAAADLI" className="logo-wordmark" />
        </a>
        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
            id="nav-home"
          >
            Home
          </button>
          <button
            className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => onNavigate('history')}
            id="nav-history"
          >
            History
          </button>
          <button
            className={`nav-btn ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
            id="nav-about"
          >
            About
          </button>
          <button
            className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
            id="nav-settings"
          >
            Settings
          </button>

          <button
            className="nav-btn theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
}
