-- Paletas usadas como parte de la receta de otro producto.
-- Solo crea una tabla nueva: no modifica ni borra datos existentes. Se puede correr más de una vez.

BEGIN;

CREATE TABLE IF NOT EXISTS product_components (
  id           serial PRIMARY KEY,
  product_id   integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_id integer NOT NULL REFERENCES products(id),
  quantity     integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_product_components_product_id ON product_components(product_id);

COMMIT;
