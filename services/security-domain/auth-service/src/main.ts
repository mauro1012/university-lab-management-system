import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Importar la pipa de validación

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Elimina campos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían campos extraños
      transform: true,            // Convierte los tipos automáticamente
    }),
  );

  // 3. Habilitar CORS (necesario para tu frontend en Next.js)
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Servidor de Seguridad corriendo en: http://localhost:${port}`);
}
bootstrap();