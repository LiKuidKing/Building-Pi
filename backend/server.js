import express from 'express';
import cors from 'cors';
import bacnet from 'node-bacnet';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

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
      client.close();
    } catch (e) {
      console.error('Error closing old client', e);
    }
  }

  console.log(`Initializing BACnet client on ${ip || 'default interface'}:${clientPort || 47808}`);
  
  currentConfig = { ip, port: clientPort || 47808 };
  
  const options = { port: currentConfig.port };
  if (ip && ip !== '0.0.0.0' && ip !== '') {
    options.interface = ip;
  }
  
  // node-bacnet has a known quirk where sometimes you have to bind explicitly
  client = new bacnet(options);

  client.on('error', (err) => {
    console.error('BACnet Client Error:', err);
    client = null; // Reset on error so next request tries again
  });

  return client;
}

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
  let localIp = '192.168.1.100'; // Default fallback
  
  // Find the first non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        // Skip common docker/virtual bridge addresses if possible, but keep simple for now
        if (!name.startsWith('docker') && !name.startsWith('br-')) {
          localIp = net.address;
          break;
        }
      }
    }
  }
  
  res.json({ ip: localIp });
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

  if (!objectsToRead || !objectsToRead.length) {
    return res.json([]);
  }

  // We'll map the readProperty calls to Promises and run them
  // Warning: Consecutively bashing a BACnet device with 50 single readProperty requests
  // might overwhelm simple devices. A small delay or ReadPropertyMultiple is better in prod.
  const readPromises = objectsToRead.map(obj => {
    return new Promise((resolve) => {
      // 85 is BACNET_PROPERTY_PRESENT_VALUE
      bacnetClient.readProperty(targetIp, obj, 85, (err, value) => {
        if (err || !value || !value.values || value.values.length === 0) {
          resolve({ ...obj, value: 'ERR' });
        } else {
          // value.values[0].value contains the raw reading
          const reading = value.values[0].value;
          
          // Format based on type (e.g. Binary is usually 0/1 meaning Inactive/Active)
          let formattedValue = reading;
          if (obj.type === 3 || obj.type === 4 || obj.type === 5) { // Binary
            formattedValue = reading === 1 ? 'ON' : 'OFF';
          } else if (typeof reading === 'number') {
            formattedValue = reading.toFixed(1);
          }

          resolve({ ...obj, value: formattedValue });
        }
      });
    });
  });

  Promise.all(readPromises).then(results => {
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`BACnet backend server running on http://localhost:${port}`);
});
