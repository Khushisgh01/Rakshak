// FootageViewer.tsx
import React, { useState, useEffect } from "react";

export default function FootageViewer() {
  const filename = new URLSearchParams(window.location.search).get('file');
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const url = `http://127.0.0.1:8000/footages/${filename}`;

  useEffect(() => {
    if (!filename) return;

    // Check if file exists. If 404, retry in 2 seconds.
    const checkFile = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          setIsReady(true);
        } else {
          throw new Error("Not ready");
        }
      } catch (err) {
        if (retryCount < 10) { // Try for 20 seconds total
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        }
      }
    };

    checkFile();
  }, [filename, retryCount, url]);

  if (!filename) return <div style={{color:'white', padding:'20px'}}>No file specified.</div>;

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#e11d48' }}>🎥 Incident Footage</h2>
      
      {!isReady ? (
        <div style={{ color: 'white' }}>
          <p>Processing video... please wait.</p>
          <div className="loader"></div> {/* Add a CSS spinner here */}
        </div>
      ) : (
        <video
          key={filename}
          controls
          autoPlay
          onError={(e) => console.log("VIDEO ERROR", e)}
          style={{ maxWidth: '900px', width: '100%', borderRadius: '12px', border: '2px solid #e11d48' }}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <button onClick={() => window.close()} style={{ marginTop: '20px', backgroundColor: '#e11d48', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Close
      </button>
    </div>
  );
}