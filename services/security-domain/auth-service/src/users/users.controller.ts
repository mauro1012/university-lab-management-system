import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Guardia de autenticación
import { RolesGuard } from '../auth/guards/roles.guard';     // Guardia de roles
import { Roles } from '../auth/decorators/roles.decorator';   // Decorador personalizado

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  // --- RUTA DE PRUEBA ---
  @Get('admin-only')
  @Roles('ADMIN') // Solo permite ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard) // Valida Token y luego Rol
  async testAdmin() {
    return {
      message: 'Acceso concedido: El sistema reconoce tu rol de ADMINISTRADOR',
      timestamp: new Date().toISOString()
    };
  }
}