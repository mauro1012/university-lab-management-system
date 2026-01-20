# Fase 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma (CRÍTICO para AWS)
RUN npx prisma generate

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Fase 2: Ejecución (Imagen ligera)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto que definimos en Terraform (3001 para Resource)
EXPOSE 3001

# Comando para arrancar la app
CMD ["node", "dist/main"]