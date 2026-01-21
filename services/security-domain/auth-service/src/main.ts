import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('auth'); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. CORS (Añade el DNS de tu ALB para que el frontend pueda hablarle)
  app.enableCors({
    origin: '*', // En producción usa tu URL real, '*' para pruebas en QA es más fácil
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  // Solo un listen y en 0.0.0.0 para que AWS pueda entrar
  await app.listen(port, '0.0.0.0');
  
  console.log(`Servidor de Auth corriendo en puerto: ${port}`);
}
bootstrap();