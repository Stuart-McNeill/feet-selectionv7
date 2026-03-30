import React, { useRef, useState, useEffect } from 'react';

// For Web (Stitch/Jules), we use standard HTML elements instead of React Native
export default function FootSelectionWeb() {
  const iframeRef = useRef(null);
  const [side, setSide] = useState('right');
  const [mode, setMode] = useState('rotate');
  const [stats, setStats] = useState({ count: 0, region: "None" });

  // Handle messages coming FROM the GitHub WebView
  useEffect(() => {
    const handleMessage = (event) => {
      // Security: Optional check to ensure messages only come from your GitHub domain
      // if (event.origin !== "https://stuart-mcneill.github.io") return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.region) {
          setStats(data);
        }
      } catch (e) {
        // console.log("Non-JSON message received:", event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send commands TO the GitHub WebView
  const run = (action, params = {}) => {
    const cmd = JSON.stringify({ action, ...params });
    if (iframeRef.current) {
      // We target the window inside the iframe
      iframeRef.current.contentWindow.postMessage(cmd, "*");
    }
  };

  return (
    <div style={styles.container}>
      {/* 3D Viewport (The Iframe replaces WebView) */}
      <iframe
        ref={iframeRef}
        src="./index.html"
        style={styles.webView}
        frameBorder="0"
        title="3D Foot Selection"
      />

      {/* SIDEBAR UI */}
      <div style={styles.sidebarContainer}>
        <div style={styles.sidebar}>

          <div style={styles.headerLabel}>SELECTION</div>
          <div style={styles.row}>
            <button
              style={{...styles.btnHalf, ...(side === 'left' ? styles.activeCyan : {})}}
              onClick={() => {setSide('left'); run('SELECT', {side: 'left'})}}>
              <span style={side === 'left' ? styles.textBlack : styles.btnText}>LEFT</span>
            </button>
            <button
              style={{...styles.btnHalf, ...(side === 'right' ? styles.activeCyan : {})}}
              onClick={() => {setSide('right'); run('SELECT', {side: 'right'})}}>
              <span style={side === 'right' ? styles.textBlack : styles.btnText}>RIGHT</span>
            </button>
          </div>

          <div style={styles.headerLabel}>NAVIGATION & TOOLS</div>
          <button
            style={{...styles.btnFull, ...(mode === 'rotate' ? styles.activeCyan : {})}}
            onClick={() => {setMode('rotate'); run('SET_MODE', {mode: 'rotate'})}}>
            <span style={mode === 'rotate' ? styles.textBlack : styles.btnText}>ROTATE</span>
          </button>

          <button
            style={{...styles.btnFull, ...(mode === 'mark' ? styles.activeCyan : {})}}
            onClick={() => {setMode('mark'); run('SET_MODE', {mode: 'mark'})}}>
            <span style={mode === 'mark' ? styles.textBlack : styles.btnText}>MARK</span>
          </button>

          <div style={styles.row}>
            <button style={styles.btnHalf} onClick={() => run('UNDO')}>
              <span style={styles.btnText}>UNDO</span>
            </button>
            <button style={styles.btnHalf} onClick={() => run('CLEAR')}>
              <span style={styles.btnText}>CLEAR</span>
            </button>
          </div>

          <button style={styles.downloadBtn}>
            <span style={styles.downloadText}>DOWNLOAD REPORT</span>
          </button>

          <div style={styles.statusBox}>
            <div style={styles.statusLabel}>SYSTEM READY</div>
            <div style={styles.coordsLabel}>Region: <span style={styles.cyanText}>{stats.region}</span></div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0c',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  webView: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  sidebarContainer: {
    position: 'absolute',
    top: '40px',
    left: '15px',
    bottom: '40px',
    width: '220px',
    pointerEvents: 'none' // Allows clicking through container to 3D model if needed
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto' // Re-enables clicking for buttons
  },
  headerLabel: {
    color: '#888',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    marginBottom: '12px',
    marginTop: '20px'
  },
  row: { display: 'flex', gap: '10px', marginBottom: '10px' },
  btnHalf: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '14px 0',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    outline: 'none'
  },
  btnFull: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '14px 0',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '10px',
    cursor: 'pointer'
  },
  activeCyan: { backgroundColor: '#00f2ff', borderColor: '#00f2ff' },
  btnText: { color: '#fff', fontSize: '11px', fontWeight: '600' },
  textBlack: { color: '#000', fontSize: '11px', fontWeight: '600' },
  downloadBtn: {
    backgroundColor: '#fff',
    padding: '14px 0',
    borderRadius: '8px',
    marginTop: '10px',
    border: 'none',
    cursor: 'pointer'
  },
  downloadText: { color: '#000', fontSize: '11px', fontWeight: '700' },
  statusBox: { marginTop: '25px' },
  statusLabel: { color: '#444', fontSize: '10px', fontWeight: '800', marginBottom: '4px' },
  coordsLabel: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  cyanText: { color: '#00f2ff', fontWeight: '700' }
};
