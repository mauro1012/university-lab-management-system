import { IsString, IsInt, Min, IsOptional, MaxLength } from 'class-validator';

export class CreateLaboratoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es de 1 persona' })
  capacity: number; // Aquí definiremos los 30 cupos

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  description?: string;
}