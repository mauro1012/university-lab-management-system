import { Injectable, BadRequestException } from '@nestjs/common'; // Agrega BadRequestException
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    // 1. Validación Crítica: Si no hay password, lanzamos un error 400
    if (!data.password) {
      throw new BadRequestException('La contraseña (password) es obligatoria en el cuerpo de la petición');
    }

    // 2. Encriptación: Solo ocurre si el dato existe
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as Role || Role.USER,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

//  Método para listar todos
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

 async update(id: string, data: any) {
  // Si envían password, hay que encriptarla de nuevo
  if (data.password && data.password.trim() !== "") {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password; // No actualizamos password si viene vacía
  }

  return this.prisma.user.update({
    where: { id },
    data,
  });
}

// Método para eliminar
  async remove(id: string) {
  // Opcional: Validar que el usuario existe antes de borrar
    return this.prisma.user.delete({
      where: { id },
   });
 } 
}