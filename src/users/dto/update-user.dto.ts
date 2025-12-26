import { IsEmail, IsString, MinLength, Matches, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Role } from '../entities/role.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El número de teléfono debe contener solo números y caracteres válidos' })
  @IsOptional()
  telefono?: string;

  @IsEnum(Role, { message: 'El rol debe ser uno de: administrador, gerente, proveedor, cliente' })
  @IsOptional()
  rol?: Role;

  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @IsOptional()
  isActive?: boolean;
}
