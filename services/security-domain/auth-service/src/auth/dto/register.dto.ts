import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email no válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(['ADMIN', 'TEACHER'], { message: 'Rol no válido' })
  role: string;
}