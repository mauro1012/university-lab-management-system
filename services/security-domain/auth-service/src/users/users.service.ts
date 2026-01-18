import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    if (!data.password) {
      throw new BadRequestException('La contraseña es obligatoria');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as Role || Role.TEACHER,
      },
    });
  }

  // --- NUEVO MÉTODO: Soluciona el error TS2339 en el controlador ---
  async update(id: string, data: any) {
    const updateData = { ...data };

    // Si se envía una contraseña, la encriptamos
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Si no hay contraseña nueva, eliminamos el campo para no borrar la actual
      delete updateData.password;
    }

    // Evitamos que se intente actualizar el ID
    delete updateData.id;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
  if (!id) throw new BadRequestException('ID de usuario no proporcionado');
  return this.prisma.user.findUnique({
    where: { id: id }
  });
}

  async updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}