export default function AboutSection() {
  return (
    <div className="about-section animate-fade">
      <div className="about-hero">
        <span className="about-kicker">Universal Downloader</span>
        <h2>About Volia</h2>
        <p className="about-lead">
          Volia is a premium, high-performance media downloader designed around absolute user control. 
          No trackers, no intrusive ads, and no artificial restrictions—just pure, high-fidelity media access.
        </p>
      </div>

      <div className="about-grid">
        {/* Card 1: Volia Core */}
        <div className="about-card volia-card">
          <div className="card-glow"></div>
          <h3>The Volia Philosophy</h3>
          <p>
            We believe that saving content for offline learning, research, or creative inspiration should be simple, rapid, and respectful of your time. Volia consolidates complex media engines into a unified workspace.
          </p>
          <div className="about-pill-row">
            <span>⚡ Multi-Threaded</span>
            <span>🔒 Local Privacy</span>
            <span>🎨 High-Fidelity</span>
          </div>
        </div>

        {/* Card 2: NAAADLI Initiative */}
        <div className="about-card initiative-card">
          <div className="card-glow"></div>
          <span className="card-kicker">The Vision</span>
          <h3>NAAADLI Initiative</h3>
          <p className="arabic-text">
            Nahḍat al-ʿAṣr al-Dhahabī lil-Islām
          </p>
          <p className="translation-text">
            The Revival & Renaissance of the Golden Age of Islam
          </p>
          <p className="initiative-desc">
            NAAADLI is a digital movement formed from the initial alphabets of this vision. It channels the historical spirit of scientific inquiry, curation, and mathematical advancement from the Golden Age of Islam into modern software, constructing tools for accessible learning, creation, and empowerment.
          </p>
        </div>
      </div>

      {/* Founder Section */}
      <div className="founder-section about-card">
        <div className="card-glow"></div>
        <div className="founder-info">
          <div className="founder-avatar">
            <span>MY</span>
          </div>
          <div className="founder-details">
            <span className="founder-badge">FOUNDER & LEAD DEVELOPER</span>
            <h3>Muhammad Yasir</h3>
            <p>
              Muhammad Yasir is the creator of Volia and the visionary behind the NAAADLI initiative. 
              Dedicated to designing utilities that empower global users, he engineers tools that combine 
              premium aesthetics with robust, open-source performance.
            </p>
            <div className="founder-socials">
              <a
                href="https://www.instagram.com/yasiraminbrohi/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram-btn"
                id="social-instagram"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/muhammad-yasir-402a67237"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn linkedin-btn"
                id="social-linkedin"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
