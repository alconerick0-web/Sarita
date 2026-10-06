-- Columnas agregadas en "Paleteria y Bug Fixes" (3de7759) y "Bug Fixes" (45ebf01).
-- En producción TypeORM no sincroniza el esquema, así que se aplican a mano.
-- Solo agrega columnas: no borra ni modifica datos. Se puede correr más de una vez.

BEGIN;

-- Línea de negocio: 'heladeria' o 'paleteria'
ALTER TABLE categories  ADD COLUMN IF NOT EXISTS line varchar NOT NULL DEFAULT 'heladeria';
ALTER TABLE products    ADD COLUMN IF NOT EXISTS line varchar NOT NULL DEFAULT 'heladeria';

-- Borrado lógico (soft delete)
ALTER TABLE categories  ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
ALTER TABLE flavors     ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
ALTER TABLE products    ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
ALTER TABLE roles       ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;

COMMIT;
