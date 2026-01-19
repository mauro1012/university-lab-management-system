import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';

@Injectable()
export class LaboratoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaboratoryDto) {
    const exists = await this.prisma.laboratory.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('El nombre del laboratorio ya existe');
    return this.prisma.laboratory.create({ data: dto });
  }

  async findAll() {
    return this.prisma.laboratory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async update(id: string, dto: Partial<CreateLaboratoryDto>) {
    const lab = await this.prisma.laboratory.findUnique({ where: { id } });
    if (!lab) throw new NotFoundException('Laboratorio no encontrado');

    if (dto.name && dto.name !== lab.name) {
      const nameExists = await this.prisma.laboratory.findUnique({ where: { name: dto.name } });
      if (nameExists) throw new ConflictException('El nuevo nombre ya está en uso');
    }

    return this.prisma.laboratory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const hasAssignments = await this.prisma.assignment.findFirst({ where: { laboratoryId: id } });
    if (hasAssignments) {
      throw new ConflictException('No se puede eliminar: tiene reservas activas');
    }
    return this.prisma.laboratory.delete({ where: { id } });
  }
}