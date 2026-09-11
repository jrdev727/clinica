FROM node:20-alpine

# Prisma necesita OpenSSL instalado explícitamente en Alpine para detectar
# la versión correcta del motor de consultas (si no, puede fallar recién
# al conectarse a la base en tiempo de ejecución, no en el build).
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN mkdir -p uploads

EXPOSE 3000

# Aplica las migraciones pendientes contra la base y recién ahí arranca el
# servidor. Seguro de correr en cada reinicio del contenedor: si no hay
# migraciones nuevas, no hace nada.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
