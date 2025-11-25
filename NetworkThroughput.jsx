import { run } from 'uebersicht';

export const command = "interface=$(route get default | grep interface | awk '{print $2}'); netstat -ib | grep -e \"$interface\" | grep Link | awk '{print $7, $10}'";

export const refreshFrequency = 1000; // 1 second

export const className = `
  left: 15px;
  top: 15px;
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
    min-width: 160px;
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
    margin-bottom: 4px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  .label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .value {
    font-size: 14px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .bar-container {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 4px;
    width: 100%;
  }

  .bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .download { color: #61dafb; }
  .upload { color: #f5a623; }
  .bg-download { background-color: #61dafb; }
  .bg-upload { background-color: #f5a623; }
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
  maxIn: 1024 * 1024, // Start with 1MB/s baseline to avoid full bars immediately
  maxOut: 1024 * 1024,
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

  let speedIn = 0;
  let speedOut = 0;

  if (previousState.inBytes > 0 && currentIn >= previousState.inBytes) {
    speedIn = (currentIn - previousState.inBytes) / safeTimeDiff;
  }

  if (previousState.outBytes > 0 && currentOut >= previousState.outBytes) {
    speedOut = (currentOut - previousState.outBytes) / safeTimeDiff;
  }

  // Update max speeds for scaling
  const maxIn = Math.max(previousState.maxIn, speedIn);
  const maxOut = Math.max(previousState.maxOut, speedOut);

  // Calculate percentages
  const percentIn = Math.min(100, (speedIn / maxIn) * 100);
  const percentOut = Math.min(100, (speedOut / maxOut) * 100);

  previousState = {
    inBytes: currentIn,
    outBytes: currentOut,
    maxIn,
    maxOut,
    timestamp: now
  };

  return (
    <div className="widget-container">
      <div className="title">Network</div>

      <div className="stat-item">
        <div className="label">
          <span><span className="download">↓</span> Down</span>
          <span className="value">{formatBytes(speedIn)}</span>
        </div>
        <div className="bar-container">
          <div className="bar bg-download" style={{ width: `${percentIn}%` }}></div>
        </div>
      </div>

      <div className="stat-item" style={{ marginTop: '8px' }}>
        <div className="label">
          <span><span className="upload">↑</span> Up</span>
          <span className="value">{formatBytes(speedOut)}</span>
        </div>
        <div className="bar-container">
          <div className="bar bg-upload" style={{ width: `${percentOut}%` }}></div>
        </div>
      </div>
    </div>
  );
};
