# Deploy — sarita.tucalledice.org

Servidor: `usuario@servidor` (reemplazar por el usuario e IP reales), carpeta `/opt/sarita`.
Puertos: backend **3001**, frontend **4322**. Nginx y SSL ya están configurados en el servidor.

El `docker-compose.yml` y el `.env` del servidor ya existen: solo se reemplazan las imágenes
`sarita_backend:latest` y `sarita_frontend:latest`.

---

## 1. En tu PC — crear las imágenes y empaquetarlas

Requiere Docker Desktop abierto. Desde la carpeta del proyecto (`D:\Trabajos\PROYECTOS\sarita`):

```bash
docker build --platform linux/amd64 -t sarita_backend:latest ./apps/backend
```

```bash
docker build --platform linux/amd64 --build-arg PUBLIC_API_URL=https://sarita.tucalledice.org -t sarita_frontend:latest ./apps/frontend
```

> `PUBLIC_API_URL` es la única variable del frontend. Astro la incrusta al compilar, por eso va
> como `--build-arg` y no en el `.env` del servidor (el `.env` local de `apps/frontend`, que apunta
> a localhost, no se copia a la imagen). Es obligatoria: sin ella el build se detiene.

Guardar ambas imágenes en un solo archivo comprimido:

```bash
docker save sarita_backend:latest sarita_frontend:latest | gzip > sarita_images.tar.gz
```

> En PowerShell sin `gzip`: `docker save -o sarita_images.tar sarita_backend:latest sarita_frontend:latest`
> (queda sin comprimir; en el servidor se carga igual con `docker load -i sarita_images.tar`).

---

## 2. Enviar al servidor

```bash
scp sarita_images.tar.gz deploy/<migracion>.sql usuario@servidor:~/
```

> `/opt/sarita` es de root y el usuario de deploy no puede escribir ahí: los archivos van a la carpeta personal (`~/`).
> Solo hace falta enviar la migración si el cambio la trae (ver la sección de migraciones al final).

---

## 3. En el servidor — cargar y levantar

```bash
ssh usuario@servidor
cd /opt/sarita
```

**a) Respaldo de la base de datos (siempre antes de un deploy):**

```bash
docker exec sarita_db sh -c 'pg_dump -U $POSTGRES_USER $POSTGRES_DB' > ~/backup_sarita_$(date +%F_%H%M).sql
```

**b) Guardar las imágenes actuales como respaldo y cargar las nuevas** (reemplazan a las `:latest`):

```bash
docker tag sarita_backend:latest sarita_backend:anterior
docker tag sarita_frontend:latest sarita_frontend:anterior
gunzip -c ~/sarita_images.tar.gz | docker load
```

**c) Aplicar la migración, si hay** (debe ir ANTES de levantar el backend):

```bash
docker exec -i sarita_db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -v ON_ERROR_STOP=1' < ~/<migracion>.sql
```

**d) Recrear los contenedores con las imágenes nuevas** (sin construir nada en el servidor):

```bash
docker compose up -d --no-build --force-recreate backend frontend
```

**e) Verificar:**

```bash
docker compose ps
docker compose logs --tail=50 backend
curl -I https://sarita.tucalledice.org
```

**f) Limpiar** (cuando todo funcione):

```bash
rm ~/sarita_images.tar.gz
docker image prune -f
```

---

## Si algo sale mal (volver atrás)

Restaurar la base de datos desde el respaldo del paso 3a:

```bash
docker exec -i sarita_db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB' < ~/backup_sarita_AAAA-MM-DD_HHMM.sql
```

Volver a la versión anterior de la app (las columnas nuevas no le afectan):

```bash
docker tag sarita_backend:anterior sarita_backend:latest
docker tag sarita_frontend:anterior sarita_frontend:latest
docker compose up -d --no-build --force-recreate backend frontend
```

---

## Comandos útiles

```bash
docker compose logs -f backend      # logs en vivo del backend
docker compose restart backend      # reiniciar un servicio
docker compose down                 # bajar todo (los datos se conservan)
```

No usar `docker compose down -v`: borra la base de datos.

---

## Migraciones de base de datos (`deploy/`)

En producción TypeORM **no** crea ni cambia tablas (`synchronize` está apagado con
`NODE_ENV=production`), así que cada cambio de entidades trae su SQL en `deploy/`.
Todas son aditivas y se pueden correr más de una vez. Ya aplicadas en el servidor:

| Archivo | Qué hace |
|---|---|
| `migracion-lineas-y-borrado.sql` | Columnas `line` y `deleted_at` (no se usó: la BD se recreó desde cero) |
| `stock-paletas.sql` | `products.stock_quantity` — stock propio de las paletas |
| `helado-por-libra.sql` | Más decimales en cantidades + `scoops` / `ounces_per_scoop` en recetas |
| `paletas-en-recetas.sql` | Tabla `product_components` — paletas dentro de una receta |

Antes de aplicar una migración nueva conviene probarla con `ROLLBACK` en lugar de `COMMIT`.
