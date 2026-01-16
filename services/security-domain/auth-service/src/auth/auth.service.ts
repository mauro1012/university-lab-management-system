import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // Buscar usuario en PostgreSQL (Amazon RDS) [cite: 271]
    const user = await this.usersService.findByEmail(email);
    
    // Validar contraseña con Bcrypt [cite: 32]
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el Payload según tu diseño de seguridad 
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role // Importante para el Control de Acceso [cite: 508, 628]
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}