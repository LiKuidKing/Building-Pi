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

// ─── BACnet Engineering Units Lookup (ASHRAE 135 Enum ID → Display Symbol) ───
const BACNET_UNITS = {
  0: 'm²', 1: 'ft²', 2: 'mA', 3: 'A', 4: 'Ω', 5: 'V', 6: 'kV', 7: 'MV',
  8: 'VA', 9: 'kVA', 10: 'MVA', 11: 'var', 12: 'kvar', 13: 'Mvar',
  14: '°', 15: 'PF', 16: 'J', 17: 'kJ', 18: 'Wh', 19: 'kWh',
  20: 'Btu', 21: 'therm', 22: 'ton-h', 23: 'J/kg', 24: 'Btu/lb',
  25: 'cph', 26: 'cpm', 27: 'Hz', 28: 'g/kg', 29: '%RH',
  30: 'mm', 31: 'Pa', 32: 'hPa', 33: 'kPa', 34: 'mbar',
  35: 'bar',
  36: 'lm', 37: 'lx', 38: 'fc',
  39: 'kg', 40: 'lb', 41: 'ton',
  42: 'kg/s', 43: 'kg/min', 44: 'kg/h',
  45: 'lb/min', 46: 'lb/h',
  47: 'W', 48: 'kW', 49: 'MW', 50: 'Btu/h', 51: 'hp', 52: 'ton',
  53: 'Pa', 54: 'kPa', 55: 'bar', 56: 'psi',
  57: 'cmH₂O', 58: 'inH₂O', 59: 'mmHg', 60: 'cmHg', 61: 'inHg',
  62: '°C', 63: 'K', 64: '°F',
  65: '°C-days', 66: '°F-days',
  67: 'yr', 68: 'mo', 69: 'wk', 70: 'd', 71: 'h', 72: 'min', 73: 's',
  74: 'm/s', 75: 'km/h', 76: 'ft/s', 77: 'ft/min', 78: 'mph',
  79: 'ft³', 80: 'm³', 81: 'Imp gal', 82: 'L', 83: 'US gal',
  84: 'cfm', 85: 'm³/s', 86: 'Imp gal/min', 87: 'L/s', 88: 'L/min', 89: 'US gal/min',
  90: '°', 91: '°C/h', 92: '°C/min', 93: '°F/h', 94: '°F/min',
  95: '', // NO_UNITS
  96: 'ppm', 97: 'ppb', 98: '%', 99: '%/s', 100: '/min', 101: '/s',
  102: 'psi/°F', 103: 'rad', 104: 'RPM',
  105: '¤1', 106: '¤2', 107: '¤3', 108: '¤4', 109: '¤5',
  110: '¤6', 111: '¤7', 112: '¤8', 113: '¤9', 114: '¤10',
  115: 'in²', 116: 'cm²', 117: 'Btu/lb', 118: 'cm',
  119: 'lb/s', 120: 'Δ°F', 121: 'ΔK',
  122: 'kΩ', 123: 'MΩ', 124: 'mV', 125: 'kJ/kg', 126: 'MJ',
  127: 'J/K', 128: 'J/(kg·K)', 129: 'kHz', 130: 'MHz', 131: '/h',
  132: 'mW', 133: 'hPa', 134: 'mbar', 135: 'm³/h', 136: 'L/h',
  137: 'kWh/m²', 138: 'kWh/ft²', 139: 'MJ/m²', 140: 'MJ/ft²',
  141: 'W/(m²·K)', 142: 'ft³/s', 143: '%obs/ft', 144: '%obs/m',
  145: 'mΩ', 146: 'MWh', 147: 'kBtu', 148: 'MBtu',
  149: 'kJ/kg-da', 150: 'MJ/kg-da', 151: 'kJ/K', 152: 'MJ/K',
  153: 'N', 154: 'g/s', 155: 'g/min', 156: 'ton/h',
  157: 'kBtu/h', 158: '×0.01s', 159: 'ms', 160: 'N·m',
  161: 'mm/s', 162: 'mm/min', 163: 'm/min', 164: 'm/h', 165: 'm³/min',
  166: 'm/s²', 167: 'A/m', 168: 'A/m²', 169: 'A·m²',
  170: 'F', 171: 'H', 172: 'Ω·m', 173: 'S', 174: 'S/m', 175: 'T',
  176: 'V/K', 177: 'V/m', 178: 'Wb',
  179: 'cd', 180: 'cd/m²', 181: 'K/h', 182: 'K/min',
  183: 'J·s', 184: 'rad/s', 185: 'm²/N',
  186: 'kg/m³', 187: 'N·s', 188: 'N/m', 189: 'W/(m·K)',
  190: 'µS', 191: 'ft³/h', 192: 'US gal/h', 193: 'km',
  194: 'µm', 195: 'g', 196: 'mg', 197: 'mL', 198: 'mL/s',
  199: 'dB', 200: 'dBmV', 201: 'dBV', 202: 'mS',
  203: 'varh', 204: 'kvarh', 205: 'Mvarh',
  206: 'mmH₂O', 207: '‰',
  208: 'g/g', 209: 'kg/kg', 210: 'g/kg', 211: 'mg/g', 212: 'mg/kg',
  213: 'g/mL', 214: 'g/L', 215: 'mg/L', 216: 'µg/L',
  217: 'g/m³', 218: 'mg/m³', 219: 'µg/m³', 220: 'ng/m³', 221: 'g/cm³',
  222: 'Bq', 223: 'kBq', 224: 'MBq',
  225: 'Gy', 226: 'mGy', 227: 'µGy',
  228: 'Sv', 229: 'mSv', 230: 'µSv', 231: 'µSv/h',
  232: 'dBA', 233: 'NTU', 234: 'pH',
  235: 'g/m²', 236: 'min/K',
  237: 'Ω·m²/m', 238: 'A·s',
  239: 'VAh', 240: 'kVAh', 241: 'MVAh',
  242: 'varh', 243: 'kvarh', 244: 'Mvarh',
  245: 'V²h', 246: 'A²h', 247: 'J/h',
  248: 'ft³/d', 249: 'm³/d', 250: 'Wh/m³', 251: 'J/m³',
  252: 'mol%', 253: 'Pa·s', 254: 'MMscfm',
};

/**
 * Resolves a BACnet unit enum ID to its display symbol.
 * Returns empty string for unknown/no-units.
 */
function getBacnetUnitSymbol(unitId) {
  if (unitId === null || unitId === undefined) return '';
  return BACNET_UNITS[unitId] ?? '';
}


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
  
  // Live Weather State
  const [weather, setWeather] = useState({ temperatureF: '--', temperature: '--', weathercode: null, isLoaded: false });

  // BACnet State — initialized from backend persistence API
  const [bacnetConfig, setBacnetConfig] = useState({ ip: '192.168.1.100', subnet: '255.255.255.0', port: '47808' });
  const [bacnetDevices, setBacnetDevices] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Favorites — dashboard widgets pinned from BACnet points
  const [favorites, setFavorites] = useState([]);
  // Rolling history for graph widgets: { [favoriteId]: number[] }
  const [pointHistories, setPointHistories] = useState({});
  const [editingFavorite, setEditingFavorite] = useState(null);

  // Modbus State
  const [modbusConfig, setModbusConfig] = useState({ path: '', baudRate: 9600, id: 1 });
  const [modbusPorts, setModbusPorts] = useState([]);
  const [modbusData, setModbusData] = useState({ connected: false, power: 0 });
  const [isConnectingModbus, setIsConnectingModbus] = useState(false);
  const [ctAmpsInput, setCtAmpsInput] = useState('');
  const [ptRatioInput, setPtRatioInput] = useState('');
  const [editingPoint, setEditingPoint] = useState(null); // { device, point }

  const toggleModbusConnection = async () => {
    setIsConnectingModbus(true);
    try {
      if (modbusData.connected) {
        await fetch('/api/modbus/disconnect', { method: 'POST' });
        setModbusData(prev => ({ ...prev, connected: false }));
      } else {
        const res = await fetch('/api/modbus/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modbusConfig)
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
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
        const updatedDevices = [...bacnetDevices, newDevice];
        setBacnetDevices(updatedDevices);
        
        // Save to backend persistent store
        await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDevices)
        });
      } catch (e) {
        console.error('Add device error:', e);
      }
    }
  };

  const deleteDevice = async (deviceId) => {
    const updated = bacnetDevices.filter(d => d.id !== deviceId);
    setBacnetDevices(updated);
    
    const updatedFavs = favorites.filter(f => f.deviceId !== deviceId);
    setFavorites(updatedFavs);
    if (selectedDevice?.id === deviceId) setSelectedDevice(null);

    try {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete device from server:', e);
    }
  };

  // ─── Favorites helpers ───────────────────────────────────────────────
  const isFavorited = (deviceId, pointId) =>
    favorites.some(f => f.deviceId === deviceId && f.pointId === pointId);

  const saveFavoritesToServer = async (newFavs) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFavs)
      });
    } catch (e) {
      console.error('Failed to sync favorites to server:', e);
    }
  };

  const toggleFavorite = (device, point) => {
    const key = `${device.id}_${point.id}`;
    let newFavs;
    if (isFavorited(device.id, point.id)) {
      newFavs = favorites.filter(f => f.id !== key);
    } else {
      newFavs = [...favorites, {
        id: key,
        deviceId: device.id,
        deviceName: device.name,
        pointId: point.id,
        name: point.name,
        displayType: 'value',
        unit: point.unit || getBacnetUnitSymbol(point.unitId),
        maxValue: 100,
      }];
    }
    setFavorites(newFavs);
    saveFavoritesToServer(newFavs);
  };

  const saveFavoriteSettings = (updatedFav) => {
    const newFavs = favorites.map(f => f.id === updatedFav.id ? updatedFav : f);
    setFavorites(newFavs);
    saveFavoritesToServer(newFavs);
    setEditingFavorite(null);
  };

  const removeFavorite = (favId) => {
    const newFavs = favorites.filter(f => f.id !== favId);
    setFavorites(newFavs);
    saveFavoritesToServer(newFavs);
    setEditingFavorite(null);
  };

  // ─── Get current value for a favorite from live device data ─────────
  const getFavoriteValue = (fav) => {
    const device = bacnetDevices.find(d => String(d.id) === String(fav.deviceId));
    if (!device) return null;
    const point = device.points.find(p => String(p.id) === String(fav.pointId));
    return point?.value ?? null;
  };

  // Helper to find a specific BACnet point across all devices (for Thermelect dashboard cards)
  const findBacnetPointByName = (nameKeywords) => {
    for (const d of bacnetDevices) {
      for (const p of d.points) {
        const lower = p.name ? p.name.toLowerCase() : '';
        if (nameKeywords.some(kw => lower.includes(kw.toLowerCase()))) {
          return p;
        }
      }
    }
    return null;
  };

  // Automatically fetch Pi IP, stored devices, stored favorites, and live weather on mount
  useEffect(() => {
    // 1. Fetch IP
    fetch('/api/network/ip')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setBacnetConfig(prev => ({ ...prev, ip: data.ip }));
        }
      })
      .catch(e => console.error("Could not fetch local network IP:", e));

    // 2. Fetch persistent devices
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBacnetDevices(data);
      })
      .catch(e => console.error("Could not load stored devices:", e));

    // 3. Fetch persistent favorites
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFavorites(data);
      })
      .catch(e => console.error("Could not load stored favorites:", e));

    // 4. Fetch live outdoor weather
    const loadWeather = () => {
      fetch('/api/weather')
        .then(res => res.json())
        .then(data => {
          if (data && data.temperatureF !== undefined) {
            setWeather({ ...data, isLoaded: true });
          }
        })
        .catch(e => console.error("Could not fetch weather:", e));
    };
    loadWeather();
    const weatherTimer = setInterval(loadWeather, 300000); // 5 min interval

    return () => clearInterval(weatherTimer);
  }, []);

  // Sync device changes to backend store whenever points refresh
  useEffect(() => {
    if (bacnetDevices.length > 0) {
      fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bacnetDevices)
      }).catch(e => console.error("Sync devices error:", e));
    }
  }, [bacnetDevices]);

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

            {/* Facility Load Widget (Bound to Real Modbus Total Power) */}
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
                  {modbusData.connected 
                    ? (modbusData.powerTotal ? (modbusData.powerTotal / 1000).toFixed(1) : modbusData.power.toFixed(1)) 
                    : '0.0'} <span className="unit">kW</span>
                </div>
                <div className="sub-info">
                  <Activity size={16} color={modbusData.connected ? "#22c55e" : "#94a3b8"} />
                  <span>
                    {modbusData.connected ? (
                      <span style={{ color: '#22c55e' }}>Live Modbus RTU Load</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Modbus Disconnected</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Thermal Storage / Core Temp Widget (Bound to BACnet Thermelect Points) */}
            {(() => {
              const coreTempPoint = findBacnetPointByName(['core temp top', 'core top temp', 'core temp mid', 'thermal storage']);
              const displayVal = coreTempPoint ? coreTempPoint.value : '---';
              const unit = coreTempPoint ? (coreTempPoint.unit || getBacnetUnitSymbol(coreTempPoint.unitId)) : '°C';
              const numVal = parseFloat(displayVal);
              const isPercent = unit === '%' || displayVal.includes('%');
              const pct = isPercent && !isNaN(numVal) ? Math.min(100, Math.max(0, numVal)) : null;

              return (
                <div className="glass-panel battery">
                  <div className="widget-header">
                    <div className="icon-wrapper">
                      <BatteryCharging size={24} />
                    </div>
                    <span className="widget-title">Thermal Storage</span>
                  </div>
                  <div className="widget-body">
                    <div className="main-value">
                      {displayVal} <span className="unit">{unit}</span>
                    </div>
                    {pct !== null ? (
                      <div className="battery-container" style={{ marginTop: '0.5rem' }}>
                        <div className="battery-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }}></div>
                      </div>
                    ) : (
                      <div className="sub-info" style={{ marginTop: '0.5rem' }}>
                        <Activity size={16} color="#38bdf8" />
                        <span>{coreTempPoint ? coreTempPoint.name : 'Connect Thermelect BACnet unit'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Thermelect Equipment Status Card */}
            {(() => {
              const blowerPoint = findBacnetPointByName(['blower']);
              const pumpPoint = findBacnetPointByName(['pump']);
              const heatCallPoint = findBacnetPointByName(['heat call']);
              
              // Count active heating elements
              let activeElementsCount = 0;
              for (let i = 1; i <= 9; i++) {
                const el = findBacnetPointByName([`heating element ${i}`]);
                if (el && (el.value === 'ON' || el.value === '1' || el.value === true)) {
                  activeElementsCount++;
                }
              }

              const blowerOn = blowerPoint && (blowerPoint.value === 'ON' || blowerPoint.value === '1');
              const pumpOn = pumpPoint && (pumpPoint.value === 'ON' || pumpPoint.value === '1');
              const heatCallOn = heatCallPoint && (heatCallPoint.value === 'ON' || heatCallPoint.value === '1');

              return (
                <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                  <div className="widget-header">
                    <div className="icon-wrapper">
                      <Wrench size={20} color="#facc15" />
                    </div>
                    <span className="widget-title">Thermelect System Operating Status</span>
                  </div>
                  <div className="widget-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.25rem' }}>
                    
                    {/* Blower Tile */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Blower</div>
                      <span className={`device-status ${!blowerOn ? 'offline' : ''}`} style={{ background: blowerOn ? 'rgba(34, 197, 94, 0.2)' : undefined, color: blowerOn ? '#4ade80' : undefined }}>
                        {blowerPoint ? (blowerOn ? 'RUNNING' : 'OFF') : 'N/A'}
                      </span>
                    </div>

                    {/* Pump Tile */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pump</div>
                      <span className={`device-status ${!pumpOn ? 'offline' : ''}`} style={{ background: pumpOn ? 'rgba(34, 197, 94, 0.2)' : undefined, color: pumpOn ? '#4ade80' : undefined }}>
                        {pumpPoint ? (pumpOn ? 'RUNNING' : 'OFF') : 'N/A'}
                      </span>
                    </div>

                    {/* Heat Call Tile */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Heat Call</div>
                      <span className={`device-status ${!heatCallOn ? 'offline' : ''}`} style={{ background: heatCallOn ? 'rgba(250, 204, 21, 0.2)' : undefined, color: heatCallOn ? '#facc15' : undefined }}>
                        {heatCallPoint ? (heatCallOn ? 'ACTIVE' : 'IDLE') : 'N/A'}
                      </span>
                    </div>

                    {/* Heating Elements Tile */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Elements</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: activeElementsCount > 0 ? '#facc15' : 'var(--text-muted)' }}>
                        {activeElementsCount} / 9 ON
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Weather Forecast Widget (Bound to Live Open-Meteo API) */}
            <div className="glass-panel weather">
              <div className="widget-header">
                <div className="icon-wrapper">
                  <CloudSun size={24} />
                </div>
                <span className="widget-title">Local Climate</span>
              </div>
              <div className="widget-body">
                <div className="main-value">
                  {weather.isLoaded ? weather.temperatureF : '--'} <span className="unit">°F</span>
                </div>
                <div className="sub-info">
                  <span>
                    {weather.isLoaded ? `${weather.temperature} °C • Live Outdoor Ambient` : 'Loading Weather...'}
                  </span>
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
                          {point.value} <span className="unit">{point.unit || getBacnetUnitSymbol(point.unitId)}</span>
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
            
            {modbusData.connected && (
              <div className="config-section" style={{ marginTop: '1rem' }}>
                <div className="section-title">
                  <Wrench size={20} />
                  Meter Configuration
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Global Current Transformer (CT) Rating</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="input-field" 
                          placeholder={modbusData.ctAmps !== undefined ? `Current: ${modbusData.ctAmps}` : 'Loading...'}
                          value={ctAmpsInput}
                          onChange={(e) => setCtAmpsInput(e.target.value)}
                          style={{ maxWidth: '120px' }}
                        />
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>A</span>
                        <button className="button-primary" style={{ padding: '0.5rem 1rem' }} disabled={!ctAmpsInput} onClick={async () => {
                          try {
                            const res = await fetch('/api/modbus/ctamps', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ctAmps: ctAmpsInput })
                            });
                            const data = await res.json();
                            if (data.error) throw new Error(data.error);
                            setCtAmpsInput('');
                            alert('CT Amps successfully updated! The meter will now calculate power using ' + data.ctAmps + 'A.');
                          } catch(e) {
                            alert('Failed to update CT Amps: ' + e.message);
                          }
                        }}>
                          Write
                        </button>
                      </div>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                        Rated amperage of physical CTs. Currently reading: <strong style={{ color: 'var(--text-main)' }}>{modbusData.ctAmps !== undefined ? `${modbusData.ctAmps} A` : '—'}</strong>
                      </small>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Potential Transformer (PT) Ratio</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          step="0.1"
                          className="input-field" 
                          placeholder={modbusData.ptRatio !== undefined ? `Current: ${modbusData.ptRatio}` : 'Loading...'}
                          value={ptRatioInput}
                          onChange={(e) => setPtRatioInput(e.target.value)}
                          style={{ maxWidth: '120px' }}
                        />
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Ratio</span>
                        <button className="button-primary" style={{ padding: '0.5rem 1rem' }} disabled={!ptRatioInput} onClick={async () => {
                          try {
                            const res = await fetch('/api/modbus/ptratio', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ptRatio: ptRatioInput })
                            });
                            const data = await res.json();
                            if (data.error) throw new Error(data.error);
                            setPtRatioInput('');
                          } catch(e) {
                            alert('Failed to update PT Ratio: ' + e.message);
                          }
                        }}>
                          Write
                        </button>
                      </div>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                        Currently reading: <strong style={{ color: 'var(--text-main)' }}>{modbusData.ptRatio !== undefined ? `${modbusData.ptRatio}` : '—'}</strong> (Default is 1.0)
                      </small>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>CT Polarity Reversal (InvertCt)</label>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                      If a CT is installed backwards (reading negative power), you can correct its polarity here without physical rewiring.
                    </small>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {[0, 1, 2].map(bit => {
                         const phase = ['A', 'B', 'C'][bit];
                         const isReversed = modbusData.invertCt !== undefined ? (modbusData.invertCt & (1 << bit)) !== 0 : false;
                         return (
                           <div key={phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: `1px solid ${isReversed ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`, flex: 1 }}>
                             <span style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Phase {phase}</span>
                             <button
                               className={isReversed ? 'button-primary' : 'button-secondary'}
                               style={isReversed ? { background: '#ef4444', borderColor: '#ef4444' } : {}}
                               onClick={async () => {
                                 if (modbusData.invertCt === undefined) return;
                                 const newVal = isReversed ? (modbusData.invertCt & ~(1 << bit)) : (modbusData.invertCt | (1 << bit));
                                 try {
                                    const res = await fetch('/api/modbus/invertct', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ invertCt: newVal }) });
                                    const data = await res.json();
                                    if (data.error) throw new Error(data.error);
                                 } catch(e) { alert('Failed: ' + e.message); }
                               }}
                             >
                               {isReversed ? 'Reversed' : 'Normal'}
                             </button>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
