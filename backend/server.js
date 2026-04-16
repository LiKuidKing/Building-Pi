import express from 'express';
import cors from 'cors';
import bacnet from 'node-bacnet';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { SerialPort } from 'serialport';
import ModbusRTU from 'modbus-serial';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3001);

app.use(cors());
app.use(express.json());

// Serve static compiled front-end files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Maintain a singleton BACnet client
let client = null;
let currentConfig = { ip: null, port: 47808 };

function getClient(ip, clientPort) {
  // Try to use existing client if config matches
  if (client && currentConfig.ip === ip && currentConfig.port === clientPort) {
    return client;
  }
  
  // Close old client if exists
  if (client) {
    try {
      client.removeAllListeners();
      client.close();
    } catch (e) {
      console.error('Error closing old client', e);
    }
    client = null;
  }

  console.log(`Initializing BACnet client on ${ip || 'default interface'}:${clientPort || 47808}`);
  
  currentConfig = { ip, port: clientPort || 47808 };
  
  const options = { port: currentConfig.port };
  if (ip && ip !== '0.0.0.0' && ip !== '') {
    options.interface = ip;
  }
  
  try {
    client = new bacnet(options);

    client.on('error', (err) => {
      console.error('BACnet Client Error:', err);
      client = null; // Reset on error so next request tries again
    });
  } catch (e) {
    console.error('Failed to create BACnet client:', e);
    client = null;
  }

  return client;
}

// Endpoint to force-reset the BACnet client (used when user saves new network settings)
app.post('/api/bacnet/reset', (req, res) => {
  if (client) {
    try {
      client.removeAllListeners();
      client.close();
    } catch (e) { /* ignore */ }
    client = null;
    currentConfig = { ip: null, port: 47808 };
  }
  res.json({ success: true });
});

// Map of BACnet Object Types to human readable names
const OBJECT_TYPES = {
  0: 'Analog Input',
  1: 'Analog Output',
  2: 'Analog Value',
  3: 'Binary Input',
  4: 'Binary Output',
  5: 'Binary Value',
  8: 'Device'
};

app.get('/api/network/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  
  for (const name of Object.keys(interfaces)) {
    // Skip known virtual / non-physical adapters
    const lcname = name.toLowerCase();
    if (lcname.includes('veth') || lcname.includes('docker') || lcname.includes('br-') ||
        lcname.includes('vmware') || lcname.includes('virtual') || lcname.includes('hyper') ||
        lcname.includes('bluetooth') || lcname.includes('tunnel') || lcname.includes('loopback')) {
      continue;
    }
    
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // Skip link-local / APIPA addresses (adapter has no DHCP lease / not connected)
        if (net.address.startsWith('169.254.')) continue;
        
        // Score: prefer common LAN ranges
        let score = 1;
        if (net.address.startsWith('192.168.')) score = 10;
        else if (net.address.startsWith('10.')) score = 8;
        else if (net.address.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) score = 6;
        
        // Prefer Wi-Fi / wlan on Pi (usually the active one during dev)
        if (lcname.includes('wlan') || lcname.includes('wi-fi') || lcname.includes('wireless')) score += 2;
        // Also boost eth0 on Pi
        if (lcname === 'eth0') score += 1;
        
        candidates.push({ address: net.address, name, score });
      }
    }
  }
  
  // Sort by score descending, take best
  candidates.sort((a, b) => b.score - a.score);
  const bestIp = candidates.length > 0 ? candidates[0].address : '0.0.0.0';
  
  console.log('Network candidates:', candidates.map(c => `${c.name}=${c.address} (score ${c.score})`).join(', '));
  console.log('Selected IP:', bestIp);
  
  res.json({ ip: bestIp });
});

app.get('/api/bacnet/discover', (req, res) => {
  const { ip, port } = req.query;
  const bacnetClient = getClient(ip, parseInt(port) || 47808);
  
  if (!bacnetClient) {
    return res.status(500).json({ error: 'Failed to initialize BACnet client' });
  }

  const discoveredDevices = [];
  
  // Listen for I-Am responses
  const iAmListener = (msg) => {
    // msg contains header and payload (deviceId, maxApdu, segmentation, vendorId)
    // We also need the source IP address from msg.header.address
    const deviceId = msg.payload.deviceId;
    const address = msg.header.sender.address;
    
    // Deduplicate
    if (!discoveredDevices.find(d => d.id === deviceId)) {
      discoveredDevices.push({
        id: deviceId,
        ip: address,
        name: `Device ${deviceId}`,
        status: 'online',
        vendorId: msg.payload.vendorId
      });
      console.log(`Discovered device ${deviceId} at ${address}`);
    }
  };

  bacnetClient.on('iAm', iAmListener);

  // Send Who-Is broadcast
  bacnetClient.whoIs();

  // Wait 2 seconds for responses to accumulate, then return
  setTimeout(() => {
    bacnetClient.removeListener('iAm', iAmListener);
    res.json(discoveredDevices);
  }, 2000);
});

app.get('/api/bacnet/device/:ip/:deviceId/objects', (req, res) => {
  const targetIp = req.params.ip;
  const targetDeviceId = parseInt(req.params.deviceId);
  
  const { localIp, localPort } = req.query;
  const bacnetClient = getClient(localIp, parseInt(localPort) || 47808);

  // Property ID 76 is Object List (BACNET_PROPERTY_OBJECT_LIST)
  bacnetClient.readProperty(
    targetIp,
    { type: 8, instance: targetDeviceId }, // Device object
    76, // Property: object-list
    (err, value) => {
      if (err) {
        console.error(`Error reading object list from ${targetIp}:`, err.message);
        return res.status(500).json({ error: err.message });
      }

      // value.values is an array of objects like { type: 0, instance: 1 }
      if (!value || !value.values) {
        return res.json([]);
      }

      // Filter out the Device object itself (type 8), we only want points
      const objectRefs = value.values
        .filter(obj => obj.value.type !== 8)
        .map(obj => obj.value);

      // Now we read the Object Name (Property ID 77) for each discovered object
      const namePromises = objectRefs.map(obj => {
        return new Promise((resolve) => {
          bacnetClient.readProperty(targetIp, obj, 77, (nameErr, nameValue) => {
            let assignedName = `${OBJECT_TYPES[obj.type] || 'Obj'} ${obj.instance}`;
            // If the read was successful, use the explicit name assigned in the BMS
            if (!nameErr && nameValue && nameValue.values && nameValue.values.length > 0) {
              assignedName = nameValue.values[0].value;
            }
            
            resolve({
              objectId: obj,
              id: `${OBJECT_TYPES[obj.type] || 'Obj'}-${obj.instance}`,
              typeId: obj.type,
              instance: obj.instance,
              name: assignedName,
              value: '---', // Will be populated by polling/read requests
              unit: ''
            });
          });
        });
      });

      Promise.all(namePromises).then(points => {
        res.json(points);
      });
    }
  );
});

// Since reading properties one by one can be slow, many BACnet clients use ReadPropertyMultiple.
// However, node-bacnet readPropertyMultiple can be complex to construct.
// For simplicity, we expose an endpoint to read an array of objects.
app.post('/api/bacnet/device/:ip/read', (req, res) => {
  const targetIp = req.params.ip;
  const objectsToRead = req.body; // Array of { type, instance }
  
  const { localIp, localPort } = req.query;
  const bacnetClient = getClient(localIp, parseInt(localPort) || 47808);

  if (!objectsToRead || !objectsToRead.length || !bacnetClient) {
    return res.json([]);
  }

  // To prevent dropping UDP packets from sending multiple concurrent readProperty requests,
  // we batch request using ReadPropertyMultiple (Standard ID 85 is PRESENT_VALUE).
  const requestArray = objectsToRead.map(obj => ({
    objectId: obj,
    properties: [{ id: 85 }]
  }));

  bacnetClient.readPropertyMultiple(
    targetIp,
    requestArray,
    (err, value) => {
      if (err) {
        console.error(`ReadPropertyMultiple Error [${targetIp}]:`, err.message);
        // Fallback or just return ERR for all mapped objects so the UI handles it cleanly
        const errResults = objectsToRead.map(obj => ({ ...obj, value: 'ERR' }));
        return res.json(errResults);
      }

      if (!value || !value.values) {
         return res.json([]);
      }

      const results = value.values.map(item => {
        const obj = item.objectId || item.objectIdentifier;
        let formattedValue = '---';
        
        // Extract the nested property value deeply nested in node-bacnet's RPM payload
        // Also handling fallback just in case 'value.value' varies based on node-bacnet versions
        if (item.values && item.values.length > 0 && item.values[0].value && item.values[0].value.length > 0) {
          const reading = item.values[0].value[0].value;
          
          formattedValue = reading;
          if (obj.type === 3 || obj.type === 4 || obj.type === 5) { // Binary Input/Output/Value
            formattedValue = reading === 1 ? 'ON' : 'OFF';
          } else if (typeof reading === 'number') {
            formattedValue = reading.toFixed(1);
          }
        }
        
        return { ...obj, value: formattedValue };
      });
      
      res.json(results);
    }
  );
});

// Endpoint to write a BACnet property (usually Present_Value ID: 85)
app.post('/api/bacnet/device/:ip/write', (req, res) => {
  const targetIp = req.params.ip;
  const { objectId, value, priority } = req.body; // objectId: { type, instance }, value: number/boolean, priority: 1-16
  
  const { localIp, localPort } = req.query;
  const bacnetClient = getClient(localIp, parseInt(localPort) || 47808);

  if (!bacnetClient) {
    return res.status(500).json({ error: 'BACnet client not initialized' });
  }

  // Map object types to BACnet application tags
  // 4: REAL (Analog Input/Output/Value)
  // 9: ENUMERATED (Binary Input/Output/Value - 0: inactive, 1: active)
  let tag = 4; // Default to REAL for analog
  let processedValue = parseFloat(value);

  if ([3, 4, 5].includes(objectId.type)) {
    tag = 9; // ENUMERATED for binary
    processedValue = (value === true || value === 1 || value === 'ON') ? 1 : 0;
  }

  console.log(`Writing to ${targetIp}: ${OBJECT_TYPES[objectId.type]} ${objectId.instance} -> ${processedValue} (Tag: ${tag}, Priority: ${priority || 16})`);

  bacnetClient.writeProperty(
    targetIp,
    objectId,
    85, // Property: present-value
    [{ value: processedValue, type: tag }],
    { priority: parseInt(priority) || 16 },
    (err) => {
      if (err) {
        console.error(`WriteProperty Error [${targetIp}]:`, err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// --- MODBUS INTEGRATION ---

let modbusClient = null;
let modbusConfig = { path: null, baudRate: 9600, id: 1 };
let modbusData = { power: 0, connected: false };
let modbusInterval = null;

app.get('/api/modbus/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports.map(p => ({
      path: p.path,
      manufacturer: p.manufacturer || 'Unknown'
    })));
  } catch (error) {
    console.error('Error listing serial ports:', error);
    res.status(500).json({ error: 'Failed to list serial ports' });
  }
});

app.post('/api/modbus/connect', async (req, res) => {
  const { path, baudRate, id } = req.body;
  if (!path) {
    return res.status(400).json({ error: 'Serial port path is required' });
  }

  try {
    if (modbusClient) {
      if (modbusClient.isOpen) modbusClient.close();
      modbusClient = null;
    }
    if (modbusInterval) {
      clearInterval(modbusInterval);
      modbusInterval = null;
    }

    modbusClient = new ModbusRTU();
    await modbusClient.connectRTUBuffered(path, { baudRate: parseInt(baudRate) || 9600 });
    modbusClient.setID(parseInt(id) || 1);
    modbusClient.setTimeout(2000);

    modbusConfig = { path, baudRate: parseInt(baudRate), id: parseInt(id) };
    modbusData.connected = true;

    // Start polling loop
    modbusInterval = setInterval(async () => {
      try {
        if (!modbusClient || !modbusClient.isOpen) return;
        
        // Helper to parse 32-bit floats from 2 registers (WattNode uses Little-Endian Word Swap)
        // First register (data[offset]) is the Low Word. 
        // Second register (data[offset+1]) is the High Word.
        const parseFloat32 = (data, offset) => {
          const buf = Buffer.alloc(4);
          buf.writeUInt16BE(data[offset + 1], 0); // High Word first for Node's readFloatBE
          buf.writeUInt16BE(data[offset], 2);     // Low Word second
          return buf.readFloatBE(0);
        };

        // 1. Voltage Phase-Neutral (Registers 1019-1024, wire address 1018)
        const voltageData = await modbusClient.readHoldingRegisters(1018, 6);
        modbusData.voltageA = parseFloat32(voltageData.data, 0);
        modbusData.voltageB = parseFloat32(voltageData.data, 2);
        modbusData.voltageC = parseFloat32(voltageData.data, 4);

        // 2. Power Fast measurements (Registers 1037-1044, wire address 1036)
        // Order: Total, Phase A, Phase B, Phase C (usually in Watts)
        const powerData = await modbusClient.readHoldingRegisters(1036, 8);
        modbusData.powerTotal = parseFloat32(powerData.data, 0);
        modbusData.powerA = parseFloat32(powerData.data, 2);
        modbusData.powerB = parseFloat32(powerData.data, 4);
        modbusData.powerC = parseFloat32(powerData.data, 6);
        
        // Update main scalar 'power' for the rest of the app (convert W to kW)
        modbusData.power = parseFloat((modbusData.powerTotal / 1000).toFixed(1));

        // 3. Current (Registers 1163-1168, wire address 1162)
        const currentData = await modbusClient.readHoldingRegisters(1162, 6);
        modbusData.currentA = parseFloat32(currentData.data, 0);
        modbusData.currentB = parseFloat32(currentData.data, 2);
        modbusData.currentC = parseFloat32(currentData.data, 4);

        // 4. CT Amps Configuration (Register 1603, wire address 1602)
        const ctAmpsData = await modbusClient.readHoldingRegisters(1602, 1);
        modbusData.ctAmps = ctAmpsData.data[0];

      } catch (err) {
        console.error('Modbus Polling Error:', err.message);
      }
    }, 2000);

    res.json({ success: true, message: `Connected to ${path} at ${baudRate} bps` });
  } catch (error) {
    console.error('Modbus Connection Error:', error);
    modbusData.connected = false;
    res.status(500).json({ error: error.message || 'Failed to connect to Modbus device' });
  }
});

app.post('/api/modbus/disconnect', (req, res) => {
  if (modbusInterval) {
    clearInterval(modbusInterval);
    modbusInterval = null;
  }
  if (modbusClient && modbusClient.isOpen) {
    modbusClient.close();
  }
  modbusClient = null;
  modbusData.connected = false;
  res.json({ success: true, message: 'Disconnected' });
});

app.get('/api/modbus/data', (req, res) => {
  res.json(modbusData);
});

app.post('/api/modbus/ctamps', async (req, res) => {
  if (!modbusClient || !modbusClient.isOpen) {
    return res.status(500).json({ error: 'Modbus not connected' });
  }
  const { ctAmps } = req.body;
  const value = parseInt(ctAmps, 10);
  
  if (isNaN(value) || value <= 0 || value > 10000) {
    return res.status(400).json({ error: 'Invalid CT Amps value. Must be a positive integer.' });
  }

  try {
    // Write to Register 1603 (Wire Address 1602)
    await modbusClient.writeRegister(1602, value);
    // Optimistically update the cached data
    modbusData.ctAmps = value;
    res.json({ success: true, ctAmps: value });
  } catch (error) {
    console.error('Error writing CT Amps:', error);
    res.status(500).json({ error: 'Failed to write CT Amps to Modbus device', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`BACnet backend server running on http://localhost:${port}`);
});
