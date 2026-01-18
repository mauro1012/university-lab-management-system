import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; 
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { RolesGuard } from './guards/roles.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    // MEJORA: Definimos la estrategia por defecto para evitar errores de autenticación
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    RolesGuard 
  ],
  // MEJORA: Exportamos PassportModule y RolesGuard por si otros módulos los necesitan
  exports: [AuthService, PassportModule, RolesGuard], 
})
export class AuthModule {}