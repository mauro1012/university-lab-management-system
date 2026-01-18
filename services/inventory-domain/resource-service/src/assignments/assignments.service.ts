import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS DE ASIGNACIONES ---

  async assign(dto: CreateAssignmentDto, adminId: string, teacherName: string) {
    const lab = await this.prisma.laboratory.findUnique({ where: { id: dto.laboratoryId } });
    if (!lab) throw new NotFoundException('El laboratorio no existe');

    await this.checkConflicts(dto.laboratoryId, dto.startTime, dto.endTime, dto.daysOfWeek);

    return this.prisma.assignment.create({
      data: {
        teacherId: adminId,
        teacherName,
        laboratoryId: dto.laboratoryId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        isRecurring: dto.isRecurring || false,
        daysOfWeek: dto.daysOfWeek || [],
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: { laboratory: true }
    });
  }

  async findAll() {
    return this.prisma.assignment.findMany({
      include: { laboratory: true },
      orderBy: { startTime: 'asc' }
    });
  }

  async updateAssignment(id: string, dto: Partial<CreateAssignmentDto>) {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación no encontrada');

    // Si se cambian horas o días, validar conflictos nuevamente
    if (dto.startTime || dto.endTime || dto.daysOfWeek) {
      await this.checkConflicts(
        dto.laboratoryId || existing.laboratoryId,
        dto.startTime || existing.startTime.toISOString(),
        dto.endTime || existing.endTime.toISOString(),
        dto.daysOfWeek || existing.daysOfWeek,
        id // Excluir la asignación actual de la búsqueda de conflictos
      );
    }

    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: { laboratory: true }
    });
  }

  async removeAssignment(id: string) {
    try {
      return await this.prisma.assignment.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('No se pudo eliminar la asignación (ID no existe)');
    }
  }

  // --- MÉTODOS DE LABORATORIOS (Gestión del Admin) ---

  async updateLaboratory(id: string, data: any) {
    return this.prisma.laboratory.update({ where: { id }, data });
  }

  async removeLaboratory(id: string) {
    // Nota: Esto fallará si el lab tiene asignaciones (integridad referencial)
    return this.prisma.laboratory.delete({ where: { id } });
  }

  // --- UTILITARIOS ---
  private async checkConflicts(labId: string, start: string, end: string, days: string[], excludeId?: string) {
    const conflict = await this.prisma.assignment.findFirst({
      where: {
        id: { not: excludeId }, // Para actualizaciones
        laboratoryId: labId,
        startTime: { lt: new Date(end) },
        endTime: { gt: new Date(start) },
        daysOfWeek: { hasSome: days || [] },
      },
    });
    if (conflict) throw new ConflictException('Conflicto: El laboratorio ya está ocupado.');
  }
}