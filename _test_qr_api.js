const express = require('express');
const os = require('os');
const path = require('path');

function getLANIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

const LAN_IP = getLANIP();
const port = 18080;
const baseUrl = LAN_IP ? `http://${LAN_IP}:${port}` : `http://localhost:${port}`;
console.log('LAN IP:', LAN_IP);
console.log('Base URL:', baseUrl);

// Simulate what the route does
const result = { baseUrl, lanIp: LAN_IP, port };
console.log('API response:', JSON.stringify(result, null, 2));
