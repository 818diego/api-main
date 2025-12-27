import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
  MaxLength,
} from 'class-validator';
import { TipoProveedor } from '../entities/tipo-proveedor.enum';

export class UpdateProviderDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'La razón social no puede exceder 255 caracteres' })
  razonSocial?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'El nombre de contacto no puede exceder 255 caracteres' })
  nombreContacto?: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El número de teléfono debe contener solo números y caracteres válidos',
  })
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  direccion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El estado no puede exceder 100 caracteres' })
  estado?: string;

  @IsEnum(TipoProveedor, {
    message: 'El tipo de proveedor debe ser uno de: vehiculos, alojamiento, equipos, servicios, otros',
  })
  @IsOptional()
  tipoProveedor?: TipoProveedor;

  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @IsOptional()
  isActive?: boolean;
}

