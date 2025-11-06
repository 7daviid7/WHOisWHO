# --- Fase 1: Base ---
# Utilitzem una imatge base de Node.js. 'bookworm' és una versió estable de Debian.
FROM node:20-bookworm-slim AS base

# Establim el directori de treball dins del contenidor
WORKDIR /app

# --- Fase 2: Dependències ---
# Aquesta fase només instal·la les dependències per aprofitar la memòria cau de Docker
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# --- Fase 3: Desenvolupament ---
# Aquesta fase prepara l'entorn per a desenvolupament
FROM base AS development
# Copiem les dependències ja instal·lades de la fase anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiem la resta del codi de l'aplicació
COPY . .
# El servidor de desenvolupament de Next.js s'exposa al port 3000
EXPOSE 3000
# La comanda per arrencar el servidor de desenvolupament
CMD ["npm", "run", "dev"]
