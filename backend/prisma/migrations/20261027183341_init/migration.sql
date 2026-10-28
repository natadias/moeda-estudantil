-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ALUNO', 'PROFESSOR', 'EMPRESA');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('TRANSFERENCIA', 'RESGATE', 'CREDITO_SEMESTRAL');

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituicao_ensino" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "instituicao_ensino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aluno" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "saldo_moedas" INTEGER NOT NULL DEFAULT 0,
    "instituicao_id" INTEGER NOT NULL,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endereco" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" CHAR(2) NOT NULL,
    "cep" CHAR(8) NOT NULL,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "saldo_moedas" INTEGER NOT NULL DEFAULT 0,
    "instituicao_id" INTEGER NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa_parceira" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "empresa_parceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vantagem" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "custo_moedas" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "empresa_id" INTEGER NOT NULL,

    CONSTRAINT "vantagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacao" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "valor" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "codigo_cupom" TEXT,
    "semestre" TEXT,
    "professor_id" INTEGER,
    "aluno_id" INTEGER,
    "vantagem_id" INTEGER,

    CONSTRAINT "transacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_login_key" ON "usuario"("login");

-- CreateIndex
CREATE UNIQUE INDEX "instituicao_ensino_cnpj_key" ON "instituicao_ensino"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "aluno_cpf_key" ON "aluno"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "endereco_aluno_id_key" ON "endereco"("aluno_id");

-- CreateIndex
CREATE UNIQUE INDEX "professor_cpf_key" ON "professor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_parceira_cnpj_key" ON "empresa_parceira"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "transacao_codigo_cupom_key" ON "transacao"("codigo_cupom");

-- CreateIndex
CREATE UNIQUE INDEX "transacao_professor_id_semestre_key" ON "transacao"("professor_id", "semestre");

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao_ensino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao_ensino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresa_parceira" ADD CONSTRAINT "empresa_parceira_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vantagem" ADD CONSTRAINT "vantagem_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_parceira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_vantagem_id_fkey" FOREIGN KEY ("vantagem_id") REFERENCES "vantagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
