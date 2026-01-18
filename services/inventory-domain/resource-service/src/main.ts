import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activa la validación global para que funcionen los DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Habilita CORS para permitir peticiones desde el frontend o Postman
  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Resource Service is running on: http://localhost:${port}`);
}
bootstrap();