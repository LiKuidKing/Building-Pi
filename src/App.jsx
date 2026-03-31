import { useState, useEffect } from 'react';
import { 
  Building2, 
  Zap, 
  BatteryCharging, 
  CloudSun, 
  History,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  LayoutDashboard,
  CalendarClock,
  Settings,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wrench
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
  const [activeTab, setActiveTab] = useState('home');
  const [power, setPower] = useState(12.4);
  const [batteryCharge, setBatteryCharge] = useState(300);
  const [batteryPower, setBatteryPower] = useState(-5.2);
  const [temperature, setTemperature] = useState(22.4);
  const [history, setHistory] = useState(initialHistory);
  const [elecPrice, setElecPrice] = useState(0.12);

  // Data simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate power consumption
      setPower(prev => Math.max(0, +(prev + (Math.random() - 0.5)).toFixed(1)));
      
      // Fluctuate battery draw
      setBatteryPower(prev => +(prev + (Math.random() * 2 - 1)).toFixed(1));
      
      // Affect charge based on draw
      setBatteryCharge(prev => {
        let newCharge = prev - (batteryPower * 0.05); // Simulated drain/charge
        if (newCharge > 440) newCharge = 440;
        if (newCharge < 0) newCharge = 0;
        return +(newCharge).toFixed(0);
      });

      // Very slow temperature fluctuation
      setTemperature(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));

      // Fluctuate electricity price (between $0.08 and $0.24)
      setElecPrice(prev => {
        let change = (Math.random() - 0.5) * 0.02;
        let newPrice = prev + change;
        if (newPrice < 0.08) newPrice = 0.08;
        if (newPrice > 0.24) newPrice = 0.24;
        return +(newPrice).toFixed(3);
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [batteryPower]);

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <h1 className="sidebar-title">D.O.U.G<br/><span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Device Orchestration</span></h1>
        <nav className="nav-menu">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <LayoutDashboard size={20} />
            Overview
          </div>
          <div 
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <CalendarClock size={20} />
            Schedule
          </div>
          <div 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            Settings
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* TAB ROUTING */}
        {activeTab === 'home' && (
          <div className="dashboard-grid">
            
            {/* Building Power Widget */}
            <div className="glass-panel power">
              <div className="widget-header">
                <div className="icon-wrapper">
                  <Building2 size={24} />
                  <Zap size={14} style={{ marginLeft: '-6px', marginBottom: '-8px', color: '#facc15' }} />
                </div>
                <span className="widget-title">Facility Load</span>
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
                  <BatteryCharging size={24} />
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
                <div className="sub-info" style={{ marginTop: '0.75rem' }}>
                  {batteryPower < 0 ? (
                    <ArrowDownRight size={16} color="#ef4444" />
                  ) : (
                    <ArrowUpRight size={16} color="#22c55e" />
                  )}
                  <span>
                    {Math.abs(batteryPower).toFixed(1)} kW 
                    <span className="sub-info-value" style={{ marginLeft: '4px'}}>
                      {batteryPower < 0 ? 'Discharging' : 'Charging'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Electricity Price Widget (NEW) */}
            <div className="glass-panel price">
              <div className="widget-header">
                <div className="icon-wrapper">
                  <DollarSign size={24} />
                </div>
                <span className="widget-title">Grid Pricing</span>
              </div>
              <div className="widget-body">
                <div className="main-value">
                  ${elecPrice.toFixed(3)} <span className="unit">/ kWh</span>
                </div>
                <div className="sub-info">
                  {elecPrice > 0.18 ? (
                    <TrendingUp size={16} color="#ef4444" />
                  ) : (
                    <TrendingDown size={16} color="#22c55e" />
                  )}
                  <span style={{color: elecPrice > 0.18 ? '#ef4444' : '#22c55e'}}>
                    {elecPrice > 0.18 ? 'On-Peak Rate' : 'Off-Peak Rate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Forecast Widget */}
            <div className="glass-panel weather">
              <div className="widget-header">
                <div className="icon-wrapper">
                  <CloudSun size={24} />
                </div>
                <span className="widget-title">Local Climate</span>
              </div>
              <div className="widget-body">
                <div className="main-value">
                  {temperature.toFixed(1)} <span className="unit">°C</span>
                </div>
                <div className="sub-info">
                  <span>Outdoor Ambient</span>
                </div>
              </div>
            </div>

            {/* Monthly Highs & Lows Database Widget */}
            <div className="glass-panel history" style={{ gridColumn: 'span 2' }}>
              <div className="widget-header">
                <div className="icon-wrapper">
                  <History size={24} />
                </div>
                <span className="widget-title">Monthly Load Extremes (kW)</span>
              </div>
              <div className="widget-body">
                <div className="history-list">
                  {history.map((record) => (
                    <div key={record.month} className="history-item">
                      <div className="history-month">{record.month}</div>
                      <div className="history-stats">
                        <span className="high-stat">High: {record.high.toFixed(1)}</span>
                        <span className="low-stat">Low: {record.low.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* WORK IN PROGRESS PAGES */}
        {activeTab === 'schedule' && (
          <div className="placeholder-page">
            <Wrench size={48} opacity={0.5} />
            <h2>Schedule Configuration</h2>
            <p>Work in progress module.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="placeholder-page">
            <Settings size={48} opacity={0.5} />
            <h2>System Settings</h2>
            <p>Work in progress module.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
