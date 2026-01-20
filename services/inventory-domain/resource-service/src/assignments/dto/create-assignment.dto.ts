import { IsUUID, IsDateString, IsBoolean, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsOptional()
  subject: string; 

  @IsUUID()
  laboratoryId: string;

  @IsString()
  teacherName: string; 

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  daysOfWeek?: string[];

  @IsDateString()
  @IsOptional()
  endDate?: string;
}