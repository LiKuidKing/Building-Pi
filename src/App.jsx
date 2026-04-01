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
  Wrench,
  Menu,
  Network,
  Plus,
  Search,
  Server,
  ArrowLeft
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [power, setPower] = useState(12.4);
  const [batteryCharge, setBatteryCharge] = useState(300);
  const [batteryPower, setBatteryPower] = useState(-5.2);
  const [temperature, setTemperature] = useState(22.4);
  const [history, setHistory] = useState(initialHistory);
  const [elecPrice, setElecPrice] = useState(0.12);

  // BACnet State
  const [bacnetConfig, setBacnetConfig] = useState({ ip: '192.168.1.100', subnet: '255.255.255.0', port: '47808' });
  const [bacnetDevices, setBacnetDevices] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const discoverDevices = () => {
    setIsDiscovering(true);
    setDiscoveredDevices([]);
    setTimeout(() => {
      setDiscoveredDevices([
        { id: 1001, name: 'AHU-1 System', ip: '192.168.1.150', status: 'online' },
        { id: 1002, name: 'Chiller Plant Supervisor', ip: '192.168.1.151', status: 'online' },
        { id: 1005, name: 'VAV-101 Controller', ip: '192.168.1.155', status: 'offline' }
      ]);
      setIsDiscovering(false);
    }, 2000);
  };

  const addDevice = (device) => {
    if (!bacnetDevices.find(d => d.id === device.id)) {
      const newDevice = { ...device, points: [
        { id: 'AI-1', name: 'Supply Temp', value: +(Math.random() * 10 + 15).toFixed(1), unit: '°C' },
        { id: 'AI-2', name: 'Return Temp', value: +(Math.random() * 5 + 20).toFixed(1), unit: '°C' },
        { id: 'AV-1', name: 'Temp Setpoint', value: 22.0, unit: '°C' },
        { id: 'BO-1', name: 'Fan Command', value: 'ON', unit: '' },
        { id: 'BI-1', name: 'Filter Status', value: 'Normal', unit: '' }
      ]};
      setBacnetDevices([...bacnetDevices, newDevice]);
    }
  };

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

    // Simulate real-time BACnet data updates for registered devices
    const bacnetInterval = setInterval(() => {
      setBacnetDevices(prevDevices => prevDevices.map(device => {
        if (device.status === 'offline') return device;
        return {
          ...device,
          points: device.points.map(point => {
            if (point.id.startsWith('AI')) {
              return { ...point, value: +(point.value + (Math.random() * 0.4 - 0.2)).toFixed(1) };
            }
            return point;
          })
        };
      }));
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(bacnetInterval);
    };
  }, [batteryPower]);

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>

        <div className="sidebar-header">
          <h1 className="sidebar-title">
            D.O.U.G<br />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Building Management System</span>
          </h1>
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            title="Overview"
          >
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
            <span className="nav-text">Overview</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            title="Schedule"
          >
            <CalendarClock size={20} style={{ flexShrink: 0 }} />
            <span className="nav-text">Schedule</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'bacnet' ? 'active' : ''}`}
            onClick={() => setActiveTab('bacnet')}
            title="BACnet Integration"
          >
            <Network size={20} style={{ flexShrink: 0 }} />
            <span className="nav-text">BACnet</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Settings size={20} style={{ flexShrink: 0 }} />
            <span className="nav-text">Settings</span>
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
                    <span className="sub-info-value" style={{ marginLeft: '4px' }}>
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
                  <span style={{ color: elecPrice > 0.18 ? '#ef4444' : '#22c55e' }}>
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

        {/* BACNET PAGE */}
        {activeTab === 'bacnet' && !selectedDevice && (
          <div className="bacnet-container glass-panel" style={{ height: 'auto', flexGrow: 1 }}>
            <div className="page-header">
              <h2 className="page-title">BACnet / IP Settings</h2>
            </div>
            
            <div className="config-section">
              <div className="section-title">
                <Network size={20} />
                Network Configuration
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Local IP Address</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={bacnetConfig.ip}
                    onChange={(e) => setBacnetConfig({...bacnetConfig, ip: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Subnet Mask</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={bacnetConfig.subnet}
                    onChange={(e) => setBacnetConfig({...bacnetConfig, subnet: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>UDP Port</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={bacnetConfig.port}
                    onChange={(e) => setBacnetConfig({...bacnetConfig, port: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="button-primary">Save Network Settings</button>
              </div>
            </div>

            <div className="config-section" style={{ marginTop: '1rem' }}>
              <div className="section-title">
                <Search size={20} />
                Device Discovery
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Broadcast Who-Is request to discover BACnet devices.
                </span>
                <button 
                  className="button-primary" 
                  onClick={discoverDevices}
                  disabled={isDiscovering}
                >
                  {isDiscovering ? 'Discovering...' : 'Discover Devices'}
                </button>
              </div>
              
              {discoveredDevices.length > 0 && (
                <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Device Name</th>
                        <th>Device ID</th>
                        <th>IP Address</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discoveredDevices.map(device => {
                        const isAdded = bacnetDevices.some(d => d.id === device.id);
                        return (
                        <tr key={device.id}>
                          <td style={{ fontWeight: 500 }}>{device.name}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{device.id}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{device.ip}</td>
                          <td>
                            <span className={`device-status ${device.status === 'offline' ? 'offline' : ''}`}>
                              {device.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {isAdded ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Added</span>
                            ) : (
                              <button className="button-secondary" onClick={() => addDevice(device)}>
                                <Plus size={16} /> Add
                              </button>
                            )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="config-section" style={{ marginTop: '1rem', flexGrow: 1 }}>
              <div className="section-title">
                <Server size={20} />
                Registered Devices
              </div>
              {bacnetDevices.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No BACnet devices have been added yet. Discover and add devices above.
                </div>
              ) : (
                <div className="device-card-grid">
                  {bacnetDevices.map(device => (
                    <div className="device-card" key={device.id} onClick={() => setSelectedDevice(device)}>
                      <div className="device-card-header">
                        <span className="device-card-title">{device.name}</span>
                        <span className={`device-status ${device.status === 'offline' ? 'offline' : ''}`}>
                          {device.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="device-card-subtitle">Device ID: {device.id} &bull; {device.ip}</div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-weather)' }}>
                        {device.points.length} Objects Discovered &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BACNET DEVICE DETAILS PAGE */}
        {activeTab === 'bacnet' && selectedDevice && (
          <div className="bacnet-container glass-panel" style={{ height: 'auto', flexGrow: 1 }}>
             <div className="device-detail-header">
               <button className="back-button" onClick={() => setSelectedDevice(null)}>
                 <ArrowLeft size={24} />
               </button>
               <div>
                 <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>{selectedDevice.name}</h2>
                 <div className="device-card-subtitle" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <span>Device ID: {selectedDevice.id}</span>
                   <span>IP: {selectedDevice.ip}</span>
                   <span className={`device-status ${selectedDevice.status === 'offline' ? 'offline' : ''}`} style={{ padding: '0.1rem 0.5rem', fontSize: '0.65rem' }}>
                    {selectedDevice.status.toUpperCase()}
                   </span>
                 </div>
               </div>
             </div>

             <div className="config-section">
               <div className="section-title">
                 Object List
               </div>
               
               {selectedDevice.status === 'offline' && (
                 <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', margin: '1rem 0' }}>
                   Device is currently offline. Values below are last known reading.
                 </div>
               )}

               <div className="point-grid">
                 {/* Re-find the active device to get real-time updating point values */}
                 {(bacnetDevices.find(d => d.id === selectedDevice.id)?.points || selectedDevice.points).map(point => (
                   <div className="point-card" key={point.id}>
                     <div className="point-header">
                       <span>{point.name}</span>
                       <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{point.id}</span>
                     </div>
                     <div className="point-value" style={{ color: point.value === 'ON' ? '#4ade80' : point.value === 'OFF' ? '#f87171' : 'var(--text-main)' }}>
                       {point.value} <span className="unit">{point.unit}</span>
                     </div>
                   </div>
                 ))}
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
