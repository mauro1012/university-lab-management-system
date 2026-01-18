import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; 
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // --- NUEVO ENDPOINT DE REGISTRO PROTEGIDO ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Solo los ADMIN pueden crear usuarios
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}