-- CreateTable
CREATE TABLE "ServiceCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceCartId" TEXT NOT NULL,
    "servicePackageId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceCartItem_serviceCartId_fkey" FOREIGN KEY ("serviceCartId") REFERENCES "ServiceCart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceCartItem_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCart_userId_key" ON "ServiceCart"("userId");

-- CreateIndex
CREATE INDEX "ServiceCartItem_servicePackageId_idx" ON "ServiceCartItem"("servicePackageId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCartItem_serviceCartId_servicePackageId_key" ON "ServiceCartItem"("serviceCartId", "servicePackageId");
