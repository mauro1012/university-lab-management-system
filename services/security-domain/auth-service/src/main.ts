import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Esto permite que el servidor use el puerto 3000 que definimos en el .env
  await app.listen(process.env.PORT || 3000);
  console.log(`Servidor corriendo en: ${await app.getUrl()}`);
}
bootstrap();