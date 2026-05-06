export default function AboutSection() {
  return (
    <div className="about-section animate-fade">
      <div className="about-card">
        <h2>About the Developer</h2>
        <p className="about-meaning">
          Volia (Воля) — <em>Freedom</em> — Giving users freedom to access and download media easily.
        </p>
        <p className="about-bio">
          {/* ✏️ Customize this bio with your own information */}
          A passionate developer building tools that empower users. 
          Volia was born from the belief that accessing and saving media content 
          should be simple, beautiful, and free. Built with modern technologies 
          and a focus on user experience.
        </p>
        <div className="about-social-links">
          <a
            href="https://github.com/YasirAminBrohi"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="GitHub"
            id="social-github"
          >
            ⌨️
          </a>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="X (Twitter)"
            id="social-twitter"
          >
            𝕏
          </a>
          <a
            href="mailto:brohiy543@gmail.com"
            className="social-link"
            title="Email"
            id="social-email"
          >
            ✉️
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-yasir-402a67237"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="LinkedIn"
            id="social-linkedin"
          >
            💼
          </a>
        </div>
      </div>
    </div>
  );
}
