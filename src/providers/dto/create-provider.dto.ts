import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { TipoProveedor } from '../entities/tipo-proveedor.enum';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty({ message: 'La razón social es requerida' })
  @MaxLength(255, { message: 'La razón social no puede exceder 255 caracteres' })
  razonSocial: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de contacto es requerido' })
  @MaxLength(255, { message: 'El nombre de contacto no puede exceder 255 caracteres' })
  nombreContacto: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El número de teléfono debe contener solo números y caracteres válidos',
  })
  telefono: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  direccion: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudad: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado es requerido' })
  @MaxLength(100, { message: 'El estado no puede exceder 100 caracteres' })
  estado: string;

  @IsEnum(TipoProveedor, {
    message: 'El tipo de proveedor debe ser uno de: vehiculos, alojamiento, equipos, servicios, otros',
  })
  @IsOptional()
  tipoProveedor?: TipoProveedor;
}

