export default function AboutSection() {
  return (
    <div className="about-section animate-fade">
      <div className="about-card">
        <p className="about-kicker">About Volia</p>
        <h2>Freedom for the media you care about</h2>

        <p className="about-meaning">
          Volia is a universal media downloader shaped around one idea: saving
          useful content should feel simple, fast, and respectful of your time.
          It brings video, image, audio, social media, and Spotify playlist
          downloads into one focused workspace.
        </p>

        <p className="about-bio">
          Volia is built by <strong>Muhammad Yasir</strong>, founder of the
          <strong> NAAADLI initiative</strong>. It is made for creators,
          students, researchers, and everyday users who want practical tools
          that feel modern, reliable, and effortless.
        </p>

        <p className="about-bio">
          NAAADLI is formed from the initials of
          <strong> Nahdat al-Asr al-Dhahabi lil-Islam</strong>: the revival or
          renaissance of the Golden Age of Islam. The initiative carries that
          spirit into modern digital work by building thoughtful, capable tools
          for learning, creation, and access.
        </p>

        <div className="about-pill-row">
          <span>Universal downloads</span>
          <span>Creator focused</span>
          <span>NAAADLI powered</span>
        </div>

        <div className="about-social-links">
          <a
            href="https://www.instagram.com/yasiraminbrohi/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="Instagram"
            id="social-instagram"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/muhammad-yasir-402a67237"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="LinkedIn"
            id="social-linkedin"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
