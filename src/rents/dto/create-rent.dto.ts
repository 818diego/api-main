import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  IsPositive,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TipoRentaPrestamo } from '../entities/tipo-renta-prestamo.enum';
import { UnidadTiempo } from '../entities/unidad-tiempo.enum';

export class ProductoRentaDto {
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productId: number;
}

export class CreateRentDto {
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @IsNotEmpty({ message: 'El cliente es requerido' })
  clientId: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio total debe ser un número con máximo 2 decimales' })
  @IsNotEmpty({ message: 'El precio total es requerido' })
  @IsPositive({ message: 'El precio total debe ser mayor a 0' })
  precioTotal: number;

  @IsInt({ message: 'La cantidad de tiempo debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad de tiempo es requerida' })
  @Min(1, { message: 'La cantidad de tiempo debe ser al menos 1' })
  cantidadTiempo: number;

  @IsEnum(UnidadTiempo, {
    message: 'La unidad de tiempo debe ser: horas o dias',
  })
  @IsNotEmpty({ message: 'La unidad de tiempo es requerida' })
  unidadTiempo: UnidadTiempo;

  @IsEnum(TipoRentaPrestamo, {
    message: 'El tipo debe ser: renta o prestamo',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: TipoRentaPrestamo;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' })
  @IsOptional()
  fechaInicio?: string;

  @IsArray({ message: 'Los productos deben ser un array' })
  @IsNotEmpty({ message: 'Debe incluir al menos un producto' })
  productos: ProductoRentaDto[];

  @IsString()
  @IsOptional()
  notas?: string;
}

