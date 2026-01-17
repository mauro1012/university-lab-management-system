import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';     
import { Roles } from '../common/decorators/roles.decorator';

@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @Roles('ADMIN') // Solo el administrador crea aulas
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Cualquier usuario autenticado puede ver los laboratorios
  findAll() {
    return this.laboratoriesService.findAll();
  }
}