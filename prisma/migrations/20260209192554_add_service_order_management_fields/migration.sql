-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "subtotalCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "requiresKickoffCall" BOOLEAN NOT NULL DEFAULT true,
    "kickoffCallConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "kickoffCallConfirmedAt" DATETIME,
    "deliveredAt" DATETIME,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ServiceOrder" ("createdAt", "currency", "id", "requiresKickoffCall", "status", "stripeCheckoutSessionId", "stripePaymentIntentId", "subtotalCents", "totalCents", "updatedAt", "userId") SELECT "createdAt", "currency", "id", "requiresKickoffCall", "status", "stripeCheckoutSessionId", "stripePaymentIntentId", "subtotalCents", "totalCents", "updatedAt", "userId" FROM "ServiceOrder";
DROP TABLE "ServiceOrder";
ALTER TABLE "new_ServiceOrder" RENAME TO "ServiceOrder";
CREATE UNIQUE INDEX "ServiceOrder_stripeCheckoutSessionId_key" ON "ServiceOrder"("stripeCheckoutSessionId");
CREATE INDEX "ServiceOrder_userId_createdAt_idx" ON "ServiceOrder"("userId", "createdAt");
CREATE INDEX "ServiceOrder_status_idx" ON "ServiceOrder"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
