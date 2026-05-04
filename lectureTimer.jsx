// Define the standard starting hours for your lectures.
// For example, '10' means a lecture from 10:15 to 11:45.
const LECTURE_START_HOURS = [8, 10, 12, 14, 16, 18];

export const command = "date +'%Y-%m-%dT%H:%M:%S'";

// The user requested 5 minutes (300000 ms). 
// Note: If you want the progress bar to slide more smoothly, you can lower this to 60000 (1 minute).
export const refreshFrequency = 300000;

export const className = `
  left: 15px;
  top: 180px; /* Positioned slightly below the Network widget */
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
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 4px;
    margin-bottom: 2px;
    width: 100%;
    position: relative;
  }

  .bar {
    height: 100%;
    border-radius: 3px;
    transition: width 1s ease;
  }
  
  .bg-progress { 
    background-color: #61dafb; /* Matches the download color of your other widget */
  }

  /* Visually divides the 90 minute block into intervals */
  .marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px; /* Thinner line to avoid clutter with many intervals */
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .time-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 4px;
  }

  .break-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    text-align: center;
    padding: 8px 0 4px 0;
  }
`;

export const render = ({ output, error }) => {
  if (error) {
    return (
      <div className="widget-container">
        <div className="title">Lecture</div>
        <div className="value" style={{ color: '#ff5f56' }}>Error</div>
      </div>
    );
  }

  if (!output) return null;

  // Parse the current time from the system
  const now = new Date(output.trim());
  const h = now.getHours();
  const m = now.getMinutes();
  const currentMins = h * 60 + m;

  // Determine if we are currently in an active lecture block
  let activeStartHour = -1;

  for (let startH of LECTURE_START_HOURS) {
    const blockStart = startH * 60 + 15;      // XX:15
    const blockEnd = (startH + 1) * 60 + 45;  // XX+1:45

    if (currentMins >= blockStart && currentMins < blockEnd) {
      activeStartHour = startH;
      break;
    }
  }

  // If no active lecture is found, display a "Break" state
  if (activeStartHour === -1) {
    return (
      <div className="widget-container">
        <div className="title">Lecture Progress</div>
        <div className="break-text">Currently in a break</div>
      </div>
    );
  }

  // Math for the active lecture
  const startMins = activeStartHour * 60 + 15;
  const totalDuration = 90; // 1.5 hours in minutes
  const elapsed = currentMins - startMins;
  const remaining = totalDuration - elapsed;

  // Calculate percentage (clamped between 0 and 100)
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Generate a visual marker every 5 minutes
  const markers = [];
  const interval = 5;
  for (let i = interval; i < totalDuration; i += interval) {
    const positionPercent = (i / totalDuration) * 100;
    markers.push(
      <div
        key={i}
        className="marker"
        style={{ left: `${positionPercent}%` }}
      ></div>
    );
  }

  // Formatting helper for times
  const formatTime = (hour, min) => {
    const displayHour = hour % 24;
    return `${displayHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const startTimeStr = formatTime(activeStartHour, 15);
  const endTimeStr = formatTime(activeStartHour + 1, 45);

  return (
    <div className="widget-container">
      <div className="title">Lecture Progress</div>

      <div className="stat-item" style={{ marginTop: '4px' }}>
        <div className="label">
          <span>{startTimeStr}</span>
          <span>{endTimeStr}</span>
        </div>

        <div className="bar-container">
          {markers}
          <div className="bar bg-progress" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="time-row">
          <span>{elapsed}m passed</span>
          <span className="value" style={{ color: '#fff' }}>{remaining}m left</span>
        </div>
      </div>
    </div>
  );
};