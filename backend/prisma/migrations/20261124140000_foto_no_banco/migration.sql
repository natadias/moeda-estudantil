-- Fotos das vantagens passam do disco do servidor para o banco (o disco do Render é apagado a cada reinício).
ALTER TABLE "vantagem"
  ADD COLUMN "foto" BYTEA NOT NULL DEFAULT '\x',
  ADD COLUMN "foto_tipo" TEXT NOT NULL DEFAULT 'image/jpeg',
  ADD COLUMN "foto_atualizada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "vantagem"
  ALTER COLUMN "foto" DROP DEFAULT,
  ALTER COLUMN "foto_tipo" DROP DEFAULT,
  DROP COLUMN "foto_url";
