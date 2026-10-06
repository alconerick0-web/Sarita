-- Helado por libra con recetas en bolitas × onzas.
-- 1) Más decimales para fracciones de libra (ej. 6 oz = 0.375 lb). Ampliar la escala no pierde datos.
-- 2) Columnas para guardar cómo se escribió la receta de helado.
-- Se puede correr más de una vez.

BEGIN;

ALTER TABLE ingredients         ALTER COLUMN stock_quantity    TYPE numeric(14,5);
ALTER TABLE inventory_movements ALTER COLUMN quantity          TYPE numeric(14,5);
ALTER TABLE order_item_used     ALTER COLUMN quantity_used     TYPE numeric(14,5);
ALTER TABLE product_ingredients ALTER COLUMN quantity_per_unit TYPE numeric(14,5);

ALTER TABLE product_ingredients ADD COLUMN IF NOT EXISTS scoops integer NULL;
ALTER TABLE product_ingredients ADD COLUMN IF NOT EXISTS ounces_per_scoop numeric(6,2) NULL;

COMMIT;
