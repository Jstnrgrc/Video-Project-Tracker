CREATE TABLE "Project" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "clientId" INTEGER,
  "title" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "projectLink" TEXT,
  "dateCreated" DATETIME NOT NULL,
  "deadline" DATETIME,
  "notes" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
  "rate" REAL NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "Project_dateCreated_idx" ON "Project"("dateCreated");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_clientName_idx" ON "Project"("clientName");
CREATE INDEX "Project_paymentStatus_idx" ON "Project"("paymentStatus");
CREATE INDEX "Project_currency_idx" ON "Project"("currency");
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

CREATE TABLE "Client" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

CREATE TABLE "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "profileImage" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
