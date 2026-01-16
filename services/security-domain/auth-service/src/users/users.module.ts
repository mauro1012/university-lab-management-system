import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importamos Prisma para que el servicio funcione

@Module({
  imports: [PrismaModule],
  controllers: [UsersController], // <-- ¡Esto es lo que faltaba para que no de 404!
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}