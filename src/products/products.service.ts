import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../users/entities/role.enum';
import { Provider } from '../providers/entities/provider.entity';
import { EstadoProducto } from './entities/estado-producto.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async create(createProductDto: CreateProductDto, user?: any): Promise<Product> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('Solo un administrador o gerente puede crear productos');
    }

    const provider = await this.providersRepository.findOne({
      where: { id: createProductDto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${createProductDto.providerId} no encontrado`);
    }

    if (!provider.isActive) {
      throw new BadRequestException('No se pueden crear productos para proveedores inactivos');
    }

    const stock = createProductDto.stock;
    const estado = stock === 0 
      ? EstadoProducto.NO_DISPONIBLE 
      : (createProductDto.estado || EstadoProducto.DISPONIBLE);

    const newProduct = this.productsRepository.create({
      nombre: createProductDto.nombre,
      descripcion: createProductDto.descripcion,
      precio: createProductDto.precio,
      stock: stock,
      estado: estado,
      providerId: createProductDto.providerId,
    });

    return await this.productsRepository.save(newProduct);
  }

  async findAll(user?: any): Promise<Product[]> {
    return await this.productsRepository.find({
      relations: ['proveedor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(user?: any): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { isActive: true },
      relations: ['proveedor'],
      order: { nombre: 'ASC' },
    });
  }

  async findByProvider(providerId: number, user?: any): Promise<Product[]> {
    const provider = await this.providersRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${providerId} no encontrado`);
    }

    return await this.productsRepository.find({
      where: { providerId },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number, user?: any): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user?: any,
  ): Promise<Product> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para actualizar productos');
    }

    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['proveedor'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (updateProductDto.providerId && updateProductDto.providerId !== product.providerId) {
      const newProvider = await this.providersRepository.findOne({
        where: { id: updateProductDto.providerId },
      });

      if (!newProvider) {
        throw new NotFoundException(`Proveedor con ID ${updateProductDto.providerId} no encontrado`);
      }

      if (!newProvider.isActive) {
        throw new BadRequestException('No se puede asignar un producto a un proveedor inactivo');
      }
    }

    const estadoAnterior = product.estado;
    const stockAnterior = product.stock;

    const nuevoEstado = updateProductDto.estado !== undefined ? updateProductDto.estado : estadoAnterior;
    let nuevoStock = updateProductDto.stock !== undefined ? updateProductDto.stock : stockAnterior;

    if (updateProductDto.estado !== undefined && estadoAnterior !== nuevoEstado) {
      if (
        estadoAnterior === EstadoProducto.DISPONIBLE &&
        (nuevoEstado === EstadoProducto.EN_RENTA || nuevoEstado === EstadoProducto.EN_PRESTAMO)
      ) {
        if (stockAnterior <= 0) {
          throw new BadRequestException('No hay stock disponible para cambiar el estado');
        }
        nuevoStock = stockAnterior - 1;
      }
      else if (
        (estadoAnterior === EstadoProducto.EN_RENTA || estadoAnterior === EstadoProducto.EN_PRESTAMO) &&
        nuevoEstado === EstadoProducto.DISPONIBLE
      ) {
        nuevoStock = stockAnterior + 1;
      }
    }

    if (updateProductDto.stock !== undefined && updateProductDto.estado === undefined) {
      if (nuevoStock === 0) {
        updateProductDto.estado = EstadoProducto.NO_DISPONIBLE;
      }
      else if (estadoAnterior === EstadoProducto.NO_DISPONIBLE && nuevoStock > 0) {
        updateProductDto.estado = EstadoProducto.DISPONIBLE;
      }
    }

    if (nuevoStock === 0) {
      updateProductDto.estado = EstadoProducto.NO_DISPONIBLE;
    }

    updateProductDto.stock = nuevoStock;
    Object.assign(product, updateProductDto);

    return await this.productsRepository.save(product);
  }

  async remove(id: number, user?: any): Promise<void> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para eliminar productos');
    }

    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    await this.productsRepository.remove(product);
  }
}

