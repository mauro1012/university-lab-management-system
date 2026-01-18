import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';

@Injectable()
export class LaboratoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createLaboratoryDto: CreateLaboratoryDto) {
    const exists = await this.prisma.laboratory.findUnique({
      where: { name: createLaboratoryDto.name }
    });
    if (exists) throw new ConflictException('El nombre del laboratorio ya existe');

    return this.prisma.laboratory.create({ data: createLaboratoryDto });
  }

  async findAll() {
    return this.prisma.laboratory.findMany();
  }

  // --- NUEVOS MÉTODOS ---

  async update(id: string, updateDto: Partial<CreateLaboratoryDto>) {
    const lab = await this.prisma.laboratory.findUnique({ where: { id } });
    if (!lab) throw new NotFoundException('Laboratorio no encontrado');

    // Si intenta cambiar el nombre, verificar que el nuevo no esté ocupado
    if (updateDto.name && updateDto.name !== lab.name) {
      const nameExists = await this.prisma.laboratory.findUnique({ where: { name: updateDto.name } });
      if (nameExists) throw new ConflictException('El nuevo nombre ya está en uso');
    }

    return this.prisma.laboratory.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    // Verificamos si tiene asignaciones antes de borrar
    const hasAssignments = await this.prisma.assignment.findFirst({
      where: { laboratoryId: id }
    });

    if (hasAssignments) {
      throw new ConflictException('No se puede eliminar: el laboratorio tiene reservas activas');
    }

    try {
      return await this.prisma.laboratory.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('Laboratorio no encontrado');
    }
  }
}