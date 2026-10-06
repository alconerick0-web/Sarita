FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
# Puppeteer usa el Chromium del sistema (ver imagen final), no descarga el suyo
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
# Chromium para generar PDFs con puppeteer
RUN apk add --no-cache chromium nss freetype harfbuzz ttf-freefont font-noto
ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
CMD ["node", "dist/main"]
