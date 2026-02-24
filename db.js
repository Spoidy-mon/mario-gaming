const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mario_gaming.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  // Devices table
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('computer', 'ps5')),
      shop_id INTEGER NOT NULL,
      ip TEXT,
      status TEXT DEFAULT 'offline',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table (updated with status column)
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      duration_minutes INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);

  // Seed initial devices (only if table is empty)
  db.get('SELECT COUNT(*) as count FROM devices', (err, row) => {
    if (err) {
      console.error('Check devices count error:', err);
      return;
    }

    if (row.count === 0) {
      console.log('Seeding initial devices...');
      const devicesPath = path.join(__dirname, 'devices.json');

      if (fs.existsSync(devicesPath)) {
        const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf8'));

        const stmt = db.prepare(`
          INSERT OR IGNORE INTO devices (name, type, shop_id, ip, status)
          VALUES (?, ?, ?, ?, 'offline')
        `);

        devices.forEach(dev => {
          stmt.run(dev.name, dev.type, dev.shop_id, dev.ip || null);
        });

        stmt.finalize();
        console.log('Devices seeded successfully');
      } else {
        console.warn('devices.json not found - no initial devices seeded');
      }
    }
  });
});

// Close DB on app exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing DB:', err);
    console.log('Database connection closed');
    process.exit(0);
  });
});

module.exports = db;