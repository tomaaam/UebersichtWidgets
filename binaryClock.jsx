import { run } from 'uebersicht';

export const command = 'date "+%H %M %S"';

export const refreshFrequency = 1000; // 1 second

export const className = `
  left: 240px;
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
    min-width: 150px;
  }

  .clock-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    justify-items: center;
    align-items: end;
  }

  .column {
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
    left: 6px;
    right: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
  }

  .dot.active {
    background: #ffffffff;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }

  .labels {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    margin-top: 4px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
    letter-spacing: 2px;
  }
`;

// Helper to get bits for a digit (8 4 2 1)
const getBits = (digit) => {
    const num = parseInt(digit, 10);
    return [
        (num & 1) !== 0, // 1
        (num & 2) !== 0, // 2
        (num & 4) !== 0, // 4
        (num & 8) !== 0  // 8
    ];
};

export const render = ({ output, error }) => {
    if (error) {
        return (
            <div className="widget-container">
                <div style={{ color: '#ff5f56' }}>Error</div>
            </div>
        );
    }

    if (!output) return null;

    const [h, m, s] = output.trim().split(' ');

    // Pad with 0 if needed (though date command usually pads)
    const hours = h.padStart(2, '0');
    const minutes = m.padStart(2, '0');
    const seconds = s.padStart(2, '0');

    const digits = [
        hours[0], hours[1],
        minutes[0], minutes[1],
        seconds[0], seconds[1]
    ];

    return (
        <div className="widget-container">
            <div className="clock-grid">
                {digits.map((digit, colIndex) => {
                    const bits = getBits(digit);
                    return (
                        <div key={colIndex} className="column">
                            {bits.map((isActive, bitIndex) => (
                                <div
                                    key={bitIndex}
                                    className={`dot ${isActive ? 'active' : ''}`}
                                    title={`Bit ${Math.pow(2, bitIndex)}`}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
