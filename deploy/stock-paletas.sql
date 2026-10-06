-- Stock propio de las paletas (línea 'paleteria'), que se venden por unidad sin receta.
-- Solo agrega una columna. Se puede correr más de una vez.
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;
