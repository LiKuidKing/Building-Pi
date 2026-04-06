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
  ArrowLeft,
  Star,
  Trash2,
  X
} from 'lucide-react';
import './index.css';

// ─── Sparkline SVG helper ────────────────────────────────────────────────────
function Sparkline({ data, color = '#0ea5e9' }) {
  if (!data || data.length < 2) return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '0.5rem' }}>Waiting for data…</div>;
  const W = 200; const H = 60;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4)
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '60px', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color} />
    </svg>
  );
}

// ─── Widget Settings Modal ────────────────────────────────────────────────────
function WidgetSettingsModal({ favorite, onSave, onRemove, onClose }) {
  const [form, setForm] = useState({ ...favorite });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>Widget Settings</span>
          <button className="favorite-star" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Display Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Widget Type</label>
            <select className="input-field" value={form.displayType} onChange={e => setForm({...form, displayType: e.target.value})} style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}>
              <option value="value">Value — Large numeric display</option>
              <option value="percent">Percent — Progress bar</option>
              <option value="graph">Graph — Rolling sparkline</option>
            </select>
          </div>
          <div className="form-group">
            <label>Custom Unit (e.g. °F, kW, %)</label>
            <input className="input-field" placeholder="Leave blank to use BACnet unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
          </div>
          {form.displayType === 'percent' && (
            <div className="form-group">
              <label>Max Value (for 100%)</label>
              <input className="input-field" type="number" value={form.maxValue} onChange={e => setForm({...form, maxValue: e.target.value})} />
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="button-secondary" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }} onClick={onRemove}>
            <Trash2 size={14} /> Remove
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button-secondary" onClick={onClose}>Cancel</button>
            <button className="button-primary" onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BACnet Write Value Modal ────────────────────────────────────────────────
function WriteValueModal({ point, device, onSave, onClose }) {
  const isBinary = [3, 4, 5].includes(point.objectId.type);
  const [newValue, setNewValue] = useState(isBinary ? (point.value === 'ON') : point.value);
  const [priority, setPriority] = useState(16);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(device, point, newValue, priority);
      onClose();
    } catch (e) {
      alert(`Write failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <span>Edit {point.name}</span>
          <button className="favorite-star" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>New Value {point.unit && `(${point.unit})`}</label>
            {isBinary ? (
              <select 
                className="input-field" 
                value={newValue ? 'ON' : 'OFF'} 
                onChange={e => setNewValue(e.target.value === 'ON')}
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
              >
                <option value="OFF">OFF / Inactive (0)</option>
                <option value="ON">ON / Active (1)</option>
              </select>
            ) : (
              <input 
                type="number" 
                className="input-field" 
                value={newValue} 
                onChange={e => setNewValue(e.target.value)} 
                autoFocus
              />
            )}
          </div>
          <div className="form-group">
            <label>Priority (1-16, Default 16)</label>
            <input 
              type="number" 
              className="input-field" 
              min="1" max="16" 
              value={priority} 
              onChange={e => setPriority(e.target.value)} 
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Lower numbers have higher precedence in BACnet.</small>
          </div>
        </div>
        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="button-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Writing...' : 'Write Property'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [history] = useState(initialHistory);
  const [elecPrice, setElecPrice] = useState(0.12);

  // BACnet State — initialized from localStorage
  const [bacnetConfig, setBacnetConfig] = useState({ ip: '192.168.1.100', subnet: '255.255.255.0', port: '47808' });
  const [bacnetDevices, setBacnetDevices] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bacnetDevices') || '[]'); } catch { return []; }
  });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Favorites — dashboard widgets pinned from BACnet points
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bacnetFavorites') || '[]'); } catch { return []; }
  });
  // Rolling history for graph widgets: { [favoriteId]: number[] }
  const [pointHistories, setPointHistories] = useState({});
  const [editingFavorite, setEditingFavorite] = useState(null);

  // Modbus State
  const [modbusConfig, setModbusConfig] = useState({ path: '', baudRate: 9600, id: 1 });
  const [modbusPorts, setModbusPorts] = useState([]);
  const [modbusData, setModbusData] = useState({ connected: false, power: 0 });
  const [isConnectingModbus, setIsConnectingModbus] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null); // { device, point }

  const toggleModbusConnection = async () => {
    setIsConnectingModbus(true);
    try {
      if (modbusData.connected) {
        await fetch('/api/modbus/disconnect', { method: 'POST' });
        // Assume disconnected immediately to avoid UI delay
        setModbusData(prev => ({ ...prev, connected: false }));
      } else {
        const res = await fetch('/api/modbus/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modbusConfig)
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        // Connect successful, polling will pick up the 'connected' state shortly
      }
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setIsConnectingModbus(false);
    }
  };

  const discoverDevices = async () => {
    setIsDiscovering(true);
    setDiscoveredDevices([]);
    try {
      const qs = new URLSearchParams({ ip: bacnetConfig.ip, port: bacnetConfig.port });
      const res = await fetch(`/api/bacnet/discover?${qs.toString()}`);
      if (res.ok) {
        const devices = await res.json();
        setDiscoveredDevices(devices);
      }
    } catch (e) {
      console.error('Discover error:', e);
      alert('Error connecting to BACnet service');
    } finally {
      setIsDiscovering(false);
    }
  };

  const writePointValue = async (device, point, value, priority) => {
    try {
      const qs = new URLSearchParams({ localIp: bacnetConfig.ip, localPort: bacnetConfig.port });
      const res = await fetch(`/api/bacnet/device/${device.ip}/write?${qs.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectId: point.objectId,
          value,
          priority: parseInt(priority)
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Optimistically update the UI before next poll
      setBacnetDevices(current => current.map(d => {
        if (d.id !== device.id) return d;
        return {
          ...d,
          points: d.points.map(p => {
            if (p.id !== point.id) return p;
            let displayVal = value;
            if ([3, 4, 5].includes(p.objectId.type)) {
              displayVal = value ? 'ON' : 'OFF';
            } else if (typeof value === 'string' || typeof value === 'number') {
              displayVal = parseFloat(value).toFixed(1);
            }
            return { ...p, value: String(displayVal) };
          })
        };
      }));

    } catch (e) {
      console.error('Write error:', e);
      throw e;
    }
  };

  const addDevice = async (device) => {
    if (!bacnetDevices.find(d => d.id === device.id)) {
      try {
        const qs = new URLSearchParams({ localIp: bacnetConfig.ip, localPort: bacnetConfig.port });
        const res = await fetch(`/api/bacnet/device/${device.ip}/${device.id}/objects?${qs.toString()}`);
        
        let initialPoints = [];
        if (res.ok) {
          initialPoints = await res.json();
        }

        const newDevice = { ...device, points: initialPoints };
        setBacnetDevices(prev => [...prev, newDevice]);
      } catch (e) {
        console.error('Add device error:', e);
      }
    }
  };

  const deleteDevice = (deviceId) => {
    setBacnetDevices(prev => prev.filter(d => d.id !== deviceId));
    // Also remove any favorites tied to this device
    setFavorites(prev => prev.filter(f => f.deviceId !== deviceId));
    if (selectedDevice?.id === deviceId) setSelectedDevice(null);
  };

  // ─── Favorites helpers ───────────────────────────────────────────────
  const isFavorited = (deviceId, pointId) =>
    favorites.some(f => f.deviceId === deviceId && f.pointId === pointId);

  const toggleFavorite = (device, point) => {
    const key = `${device.id}_${point.id}`;
    if (isFavorited(device.id, point.id)) {
      setFavorites(prev => prev.filter(f => f.id !== key));
    } else {
      setFavorites(prev => [...prev, {
        id: key,
        deviceId: device.id,
        deviceName: device.name,
        pointId: point.id,
        name: point.name,
        displayType: 'value',
        unit: point.unit || '',
        maxValue: 100,
      }]);
    }
  };

  const saveFavoriteSettings = (updatedFav) => {
    setFavorites(prev => prev.map(f => f.id === updatedFav.id ? updatedFav : f));
    setEditingFavorite(null);
  };

  const removeFavorite = (favId) => {
    setFavorites(prev => prev.filter(f => f.id !== favId));
    setEditingFavorite(null);
  };

  // ─── Get current value for a favorite from live device data ─────────
  const getFavoriteValue = (fav) => {
    const device = bacnetDevices.find(d => String(d.id) === String(fav.deviceId));
    if (!device) return null;
    const point = device.points.find(p => String(p.id) === String(fav.pointId));
    return point?.value ?? null;
  };

  // Automatically fetch the Pi's actual IP address ONLY once on mount
  useEffect(() => {
    fetch('/api/network/ip')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setBacnetConfig(prev => ({ ...prev, ip: data.ip }));
        }
      })
      .catch(e => console.error("Could not fetch local network IP:", e));
  }, []);

  // Persist devices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bacnetDevices', JSON.stringify(bacnetDevices));
  }, [bacnetDevices]);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bacnetFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Roll history for graph-mode favorites
  useEffect(() => {
    favorites.forEach(fav => {
      if (fav.displayType !== 'graph') return;
      const val = getFavoriteValue(fav);
      if (val === null || val === undefined || typeof val === 'string') return;
      const num = parseFloat(val);
      if (isNaN(num)) return;
      setPointHistories(prev => {
        const existing = prev[fav.id] || [];
        const updated = [...existing, num].slice(-30);
        return { ...prev, [fav.id]: updated };
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bacnetDevices]);

  // Data simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate power consumption ONLY if Modbus is NOT providing live data
      if (!modbusData.connected) {
        setPower(prev => Math.max(0, +(prev + (Math.random() - 0.5)).toFixed(1)));
      }

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

    return () => {
      clearInterval(interval);
    };
  }, [batteryPower, modbusData.connected]);

  // Fetch Modbus Ports
  useEffect(() => {
    if (activeTab === 'modbus') {
      fetch('/api/modbus/ports')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setModbusPorts(data);
            if (data.length > 0 && !modbusConfig.path) {
              setModbusConfig(prev => ({ ...prev, path: data[0].path }));
            }
          } else {
            console.error('Invalid modbus ports data:', data);
            setModbusPorts([]);
          }
        })
        .catch(err => {
          console.error('Error fetching modbus ports', err);
          setModbusPorts([]);
        });
    }
  }, [activeTab]); // Removed modbusConfig.path from dependencies to avoid loop, it's just initial setup

  // Modbus Data Polling
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetch('/api/modbus/data')
        .then(res => res.json())
        .then(data => {
          setModbusData(data);
          if (data.connected && data.power !== undefined && data.power > 0) {
             setPower(data.power);
          }
        })
        .catch(console.error);
    }, 2000);
    return () => clearInterval(pollInterval);
  }, []);

  // Poll real-time BACnet data updates natively from the backend API for registered devices
  useEffect(() => {
    const bacnetInterval = setInterval(async () => {
      if (bacnetDevices.length === 0) return;

      // Capture current device IDs and data for polling
      const devicesToRead = bacnetDevices.map(d => ({
        id: d.id,
        ip: d.ip,
        status: d.status,
        points: d.points
      }));

      // Fire all reads in parallel
      const readResults = await Promise.all(devicesToRead.map(async (device) => {
        if (device.status === 'offline') return { id: device.id, results: null };

        try {
          const qs = new URLSearchParams({ localIp: bacnetConfig.ip, localPort: bacnetConfig.port });
          const objectsToRead = device.points.map(p => p.objectId);
          if (objectsToRead.length === 0) return { id: device.id, results: null };

          const res = await fetch(`/api/bacnet/device/${device.ip}/read?${qs.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objectsToRead)
          });

          if (res.ok) {
            const results = await res.json();
            return { id: device.id, results };
          }
        } catch (e) {
          console.error(`Error reading data from ${device.ip}:`, e);
        }
        return { id: device.id, results: null };
      }));

      // Use functional setState so we only update devices that STILL exist in state.
      // This prevents deleted devices from being re-added by stale async callbacks.
      setBacnetDevices(currentDevices =>
        currentDevices.map(device => {
          const resultForDevice = readResults.find(r => String(r.id) === String(device.id));
          if (!resultForDevice || !resultForDevice.results) return device;

          const newPoints = device.points.map(p => {
            const matched = resultForDevice.results.find(r => r.type === p.objectId.type && r.instance === p.objectId.instance);
            return matched ? { ...p, value: matched.value } : p;
          });
          return { ...device, points: newPoints };
        })
      );
    }, 4000);

    return () => clearInterval(bacnetInterval);
  }, [bacnetDevices, bacnetConfig]);

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
            className={`nav-item ${activeTab === 'modbus' ? 'active' : ''}`}
            onClick={() => setActiveTab('modbus')}
            title="Modbus Integration"
          >
            <Server size={20} style={{ flexShrink: 0 }} />
            <span className="nav-text">Modbus</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto', paddingRight: '0.25rem' }}>
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

          {/* ─── BACnet Favorites on Overview ─────────────────────── */}
          {favorites.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {favorites.map(fav => {
            const displayType = fav.displayType || 'value';
            const rawVal = getFavoriteValue(fav);
            const numVal = parseFloat(rawVal);
            const displayVal = rawVal === null ? '—' : rawVal;
            const pct = displayType === 'percent' ? Math.min(100, Math.max(0, (numVal / parseFloat(fav.maxValue || 100)) * 100)) : 0;
            const accentColor = '#0ea5e9';
            return (
              <div className="glass-panel widget-custom" key={fav.id} style={{ border: '1px solid rgba(14,165,233,0.2)' }}>
                <div className="widget-header" style={{ marginBottom: '0.5rem' }}>
                  <div className="icon-wrapper" style={{ color: accentColor, boxShadow: `inset 0 0 10px rgba(14,165,233,0.2)` }}>
                    <Star size={18} fill={accentColor} color={accentColor} />
                  </div>
                  <span className="widget-title" style={{ flex: 1 }}>{fav.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fav.deviceName}</span>
                  <button className="widget-settings-btn" title="Widget Settings" onClick={() => setEditingFavorite(fav)}>
                    <Settings size={14} />
                  </button>
                </div>

                {displayType === 'value' && (
                  <div className="widget-body">
                    <div className="main-value" style={{ fontSize: '2.2rem', textShadow: `0 0 15px rgba(14,165,233,0.3)` }}>
                      {displayVal} <span className="unit">{fav.unit}</span>
                    </div>
                    <div className="sub-info">
                      <Activity size={14} color={accentColor} />
                      <span>Live BACnet value</span>
                    </div>
                  </div>
                )}

                {displayType === 'percent' && (
                  <div className="widget-body">
                    <div className="main-value" style={{ fontSize: '2.2rem', textShadow: `0 0 15px rgba(14,165,233,0.3)` }}>
                      {isNaN(pct) ? '—' : pct.toFixed(1)} <span className="unit">%</span>
                    </div>
                    <div className="sub-info" style={{ marginBottom: '0.4rem' }}>
                      <span>{isNaN(numVal) ? displayVal : `${numVal}${fav.unit ? ' ' + fav.unit : ''}`} of {fav.maxValue}{fav.unit ? ' ' + fav.unit : ''}</span>
                    </div>
                    <div className="battery-container">
                      <div className="battery-fill" style={{ width: `${isNaN(pct) ? 0 : pct}%`, background: `linear-gradient(90deg, #0284c7, #38bdf8)` }} />
                    </div>
                  </div>
                )}

                {displayType === 'graph' && (
                  <div className="widget-body">
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: accentColor }}>
                      {displayVal} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>{fav.unit}</span>
                    </div>
                    <div className="graph-container">
                      <Sparkline data={pointHistories[fav.id] || []} color={accentColor} />
                    </div>
                  </div>
                )}
              </div>
          );
          })}
          </div>
          )}
          </div>
        )}

        {editingFavorite && (
          <WidgetSettingsModal
            favorite={editingFavorite}
            onSave={saveFavoriteSettings}
            onRemove={() => removeFavorite(editingFavorite.id)}
            onClose={() => setEditingFavorite(null)}
          />
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
                <button className="button-primary" onClick={async () => {
                  try {
                    await fetch('/api/bacnet/reset', { method: 'POST' });
                    alert('Network settings saved. BACnet client will use the new IP on next action.');
                  } catch (e) {
                    alert('Error saving settings: ' + e.message);
                  }
                }}>Save Network Settings</button>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`device-status ${device.status === 'offline' ? 'offline' : ''}`}>
                            {device.status.toUpperCase()}
                          </span>
                          <button
                            className="favorite-star"
                            title="Delete Device"
                            style={{ color: '#f87171' }}
                            onClick={(e) => { e.stopPropagation(); if (confirm(`Remove device "${device.name}"?`)) deleteDevice(device.id); }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                  {(bacnetDevices.find(d => d.id === selectedDevice.id)?.points || selectedDevice.points).map(point => {
                    const favActive = isFavorited(selectedDevice.id, point.id);
                     const isWritable = [1, 2, 4, 5].includes(point.typeId);
                    return (
                    <div className={`point-card ${isWritable ? 'writable' : ''}`} key={point.id} onClick={() => isWritable && setEditingPoint({ device: selectedDevice, point })} title={isWritable ? "Click to edit value" : ""}>
                      <div className="point-header">
                        <span>{point.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{point.id}</span>
                          <button
                            className={`favorite-star ${favActive ? 'active' : ''}`}
                            title={favActive ? 'Remove from Overview' : 'Add to Overview'}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedDevice, point); }}
                          >
                            <Star size={14} fill={favActive ? '#facc15' : 'none'} />
                          </button>
                        </div>
                      </div>
                      <div className="point-value-container">
                        <div className="point-value" style={{ color: point.value === 'ON' ? '#4ade80' : point.value === 'OFF' ? '#f87171' : 'var(--text-main)' }}>
                          {point.value} <span className="unit">{point.unit}</span>
                        </div>
                        {isWritable && (
                          <div className="edit-indicator">
                            <Wrench size={10} /> EDIT
                          </div>
                        )}
                       </div>
                    </div>
                    );
                  })}
                </div>
             </div>
          </div>
        )}

        {/* MODBUS PAGE */}
        {activeTab === 'modbus' && (
          <div className="bacnet-container glass-panel" style={{ height: 'auto', flexGrow: 1 }}>
            <div className="page-header">
              <h2 className="page-title">Modbus RS485 Settings</h2>
            </div>
            
            <div className="config-section">
              <div className="section-title">
                <Server size={20} />
                Connection Configuration
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Serial Port</label>
                  <select 
                    className="input-field"
                    value={modbusConfig.path || ''}
                    onChange={(e) => setModbusConfig({...modbusConfig, path: e.target.value})}
                    disabled={modbusData.connected}
                  >
                    <option value="" disabled>Select Port</option>
                    {modbusPorts.map(p => (
                      <option key={p.path} value={p.path}>{p.path} ({p.manufacturer || 'Unknown'})</option>
                    ))}
                    {modbusPorts.length === 0 && <option value="custom">No ports detected</option>}
                  </select>
                </div>
                <div className="form-group">
                  <label>Baud Rate</label>
                  <select 
                    className="input-field"
                    value={modbusConfig.baudRate}
                    onChange={(e) => setModbusConfig({...modbusConfig, baudRate: e.target.value})}
                    disabled={modbusData.connected}
                  >
                    <option value="9600">9600 bps</option>
                    <option value="19200">19200 bps</option>
                    <option value="38400">38400 bps</option>
                    <option value="57600">57600 bps</option>
                    <option value="115200">115200 bps</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>WattNode Server ID (1-255)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={modbusConfig.id}
                    onChange={(e) => setModbusConfig({...modbusConfig, id: e.target.value})}
                    disabled={modbusData.connected}
                    min="1" max="255"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Status: 
                  <span className={`device-status ${!modbusData.connected ? 'offline' : ''}`}>
                    {modbusData.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <button 
                  className={modbusData.connected ? "button-secondary" : "button-primary"}
                  onClick={toggleModbusConnection}
                  disabled={isConnectingModbus || (!modbusConfig.path && modbusConfig.path !== 'custom')}
                >
                  {isConnectingModbus ? 'Processing...' : (modbusData.connected ? 'Disconnect' : 'Connect')}
                </button>
              </div>
            </div>
            
            <div className="config-section" style={{ marginTop: '1rem', flexGrow: 1 }}>
              <div className="section-title">
                <Activity size={20} />
                Live Data Feed
              </div>
              {modbusData.connected ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {/* Total Power */}
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.3)', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Activity size={24} color="#4ade80" />
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Total Real Power</span>
                    </div>
                    <span style={{ fontSize: '1.75rem', color: '#4ade80', fontWeight: 'bold' }}>
                      {modbusData.powerTotal ? (modbusData.powerTotal / 1000).toFixed(2) : '0.00'} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>kW</span>
                    </span>
                  </div>
                  
                  {/* Phase A */}
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontWeight: 'bold', color: '#facc15' }}>Phase A</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Voltage:</span> <span>{modbusData.voltageA?.toFixed(1) || '0.0'} V</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', margin: '8px 0' }}><span>Current:</span> <span>{modbusData.currentA?.toFixed(2) || '0.00'} A</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Power:</span> <span>{modbusData.powerA ? (modbusData.powerA / 1000).toFixed(2) : '0.00'} kW</span></div>
                  </div>

                  {/* Phase B */}
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontWeight: 'bold', color: '#f87171' }}>Phase B</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Voltage:</span> <span>{modbusData.voltageB?.toFixed(1) || '0.0'} V</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', margin: '8px 0' }}><span>Current:</span> <span>{modbusData.currentB?.toFixed(2) || '0.00'} A</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Power:</span> <span>{modbusData.powerB ? (modbusData.powerB / 1000).toFixed(2) : '0.00'} kW</span></div>
                  </div>

                  {/* Phase C */}
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontWeight: 'bold', color: '#60a5fa' }}>Phase C</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Voltage:</span> <span>{modbusData.voltageC?.toFixed(1) || '0.0'} V</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', margin: '8px 0' }}><span>Current:</span> <span>{modbusData.currentC?.toFixed(2) || '0.00'} A</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Power:</span> <span>{modbusData.powerC ? (modbusData.powerC / 1000).toFixed(2) : '0.00'} kW</span></div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <span style={{ color: 'var(--text-muted)' }}>Connect to Modbus device to view live phase data.</span>
                </div>
              )}
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


         {editingPoint && (
           <WriteValueModal
             point={editingPoint.point}
             device={editingPoint.device}
             onSave={writePointValue}
             onClose={() => setEditingPoint(null)}
           />
         )}
      </main>
    </div>
  );
}

export default App;
