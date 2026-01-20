# Fase 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias y el esquema de Prisma
COPY package*.json ./

COPY prisma ./prisma/ 

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma 
RUN npx prisma generate

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Fase 2: Imagen final ligera para producción
FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario de la fase anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copiamos prisma para poder correr migraciones si fuera necesario
COPY --from=builder /app/prisma ./prisma

# Exponemos el puerto 3000 (el que configuramos en Terraform para Auth)
EXPOSE 3000

# Comando para arrancar el servicio de autenticación
CMD ["node", "dist/main"]