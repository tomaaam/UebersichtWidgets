import { run } from 'uebersicht';

export const command = "interface=$(route get default | grep interface | awk '{print $2}'); netstat -ib | grep -e \"$interface\" | grep Link | awk '{print $7, $10}'";

export const refreshFrequency = 1000; // 1 second

export const className = `
  left: 20px;
  bottom: 400px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  z-index: 10;

  .widget-container {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 140px;
  }

  .title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .value {
    font-size: 14px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .download { color: #61dafb; }
  .upload { color: #f5a623; }
`;

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

let previousState = {
  inBytes: 0,
  outBytes: 0,
  timestamp: Date.now()
};

export const render = ({ output, error }) => {
  if (error) {
    return (
      <div className="widget-container">
        <div className="title">Network</div>
        <div className="value" style={{ color: '#ff5f56' }}>Error</div>
      </div>
    );
  }

  if (!output) return null;

  const [currentIn, currentOut] = output.trim().split(/\s+/).map(Number);

  if (isNaN(currentIn) || isNaN(currentOut)) return null;

  const now = Date.now();
  const timeDiff = (now - previousState.timestamp) / 1000; // Seconds

  // Avoid division by zero or negative time
  const safeTimeDiff = timeDiff > 0 ? timeDiff : 1;

  // Calculate speed (Bytes per second)
  // Handle counter wrap-around or reset (if current < previous, assume reset or 0 speed for this tick)
  let speedIn = 0;
  let speedOut = 0;

  if (previousState.inBytes > 0 && currentIn >= previousState.inBytes) {
    speedIn = (currentIn - previousState.inBytes) / safeTimeDiff;
  }

  if (previousState.outBytes > 0 && currentOut >= previousState.outBytes) {
    speedOut = (currentOut - previousState.outBytes) / safeTimeDiff;
  }

  // Update state for next render
  // Note: In Übersicht, 'render' is called fresh each time, but module-level variables persist.
  // However, relying on module-level variables can be tricky if the widget reloads.
  // A better approach for state in Übersicht React widgets is usually not available 
  // without a proper React class/hook structure, but 'render' is a functional component.
  // The standard way to handle 'previous' data in simple functional Übersicht widgets 
  // is often just using the module scope variable as done here, 
  // OR using the 'updateState' method if we were exporting a class.
  // Since we are exporting 'render' (functional), we rely on the module scope 'previousState'.

  previousState = {
    inBytes: currentIn,
    outBytes: currentOut,
    timestamp: now
  };

  return (
    <div className="widget-container">
      <div className="title">Network</div>
      <div className="stats-row">
        <div className="stat-item">
          <span className="label">
            <span className="download">↓</span> Down
          </span>
          <span className="value">{formatBytes(speedIn)}</span>
        </div>
        <div className="stat-item" style={{ alignItems: 'flex-end' }}>
          <span className="label">
            Up <span className="upload">↑</span>
          </span>
          <span className="value">{formatBytes(speedOut)}</span>
        </div>
      </div>
    </div>
  );
};
