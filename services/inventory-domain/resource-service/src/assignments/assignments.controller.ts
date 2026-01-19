import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateAssignmentDto, @Req() req: any) {
    // CORRECCIÓN: Usamos req.user.sub que viene de la JwtStrategy
    return this.assignmentsService.assign(dto, req.user.sub, dto.teacherName);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() dto: Partial<CreateAssignmentDto>) {
    return this.assignmentsService.updateAssignment(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.assignmentsService.removeAssignment(id);
  }
}