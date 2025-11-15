-- Atualizar registros com endTime NULL ou vazio
UPDATE "meetings" 
SET "endTime" = '21:00'
WHERE "endTime" IS NULL OR "endTime" = '';

-- Tornar o campo obrigatório
ALTER TABLE "meetings" ALTER COLUMN "endTime" SET NOT NULL;
