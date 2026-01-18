import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; 



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Encriptar la contraseña antes de guardar
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // 2. Crear el objeto de usuario para el UsersService
      const newUser = await this.usersService.createUser(registerDto);

    // 3. Retornar el usuario creado (sin la contraseña por seguridad)
    const { password, ...result } = newUser;
    return result;
  }

  async login(email: string, pass: string) {
    // 1. Buscar usuario en PostgreSQL
    const user = await this.usersService.findByEmail(email);
    
    // 2. Validar contraseña con Bcrypt
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar el Payload para el JWT (Información encriptada)
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      name: `${user.firstName} ${user.lastName}`
    };

    // 4. Retornar el token Y el objeto de usuario (Información para el Frontend)
    // Esto es lo que permite que el Navbar muestre el rol correctamente
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // <-- IMPORTANTE: Ahora el frontend recibirá 'ADMIN' o 'TEACHER'
        name: `${user.firstName} ${user.lastName}`
      }
    };
  }
}