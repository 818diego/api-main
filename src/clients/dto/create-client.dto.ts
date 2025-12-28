import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsOptional()
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  direccion?: string;
}

