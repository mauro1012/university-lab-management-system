import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo para que coincida con la ruta del Balanceador (ALB)
  app.setGlobalPrefix('auth'); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CONFIGURACIÓN DE CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://university-lab-management-system.vercel.app', // link de Vercel
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = process.env.PORT || 3000;
  
  // Importante: '0.0.0.0' permite conexiones externas en AWS
  await app.listen(port, '0.0.0.0');
  
  console.log(`Servidor de Auth corriendo en: http://0.0.0.0:${port}/auth`);
}
bootstrap();