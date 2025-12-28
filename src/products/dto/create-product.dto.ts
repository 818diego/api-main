import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { EstadoProducto } from '../entities/estado-producto.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @IsNotEmpty({ message: 'El stock es requerido' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsInt({ message: 'El ID del proveedor debe ser un número entero' })
  @IsNotEmpty({ message: 'El proveedor es requerido' })
  providerId: number;

  @IsEnum(EstadoProducto, {
    message: 'El estado debe ser uno de: disponible, en_renta, en_prestamo, no_disponible',
  })
  @IsOptional()
  estado?: EstadoProducto;
}

