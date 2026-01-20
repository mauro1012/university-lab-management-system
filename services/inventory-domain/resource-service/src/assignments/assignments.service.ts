import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async assign(dto: CreateAssignmentDto, adminId: string, teacherName: string) {
    const lab = await this.prisma.laboratory.findUnique({ where: { id: dto.laboratoryId } });
    if (!lab) throw new NotFoundException('El laboratorio no existe');

    await this.checkConflicts(dto.laboratoryId, dto.startTime, dto.endTime, dto.daysOfWeek || []);

    return this.prisma.assignment.create({
      data: {
        subject: dto.subject,
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

  async updateAssignment(id: string, dto: Partial<CreateAssignmentDto>) {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación no encontrada');

    if (dto.startTime || dto.endTime || dto.daysOfWeek || dto.laboratoryId) {
      await this.checkConflicts(
        dto.laboratoryId || existing.laboratoryId,
        dto.startTime || existing.startTime.toISOString(),
        dto.endTime || existing.endTime.toISOString(),
        dto.daysOfWeek || existing.daysOfWeek,
        id
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

  private async checkConflicts(labId: string, start: string, end: string, days: string[], excludeId?: string) {
    const newStart = new Date(start);
    const newEnd = new Date(end);
    
    // 1. Determinar qué días de la semana queremos validar
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const daysToCompare = days.length > 0 ? days : [dayNames[newStart.getDay()]];

    // 2. Extraer solo la hora (HH:mm) para ignorar la fecha calendario
    const newStartSeconds = newStart.getHours() * 3600 + newStart.getMinutes() * 60;
    const newEndSeconds = newEnd.getHours() * 3600 + newEnd.getMinutes() * 60;

    // 3. Traer todas las asignaciones del laboratorio que compartan días de la semana
    const existingAssignments = await this.prisma.assignment.findMany({
      where: {
        id: { not: excludeId },
        laboratoryId: labId,
        daysOfWeek: { hasSome: daysToCompare },
      },
    });

    // 4. Comparar manualmente el traslape de horas
    for (const conflict of existingAssignments) {
      const existStartSeconds = conflict.startTime.getHours() * 3600 + conflict.startTime.getMinutes() * 60;
      const existEndSeconds = conflict.endTime.getHours() * 3600 + conflict.endTime.getMinutes() * 60;

      // Lógica de traslape: (Inicio1 < Fin2) Y (Fin1 > Inicio2)
      const hasOverlap = newStartSeconds < existEndSeconds && newEndSeconds > existStartSeconds;

      if (hasOverlap) {
        throw new ConflictException(
          `Conflicto: El laboratorio ya está ocupado los días [${conflict.daysOfWeek.join(', ')}] por el Prof. ${conflict.teacherName} de ${conflict.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} a ${conflict.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        );
      }
    }
  }

  async findAll() {
    return this.prisma.assignment.findMany({
      include: { laboratory: true },
      orderBy: { startTime: 'desc' }
    });
  }

  async removeAssignment(id: string) {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación no encontrada');
    return this.prisma.assignment.delete({ where: { id } });
  }
}