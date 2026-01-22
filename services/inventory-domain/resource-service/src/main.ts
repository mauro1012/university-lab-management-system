import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo para Resource (coincide con tu configuración de AWS ALB)
  app.setGlobalPrefix('resource'); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CONFIGURACIÓN DE CORS REFORZADA
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://university-lab-management-system.vercel.app', // Tu link oficial de Vercel
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // El servicio de Resource usa el 3001
  const port = process.env.PORT || 3001;
  
  // Escuchando en 0.0.0.0 para que el Target Group de AWS lo encuentre
  await app.listen(port, '0.0.0.0');
  
  console.log(`Servidor de Recursos corriendo en: http://0.0.0.0:${port}/resource`);
}
bootstrap();