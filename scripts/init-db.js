const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("prisma/dev.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS Project (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER,
    title TEXT NOT NULL,
    clientName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    projectLink TEXT,
    dateCreated DATETIME NOT NULL,
    deadline DATETIME,
    notes TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
    rate REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'PHP',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Client (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS Client_name_key ON Client(name);
`);

try {
  db.exec("ALTER TABLE Project ADD COLUMN clientId INTEGER");
} catch {}

db.exec(`
  CREATE INDEX IF NOT EXISTS Project_clientId_idx ON Project(clientId);
  CREATE INDEX IF NOT EXISTS Project_dateCreated_idx ON Project(dateCreated);
  CREATE INDEX IF NOT EXISTS Project_status_idx ON Project(status);
  CREATE INDEX IF NOT EXISTS Project_clientName_idx ON Project(clientName);
  CREATE INDEX IF NOT EXISTS Project_paymentStatus_idx ON Project(paymentStatus);
  CREATE INDEX IF NOT EXISTS Project_currency_idx ON Project(currency);

  CREATE TABLE IF NOT EXISTS User (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    profileImage TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS User_email_key ON User(email);
`);

const existingNames = db.prepare("SELECT DISTINCT clientName FROM Project WHERE clientName IS NOT NULL AND clientName != ''").all();
const insertClient = db.prepare("INSERT OR IGNORE INTO Client (name, updatedAt) VALUES (?, CURRENT_TIMESTAMP)");
const findClient = db.prepare("SELECT id FROM Client WHERE name = ?");
const updateProjectClient = db.prepare("UPDATE Project SET clientId = ? WHERE clientName = ? AND clientId IS NULL");

for (const row of existingNames) {
  insertClient.run(row.clientName);
  const client = findClient.get(row.clientName);
  if (client) updateProjectClient.run(client.id, row.clientName);
}

db.close();
console.log("Created prisma/dev.db");
