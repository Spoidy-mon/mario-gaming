Mario Gaming - Gaming Shop Management System
Project Overview
Mario Gaming is a client-server desktop application designed for managing two gaming shops. It allows the manager to monitor and control gaming computers and PS5 consoles over a local network. Key features include:

Device Status Monitoring: View online/offline status, game on/off.
Session Management: Start gaming sessions with fixed rates (100 Rs/hour), timer starts after 1 minute.
Time Over Handling: On gaming PCs, shows a full-screen overlay message when time expires. For PS5, turns off power via smart plug.
Extra Time: Add extra time to active sessions from manager dashboard, automatically closes overlay on client.
Security: Resume/unlock overlay on client requires hashed password.
Real-Time Updates: Socket.io for live online/offline and session changes.
Installable Apps: Manager and client apps as .exe for Windows.

The system is built with Node.js backend, React frontend for manager, Electron for desktop apps.
Assumptions:

All devices on same Wi-Fi network.
Backend runs on manager's laptop.
Rates fixed at 100 Rs/hour (configurable in code).
No online payments – cash only.

Tech Stack & Dependencies
Global / Root Dependencies (mario-gaming/package.json)

dotenv: ^16.4.5 – Environment variables.
express: ^4.19.2 – Backend API server.
node-kasa: ^1.0.3 – PS5 smart plug control (TP-Link Kasa).
socket.io: ^4.7.5 – Real-time communication.
sqlite3: ^5.1.7 – Database.

Server Dependencies (server/package.json)

express
sqlite3
socket.io
socket.io-client
node-kasa

Manager Dependencies (manager/package.json)

react: ^18.3.1
react-dom: ^18.3.1
react-scripts: 5.0.1
socket.io-client: ^4.7.5
react-toastify: ^9.1.3 – For popup alerts (install with npm install react-toastify)
devDependencies: @electron-forge/cli, @electron-forge/maker-squirrel, electron, electron-is-dev

Computer-Client Dependencies (computer-client/package.json)

electron: ^31.0.0
socket.io-client: ^4.7.5
devDependencies: electron-builder, electron-packager

PS5-Controller Dependencies (ps5-controller/package.json)

node-kasa: ^1.0.3

Global tools:

electron-forge (global install: npm install -g electron-forge)

File Structure & Descriptions
text mario-gaming/
├── .gitignore                # Git ignore file (node_modules, db files, builds)
├── package.json              # Root package with shared deps and scripts
├── README.md                 # This file
├── mario_gaming.db           # SQLite database (auto-created)
├── server/
│   ├── db.js                 # Database setup, tables, seed devices
│   ├── devices.json          # Initial devices config (PCs and PS5s)
│   ├── index.js              # Backend Express server, API, Socket.io, timers
│   └── package.json          # Server deps
├── manager/
│   ├── public/
│   │   └── index.html        # React entry HTML
│   ├── src/
│   │   ├── App.js            # Manager dashboard React component (table, buttons)
│   │   ├── index.js          # React root render
│   │   └── styles.css        # Basic CSS for table
│   ├── main.js               # Electron main process (loads React)
│   ├── preload.js            # Electron preload (optional IPC)
│   ├── forge.config.js       # Electron Forge config
│   └── package.json          # Manager deps and scripts
├── computer-client/
│   ├── overlay.html          # Full-screen time-over message (with password resume)
│   ├── main.js               # Electron background app (socket, overlay logic)
│   ├── preload.js            # IPC for closing overlay
│   ├── forge.config.js       # Optional Forge config
│   └── package.json          # Client deps and build scripts
├── ps5-controller/
│   ├── index.js              # Script to control PS5 smart plug
│   └── package.json          # Deps for Kasa
File Details
Root

.gitignore: Ignores node_modules, .db, builds, logs.
package.json: Scripts to start server/manager/client, shared deps.
README.md: Project docs.
mario_gaming.db: SQLite DB with devices and sessions tables.

Server

db.js: Creates tables for devices/sessions, seeds from devices.json.
devices.json: JSON array of devices (name, type, shop_id, ip).
index.js: Express API (/devices GET, /session POST, /extra-time POST), Socket.io, timers, CORS.
package.json: Deps for server.

Manager

public/index.html: Basic HTML with #root div for React.
src/App.js: React component with table, start session, add extra time, socket listeners, toasts.
src/index.js: ReactDOM render App.
src/styles.css: Table styling.
main.js: Electron window creation, loads React dev server or build.
preload.js: Empty for now.
forge.config.js: Build config for .exe.
package.json: React + Electron deps.

Computer-Client

overlay.html: HTML for time-over screen with password prompt + hash check.
main.js: Background Electron, socket connect/register/heartbeat, overlay on time_over, close on resume.
preload.js: Exposes closeOverlay API.
forge.config.js: Optional for build.
package.json: Electron + socket deps, build scripts.

PS5-Controller

index.js: Standalone script to turn off plug (can be called from server).
package.json: node-kasa dep.

Installation & Running on Manager Laptop

Install Node.js LTS (nodejs.org).
Clone repo or copy folder.
In root: npm install
In server: cd server && npm install
In manager: cd manager && npm install
Run backend: npm run start-server
Run manager: npm run start-react (browser) or npm start (Electron)
Configure devices.json with real IPs/IDs.

Installation & Running on Client PC

Install Node.js LTS.
Copy computer-client folder to client PC.
npm install
Update main.js with SERVER_URL (manager IP) + DEVICE_ID.
Run: npm start
Build .exe: npm run build-exe → install dist/ .exe

Dependencies Installation

Root: npm install dotenv express node-kasa socket.io sqlite3
Server: npm install express sqlite3 socket.io socket.io-client node-kasa
Manager: npx create-react-app . then npm install socket.io-client react-toastify electron electron-is-dev @electron-forge/cli @electron-forge/maker-squirrel
Client: npm install electron socket.io-client electron-builder electron-packager
PS5: npm install node-kasa

How to Use

Manager: Start sessions, add extra time → client overlay closes.
Client: Auto connects, shows overlay on time over, resume with password.

Debugging

Check server/client consoles for errors.
Test /devices GET in browser.

Known Limitations

No user auth.
Password hashed but local – not remote.
PS5 hardware needs TP-Link Kasa plug.

Future Improvements

Auth for manager
Reports
Mobile manager app

For GitHub: Add this README to root and push.