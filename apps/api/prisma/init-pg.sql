-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "displayName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncBlob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL DEFAULT 'default',
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncBlob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMember" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "durationDays" INTEGER,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntitlement" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,
    "scope" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "itemRef" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "channel" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'paid',
    "externalTxnId" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "rawPayload" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "detail" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDocument" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "checksum" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "payload" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'system',
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "SyncBlob_userId_idx" ON "SyncBlob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncBlob_userId_profileId_key_key" ON "SyncBlob"("userId", "profileId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "ClassMember_studentId_idx" ON "ClassMember"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMember_classId_studentId_key" ON "ClassMember"("classId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_code_key" ON "MembershipPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_code_key" ON "Entitlement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PlanEntitlement_planId_entitlementId_key" ON "PlanEntitlement"("planId", "entitlementId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "UserEntitlement_userId_idx" ON "UserEntitlement"("userId");

-- CreateIndex
CREATE INDEX "ItemPurchase_userId_idx" ON "ItemPurchase"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDocument_path_key" ON "ContentDocument"("path");

-- CreateIndex
CREATE INDEX "ContentDocument_kind_idx" ON "ContentDocument"("kind");

-- CreateIndex
CREATE INDEX "ContentDocument_status_idx" ON "ContentDocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- AddForeignKey
ALTER TABLE "SyncBlob" ADD CONSTRAINT "SyncBlob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMember" ADD CONSTRAINT "ClassMember_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMember" ADD CONSTRAINT "ClassMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPurchase" ADD CONSTRAINT "ItemPurchase_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

