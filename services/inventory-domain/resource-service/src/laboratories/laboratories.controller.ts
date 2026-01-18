import { 
  Controller, Get, Post, Patch, Delete, 
  Body, Param, UseGuards 
} from '@nestjs/common'; // Agregados Patch, Delete, Param
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';     
import { Roles } from '../common/decorators/roles.decorator';

@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.laboratoriesService.findAll();
  }

  // --- NUEVAS RUTAS ---

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateLaboratoryDto>) {
    return this.laboratoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.laboratoriesService.remove(id);
  }
}