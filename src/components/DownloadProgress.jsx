import React from 'react';

export default function DownloadProgress({ progress }) {
  if (!progress || progress.status === 'idle') return null;

  const { percent, speed, eta, filename, status, message } = progress;
  const numericPercent = parseFloat(percent?.replace('%', '')) || 0;

  const isDownloading = status === 'downloading' || status === 'starting';
  const isComplete = status === 'complete';
  const isError = status === 'error';

  return (
    <div className={`download-progress-container animate-fade ${isDownloading ? 'active' : ''}`}>
      <div className="progress-header">
        <span className="progress-filename">
          {filename || 'Preparing your Volia download'}
        </span>
        <span className="progress-status-badge">
          {isDownloading && 'Downloading'}
          {isComplete && 'Ready'}
          {isError && 'Needs attention'}
        </span>
      </div>

      <div className="progress-bar-wrapper">
        <div
          className={`progress-bar-fill ${isComplete ? 'complete' : ''} ${isError ? 'error' : ''}`}
          style={{ width: `${numericPercent}%` }}
        >
          {numericPercent > 10 && (
            <span className="progress-percent-inner">{Math.round(numericPercent)}%</span>
          )}
        </div>
      </div>

      <div className="progress-footer">
        <div className="progress-stats">
          {isDownloading && (
            <>
              <span className="stat-item">
                <span className="stat-label">Speed:</span> {speed || '--'}
              </span>
              <span className="stat-item">
                <span className="stat-label">ETA:</span> {eta || '--'}
              </span>
            </>
          )}
          {!isDownloading && numericPercent > 0 && (
             <span className="stat-item">
               <span className="stat-label">Progress:</span> {numericPercent}%
             </span>
          )}
        </div>

        {isComplete && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="status-message success">
              Download complete. Your file is ready.
            </div>
            {progress.downloadUrl && (
              <a
                href={progress.downloadUrl}
                download={filename || 'download'}
                className="save-btn"
              >
                Save File
              </a>
            )}
          </div>
        )}

        {isError && (
          <div className="status-message error">
            {message || 'Download failed'}
            {message && (
              <p style={{ color: 'red', fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
