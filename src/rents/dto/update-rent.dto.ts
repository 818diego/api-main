import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsPositive,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TipoRentaPrestamo } from '../entities/tipo-renta-prestamo.enum';
import { UnidadTiempo } from '../entities/unidad-tiempo.enum';
import { EstadoRenta } from '../entities/estado-renta.enum';

export class UpdateRentDto {
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @IsOptional()
  clientId?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio total debe ser un número con máximo 2 decimales' })
  @IsOptional()
  @IsPositive({ message: 'El precio total debe ser mayor a 0' })
  precioTotal?: number;

  @IsInt({ message: 'La cantidad de tiempo debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'La cantidad de tiempo debe ser al menos 1' })
  cantidadTiempo?: number;

  @IsEnum(UnidadTiempo, {
    message: 'La unidad de tiempo debe ser: horas o dias',
  })
  @IsOptional()
  unidadTiempo?: UnidadTiempo;

  @IsEnum(TipoRentaPrestamo, {
    message: 'El tipo debe ser: renta o prestamo',
  })
  @IsOptional()
  tipo?: TipoRentaPrestamo;

  @IsEnum(EstadoRenta, {
    message: 'El estado debe ser uno de: esperando_recoger, en_progreso, pendiente_devolucion, recoger_producto, terminado',
  })
  @IsOptional()
  estado?: EstadoRenta;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsOptional()
  fechaInicio?: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsOptional()
  fechaFin?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @IsOptional()
  isActive?: boolean;
}

