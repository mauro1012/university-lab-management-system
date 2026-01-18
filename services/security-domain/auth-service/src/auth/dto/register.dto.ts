import { IsEmail, IsString, MinLength, Matches, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña es demasiado débil. Debe contener 8 caracteres, mayúsculas, minúsculas, números y símbolos.',
  })
  password: string;

  @IsString()
  @Matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, { message: 'El nombre solo puede contener letras' })
  firstName: string;

  @IsString()
  @Matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, { message: 'El apellido solo puede contener letras' })
  lastName: string;

  @IsEnum(['ADMIN', 'TEACHER'], { message: 'Rol no válido' })
  role: string;
}