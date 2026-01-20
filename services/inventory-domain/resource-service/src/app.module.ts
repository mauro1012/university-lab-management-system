import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common/strategy/jwt.strategy';
import { AppController } from './app.controller'; 

@Module({
  imports: [
    LaboratoriesModule,
    AssignmentsModule,
    PassportModule,
    // Configuración de JWT sincronizada con el Auth Service
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController], 
  providers: [
    PrismaService, 
    JwtStrategy
  ],
  exports: [PrismaService],
})
export class AppModule {}