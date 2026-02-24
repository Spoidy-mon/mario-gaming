Here is a complete, self-contained **README.md** file specifically for the **client side** (the gaming PC app). 

You can copy-paste this entire content into a new file called `README.md` inside your `computer-client` folder (or `mario-gaming-client` folder).

```markdown
# Mario Gaming Client

This is the **client application** that runs on each gaming PC in the shop.

## Purpose

- Runs in the background on each gaming computer.
- Connects to the central server (manager laptop).
- Registers the PC with a unique device ID.
- Sends periodic heartbeats to stay marked as "online".
- Displays a full-screen overlay message when the session time expires.
- Allows the manager (or user) to unlock/resume the screen with a password.

## Features

- Silent background mode (no main window visible)
- Real-time connection via Socket.io
- Full-screen time-over overlay
- Password-protected resume/unlock button
- Auto-reconnect on disconnect
- Easy to build as portable .exe

## Requirements

- Windows 10 or 11 (64-bit)
- Same Wi-Fi network as the manager laptop
- Node.js LTS (v18, v20, or v22 recommended) installed on the client PC

## File Structure

```
computer-client/
├── main.js               # Main Electron process (logic, socket, overlay control)
├── overlay.html          # Full-screen time-over message + password prompt
├── preload.js            # IPC bridge between renderer and main process
├── package.json          # Dependencies and build scripts
└── README.md             # This file
```

## Full Code for Each File

### main.js

```javascript
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const io = require('socket.io-client');

// ────────────────────────────────────────────────
// CHANGE THESE TWO LINES FOR EACH GAMING PC
const SERVER_URL = 'http://192.168.1.105:3000';  // ← Manager laptop IP (from ipconfig)
const DEVICE_ID = 1;                             // ← Unique: 1, 2, 3... per PC
// ────────────────────────────────────────────────

let overlayWindow = null;

const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket']
});

function createOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) return;

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    transparent: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  console.log(`Overlay created for device ${DEVICE_ID}`);
}

app.whenReady().then(() => {
  // No main window – background only

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('register', DEVICE_ID);
  });

  socket.on('time_over', () => {
    console.log(`Time over received for device ${DEVICE_ID}`);
    createOverlay();
  });

  socket.on('resume', () => {
    console.log('Resume signal received – closing overlay');
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  // Heartbeat
  setInterval(() => {
    if (socket.connected) socket.emit('heartbeat', DEVICE_ID);
  }, 30000);
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
    console.log('Overlay closed via password');
  }
});

app.on('window-all-closed', () => {
  // Keep running in background even if overlay closes
});
```

### overlay.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time Over - Mario Gaming</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      background: linear-gradient(135deg, #000, #200000);
      color: #ff4444;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }
    h1 {
      font-size: 6rem;
      margin: 0 0 20px;
      text-shadow: 0 0 20px #ff0000;
      animation: pulse 2s infinite;
    }
    p {
      font-size: 2.2rem;
      margin: 10px 0;
      max-width: 800px;
    }
    .btn {
      margin-top: 40px;
      padding: 15px 40px;
      font-size: 1.8rem;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 0 20px #ff4444;
      transition: all 0.3s;
    }
    .btn:hover {
      background: #ff6666;
      transform: scale(1.05);
    }
    #password-section {
      display: none;
      margin-top: 30px;
    }
    #password-input {
      padding: 12px;
      font-size: 1.5rem;
      width: 300px;
      margin-right: 10px;
      border-radius: 6px;
      border: 2px solid #ff4444;
    }
    #error-msg {
      color: #ff9999;
      font-size: 1.4rem;
      margin-top: 10px;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  </style>
</head>
<body>
  <h1>TIME OVER!</h1>
  <p>Your gaming session has ended.</p>
  <p>Please ask the manager to add more time or unlock manually.</p>

  <button class="btn" onclick="showPasswordPrompt()">Resume / Unlock</button>

  <div id="password-section">
    <input type="password" id="password-input" placeholder="Enter password" autofocus>
    <button class="btn" onclick="checkPassword()">Submit</button>
    <div id="error-msg"></div>
  </div>

  <script>
    // CHANGE THIS HASHED PASSWORD (generate once)
    // Run in Node.js: crypto.createHash('sha256').update('yourpass').digest('hex')
    const STORED_HASH = "e7d80ffeb3a2d0e8f8a4e3c6b5d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5"; // example

    function showPasswordPrompt() {
      document.getElementById('password-section').style.display = 'block';
      document.getElementById('password-input').focus();
    }

    async function checkPassword() {
      const input = document.getElementById('password-input').value.trim();
      const errorMsg = document.getElementById('error-msg');

      if (!input) {
        errorMsg.textContent = 'Please enter a password';
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === STORED_HASH) {
        window.electronAPI?.closeOverlay();
        document.body.innerHTML = '<h1 style="color:#0f0">Resuming...</h1>';
        setTimeout(() => window.close(), 1500);
      } else {
        errorMsg.textContent = 'Incorrect password. Try again.';
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
      }
    }

    document.getElementById('password-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') checkPassword();
    });
  </script>
</body>
</html>
```

### 3. preload.js (full code – IPC bridge)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeOverlay: () => ipcRenderer.send('close-overlay')
});
```

### 4. package.json (full code – with portable target for easier build)

```json
{
  "name": "mario-gaming-client",
  "version": "1.0.0",
  "description": "Client app for gaming PCs - Mario Gaming",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder"
  },
  "author": "Spider",
  "license": "ISC",
  "dependencies": {
    "socket.io-client": "^4.7.5"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "com.spider.mario-gaming-client",
    "productName": "Mario Gaming Client",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "portable"  // single .exe file – no installer needed
    }
  }
}
```

### Installation & Running on Client PC

1. Install **Node.js LTS** (https://nodejs.org)
2. Create folder → copy above 4 files
3. Open terminal in folder:

   ```powershell
   npm install
   ```

4. Update `main.js`:
   - `SERVER_URL` → manager laptop IP (run `ipconfig` on manager)
   - `DEVICE_ID` → unique number (1, 2, 3...)

5. Test:

   ```powershell
   npm start
   ```

   Look for: `Connected to server`

6. Build .exe:

   ```powershell
   npm run dist
   ```

   → Find `Mario Gaming Client.exe` in `dist/` folder

### Dependencies

- **Runtime**:
  - socket.io-client (^4.7.5) – real-time communication

- **Dev**:
  - electron (^31.0.0) – desktop app framework
  - electron-builder (^24.13.3) – builds .exe

Install with:

```powershell
npm install
```

### Troubleshooting

- No "Connected to server" → check IP, same Wi-Fi, firewall (port 3000 open on manager)
- Overlay not closing → check password hash matches
- Build fails → run VS Code as Administrator

### Next Steps

- Copy .exe to each gaming PC
- Change DEVICE_ID per PC
- Add shortcut to Startup folder (auto-start)
- Test full flow: session start → time over → overlay → password unlock

Let me know if overlay closes after password, or if you want tray icon / silent mode next.