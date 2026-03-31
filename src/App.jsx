import { useState, useEffect } from 'react';
import {
  Building2,
  Zap,
  BatteryCharging,
  CloudSun,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import './index.css';

// Initial fake history database
const initialHistory = [
  { month: 'Oct', high: 28.4, low: 18.2 },
  { month: 'Nov', high: 32.1, low: 15.6 },
  { month: 'Dec', high: 45.3, low: 22.1 },
  { month: 'Jan', high: 48.2, low: 20.4 },
  { month: 'Feb', high: 42.1, low: 25.3 },
];

function App() {
  const [power, setPower] = useState(12.4);
  const [batteryCharge, setBatteryCharge] = useState(300);
  const [batteryPower, setBatteryPower] = useState(-5.2);
  const [temperature, setTemperature] = useState(22.4);
  const [history, setHistory] = useState(initialHistory);

  // Data simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate power consumption by ±0.5 kW
      setPower(prev => Math.max(0, +(prev + (Math.random() - 0.5)).toFixed(1)));

      // Fluctuate battery draw by ±1 kW
      setBatteryPower(prev => +(prev + (Math.random() * 2 - 1)).toFixed(1));

      // Affect charge based on draw (super slow for visual simulation)
      setBatteryCharge(prev => {
        let newCharge = prev - (batteryPower * 0.05); // Simulated drain/charge
        if (newCharge > 440) newCharge = 440;
        if (newCharge < 0) newCharge = 0;
        return +(newCharge).toFixed(0);
      });

      // Very slow temperature fluctuation
      setTemperature(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));

    }, 3000);

    return () => clearInterval(interval);
  }, [batteryPower]);

  return (
    <>
      <h1 className="dashboard-title">Device Orchestration for the Utility's Grid (D.O.U.G)</h1>
      <div className="dashboard-grid">

        {/* Building Power Widget */}
        <div className="glass-panel power">
          <div className="widget-header">
            <div className="icon-wrapper">
              <Building2 size={28} />
              <Zap size={16} style={{ marginLeft: '-8px', marginBottom: '-10px', color: '#facc15' }} />
            </div>
            <span className="widget-title">Facility Consumption</span>
          </div>
          <div className="widget-body">
            <div className="main-value">
              {power.toFixed(1)} <span className="unit">kW</span>
            </div>
            <div className="sub-info">
              <Activity size={16} color="#eab308" />
              <span>Current direct load</span>
            </div>
          </div>
        </div>

        {/* Thermal Storage Battery Widget */}
        <div className="glass-panel battery">
          <div className="widget-header">
            <div className="icon-wrapper">
              <BatteryCharging size={28} />
            </div>
            <span className="widget-title">Thermal Storage</span>
          </div>
          <div className="widget-body">
            <div className="main-value">
              {batteryCharge} <span className="unit">/ 440 kW</span>
            </div>
            <div className="battery-container">
              <div
                className="battery-fill"
                style={{ width: `${(batteryCharge / 440) * 100}%` }}
              ></div>
            </div>
            <div className="sub-info" style={{ marginTop: '1rem' }}>
              {batteryPower < 0 ? (
                <ArrowDownRight size={18} color="#ef4444" />
              ) : (
                <ArrowUpRight size={18} color="#22c55e" />
              )}
              <span>
                {Math.abs(batteryPower).toFixed(1)} kW
                <span className="sub-info-value" style={{ marginLeft: '4px' }}>
                  {batteryPower < 0 ? 'Discharging' : 'Charging'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Weather Forecast Widget */}
        <div className="glass-panel weather">
          <div className="widget-header">
            <div className="icon-wrapper">
              <CloudSun size={28} />
            </div>
            <span className="widget-title">Local Environment</span>
          </div>
          <div className="widget-body">
            <div className="main-value">
              {temperature.toFixed(1)} <span className="unit">°C</span>
            </div>
            <div className="sub-info">
              <span>Outdoor Ambient Temperature</span>
            </div>
          </div>
        </div>

        {/* Monthly Highs & Lows Database Widget */}
        <div className="glass-panel history">
          <div className="widget-header">
            <div className="icon-wrapper">
              <History size={28} />
            </div>
            <span className="widget-title">Monthly Extremes (kW)</span>
          </div>
          <div className="widget-body">
            <div className="history-list">
              {history.map((record) => (
                <div key={record.month} className="history-item">
                  <span className="history-month">{record.month}</span>
                  <div className="history-stats">
                    <span className="high-stat" title="Monthly High">H: {record.high.toFixed(1)}</span>
                    <span className="low-stat" title="Monthly Low">L: {record.low.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default App;
