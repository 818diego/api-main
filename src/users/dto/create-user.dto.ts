import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El número de teléfono debe contener solo números y caracteres válidos' })
  telefono: string;

  @IsEnum(Role, { message: 'El rol debe ser uno de: administrador, gerente, proveedor, cliente' })
  @IsOptional()
  rol?: Role;
}
