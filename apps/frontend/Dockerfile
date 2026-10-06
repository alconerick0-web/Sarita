FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Se incrusta en el bundle al compilar: cambiarlo requiere reconstruir la imagen.
# Obligatorio: docker build --build-arg PUBLIC_API_URL=https://sarita.tucalledice.org ...
ARG PUBLIC_API_URL
RUN test -n "$PUBLIC_API_URL" || (echo "Falta --build-arg PUBLIC_API_URL" && exit 1)
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
