import { Controller, Get, Post, Body, UseGuards, Delete, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todas las rutas de este controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Crear usuario (Solo Admin)
  @Post()
  @Roles('ADMIN')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  // Obtener todos los usuarios (Para llenar la tabla del Admin)
  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll();
  }

  // Eliminar un usuario por ID
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // --- RUTA DE PRUEBA ---
  @Get('admin-only')
  @Roles('ADMIN')
  async testAdmin() {
    return {
      message: 'Acceso concedido: El sistema reconoce tu rol de ADMINISTRADOR',
      timestamp: new Date().toISOString()
    };
  }

// Actualizar usuario por ID
  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
 }
}