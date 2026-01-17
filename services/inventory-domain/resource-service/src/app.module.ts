import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common/strategy/jwt.strategy';

@Module({
  imports: [
    LaboratoriesModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key', //Same key as Auth Service
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [PrismaService, JwtStrategy], // We registered the basic services
  exports: [PrismaService],
})
export class AppModule {}