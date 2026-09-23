-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "custoUnitario" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MotivoPerda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Producao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Producao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Producao_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Perda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "motivoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custoUnitarioHistorico" REAL NOT NULL,
    "custoTotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Perda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Perda_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Perda_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "MotivoPerda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Produto_ativo_idx" ON "Produto"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_codigo_key" ON "Turno"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "MotivoPerda_codigo_key" ON "MotivoPerda"("codigo");

-- CreateIndex
CREATE INDEX "Producao_data_idx" ON "Producao"("data");

-- CreateIndex
CREATE INDEX "Producao_produtoId_idx" ON "Producao"("produtoId");

-- CreateIndex
CREATE INDEX "Perda_data_idx" ON "Perda"("data");

-- CreateIndex
CREATE INDEX "Perda_produtoId_idx" ON "Perda"("produtoId");

-- CreateIndex
CREATE INDEX "Perda_motivoId_idx" ON "Perda"("motivoId");
