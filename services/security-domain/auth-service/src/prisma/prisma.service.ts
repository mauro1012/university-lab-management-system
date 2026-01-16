import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Esto conecta a la base de datos de Docker al arrancar
    await this.$connect();
  }

  async onModuleDestroy() {
    // Esto cierra la conexión al apagar el servidor
    await this.$disconnect();
  }
}