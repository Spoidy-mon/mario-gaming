const { app, BrowserWindow } = require('electron');
const io = require('socket.io-client');
const path = require('path');

const socket = io('http://localhost:3000');  // Replace with server IP

let deviceId = 1;  // Hardcode or config per client (e.g., from env)

app.whenReady().then(() => {
  socket.emit('register', deviceId);

  socket.on('time_over', () => {
    const win = new BrowserWindow({ fullscreen: true });
    win.loadFile('index.html');
    win.webContents.executeJavaScript('document.body.innerHTML = "<h1>Time Over! Pay for more time.</h1>";');  // Block screen
  });
});

// Heartbeat every 10s
setInterval(() => socket.emit('heartbeat', deviceId), 10000);