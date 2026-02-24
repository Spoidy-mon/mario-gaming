# Mario Gaming Cafe Management System

A complete client-server solution for managing gaming PCs in a cyber cafe / gaming lounge.

- Manager dashboard (web app) to control sessions, add time, pause/resume/end sessions
- Client app (Electron .exe) on each gaming PC — shows time-over popup, allows extra time, auto-shutdown

## Features

- Real-time countdown (HH:MM:SS) on manager dashboard
- Start session with predefined times (30/60/90/120 min)
- Add extra time (+15/+30/+60 min)
- Pause / Resume / End session buttons per PC
- Visual status indicators (online/offline, low-time warning)
- Client-side popup when time expires → +5/+10 min options or shutdown
- Auto-shutdown of PC when time runs out
- Supports multiple PCs (currently 4 configured)

## Project Structure
mario-gaming/
├── manager/               # React + Vite frontend (manager dashboard)
│   ├── src/
│   │   ├── App.js
│   │   └── styles.css
│   └── package.json
├── server/                # Node.js + Express + SQLite backend
│   ├── index.js
│   └── mario_gaming.db   # SQLite database
├── computer-client/       # Electron client app for gaming PCs
│   ├── main.js
│   └── package.json
├── ps5-controller/        # (optional) PS5 integration if needed
├── .gitignore
├── package.json           # (root - optional monorepo)
└── README.md
text
## Tech Stack

- **Frontend (Manager)**: React, Vite, Socket.IO client, react-toastify
- **Backend (Server)**: Node.js, Express, Socket.IO, SQLite3
- **Client (Gaming PCs)**: Electron, Socket.IO client
- **Database**: SQLite (single file: `mario_gaming.db`)

## Setup Instructions

### 1. Server (Manager Laptop)

```bash
cd server
npm install
npm run start-serverServer runs on http://localhost:3000 (or your IP:3000)
Database auto-creates mario_gaming.db if missing

2. Manager Dashboard
Bashcd manager
npm install
npm run start-react

Opens at http://localhost:5173 (or your configured port)
Connects to server via Socket.IO

3. Client on Each Gaming PC

Build or use pre-built .exe from computer-client
Edit main.js on each PC → set unique DEVICE_ID (1, 2, 3, 4)
Update SERVER_URL to manager laptop's IP (e.g. http://192.168.1.105:3000)
Install .exe → add to startup folder (Win+R → shell:startup)
Client runs silently, shows popup on time over

4. Add Your 4 PCs to Database
Run these SQL commands in DB Browser for SQLite on server/mario_gaming.db:
SQLINSERT OR IGNORE INTO devices (id, name, type, status, ip_address) VALUES
(1, 'PC-01', 'computer', 'offline', '192.168.1.47'),
(2, 'PC-02', 'computer', 'offline', '192.168.1.31'),
(3, 'PC-03', 'computer', 'offline', '192.168.1.32'),
(4, 'PC-04', 'computer', 'offline', '192.168.1.46');
Usage

Start server → start manager dashboard
Clients auto-connect when PCs boot
In manager:
Start session → choose time
Add extra time → +15/+30/+60 min
Pause / Resume / End per PC

On PC → time over → popup → add time or shutdown

Troubleshooting

Client timeout → check firewall (allow port 3000 inbound on manager laptop)
PC not online → confirm unique DEVICE_ID, correct SERVER_URL, client running
Blank manager screen → check browser console (F12), server logs
Build issues → run npm install again, ensure icon.ico ≥256×256

Future Improvements

Tray icon for client
Hourly billing / payment integration
PS5 support (via ps5-controller)
Manager login / multi-user
Usage reports / statistics

License
MIT License – feel free to modify for your cafe.
Made with ❤️ for gaming cafes.
text### How to Add This README in VS Code

1. In VS Code → open `C:\mario-gaming`
2. Right-click root folder → **New File** → name: `README.md`
3. Paste the entire markdown content above
4. Save (Ctrl+S)

Now when you commit & push, GitHub will show this beautiful README on your repo main page.

### Next Actions

- Commit & push:
  ```bash
  git add README.md
  git commit -m "Add detailed README.md"
  git push
