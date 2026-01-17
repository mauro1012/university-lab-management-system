import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';

@Injectable()
export class LaboratoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createLaboratoryDto: CreateLaboratoryDto) {
    // Validar si el nombre del laboratorio ya existe para evitar duplicados
    const exists = await this.prisma.laboratory.findUnique({
      where: { name: createLaboratoryDto.name }
    });

    if (exists) {
      throw new ConflictException('El nombre del laboratorio ya está registrado');
    }

    return this.prisma.laboratory.create({
      data: createLaboratoryDto,
    });
  }

  async findAll() {
    return this.prisma.laboratory.findMany();
  }
}