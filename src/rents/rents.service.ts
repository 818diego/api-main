import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rent } from './entities/rent.entity';
import { RentProduct } from './entities/rent-product.entity';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Role } from '../users/entities/role.enum';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { EstadoRenta } from './entities/estado-renta.enum';
import { EstadoProducto } from '../products/entities/estado-producto.enum';
import { UnidadTiempo } from './entities/unidad-tiempo.enum';

@Injectable()
export class RentsService {
  constructor(
    @InjectRepository(Rent)
    private rentsRepository: Repository<Rent>,
    @InjectRepository(RentProduct)
    private rentProductsRepository: Repository<RentProduct>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  private calculateFechaFin(fechaInicio: Date, cantidadTiempo: number, unidadTiempo: UnidadTiempo): Date {
    const fechaFin = new Date(fechaInicio);
    
    if (unidadTiempo === UnidadTiempo.HORAS) {
      fechaFin.setHours(fechaFin.getHours() + cantidadTiempo);
    } else if (unidadTiempo === UnidadTiempo.DIAS) {
      fechaFin.setDate(fechaFin.getDate() + cantidadTiempo);
    }
    
    return fechaFin;
  }

  async create(createRentDto: CreateRentDto, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('Solo un administrador o gerente puede crear rentas');
    }

    const client = await this.clientsRepository.findOne({
      where: { id: createRentDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${createRentDto.clientId} no encontrado`);
    }

    if (!client.isActive) {
      throw new BadRequestException('No se pueden crear rentas para clientes inactivos');
    }

    const productos = await Promise.all(
      createRentDto.productos.map(async (prodDto) => {
        const producto = await this.productsRepository.findOne({
          where: { id: prodDto.productId },
        });

        if (!producto) {
          throw new NotFoundException(`Producto con ID ${prodDto.productId} no encontrado`);
        }

        if (!producto.isActive) {
          throw new BadRequestException(`El producto "${producto.nombre}" no está activo`);
        }

        if (producto.stock <= 0 || producto.estado === EstadoProducto.NO_DISPONIBLE) {
          throw new BadRequestException(`El producto "${producto.nombre}" no tiene stock disponible`);
        }

        if (producto.estado === EstadoProducto.EN_RENTA || producto.estado === EstadoProducto.EN_PRESTAMO) {
          throw new BadRequestException(`El producto "${producto.nombre}" ya está en renta o préstamo`);
        }

        return producto;
      }),
    );

    const fechaInicio = createRentDto.fechaInicio 
      ? new Date(createRentDto.fechaInicio) 
      : new Date();
    
    const fechaFin = this.calculateFechaFin(
      fechaInicio,
      createRentDto.cantidadTiempo,
      createRentDto.unidadTiempo,
    );

    const newRent = this.rentsRepository.create({
      clientId: createRentDto.clientId,
      precioTotal: createRentDto.precioTotal,
      cantidadTiempo: createRentDto.cantidadTiempo,
      unidadTiempo: createRentDto.unidadTiempo,
      tipo: createRentDto.tipo,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      notas: createRentDto.notas,
      estado: EstadoRenta.ESPERANDO_RECOGER,
    });

    const savedRent = await this.rentsRepository.save(newRent);

    const rentProducts = productos.map((producto) => {
      const rentProduct = this.rentProductsRepository.create({
        rentId: savedRent.id,
        productId: producto.id,
        precioUnitario: producto.precio,
      });

      producto.estado =
        createRentDto.tipo === 'renta' ? EstadoProducto.EN_RENTA : EstadoProducto.EN_PRESTAMO;
      producto.stock = producto.stock - 1;
      if (producto.stock === 0) {
        producto.estado = EstadoProducto.NO_DISPONIBLE;
      }

      return rentProduct;
    });

    await this.rentProductsRepository.save(rentProducts);
    await this.productsRepository.save(productos);

    const rentWithProducts = await this.rentsRepository.findOne({
      where: { id: savedRent.id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentWithProducts) {
      throw new NotFoundException('Error al crear la renta');
    }

    return this.removeClientIdIfClientPresent(rentWithProducts);
  }

  private removeClientIdIfClientPresent(rent: Rent): any {
    if (rent.cliente) {
      const { clientId, ...rentWithoutClientId } = rent;
      return rentWithoutClientId;
    }
    return rent;
  }

  async findAll(user?: any): Promise<Rent[]> {
    const rents = await this.rentsRepository.find({
      relations: ['cliente', 'rentProducts'],
      order: { createdAt: 'DESC' },
    });
    return rents.map((rent) => this.removeClientIdIfClientPresent(rent));
  }

  async findOne(id: number, user?: any): Promise<Rent> {
    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    return this.removeClientIdIfClientPresent(rent);
  }

  async update(id: number, updateRentDto: UpdateRentDto, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para actualizar rentas');
    }

    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (updateRentDto.clientId && updateRentDto.clientId !== rent.clientId) {
      const newClient = await this.clientsRepository.findOne({
        where: { id: updateRentDto.clientId },
      });

      if (!newClient) {
        throw new NotFoundException(`Cliente con ID ${updateRentDto.clientId} no encontrado`);
      }

      if (!newClient.isActive) {
        throw new BadRequestException('No se puede asignar una renta a un cliente inactivo');
      }
    }

    if (updateRentDto.fechaInicio || updateRentDto.cantidadTiempo || updateRentDto.unidadTiempo) {
      const fechaInicio = updateRentDto.fechaInicio
        ? new Date(updateRentDto.fechaInicio)
        : rent.fechaInicio;
      const cantidadTiempo = updateRentDto.cantidadTiempo ?? rent.cantidadTiempo;
      const unidadTiempo = updateRentDto.unidadTiempo ?? rent.unidadTiempo;

      rent.fechaFin = this.calculateFechaFin(fechaInicio, cantidadTiempo, unidadTiempo);
    }

    Object.assign(rent, updateRentDto);

    const updatedRent = await this.rentsRepository.save(rent);
    const rentWithRelations = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentWithRelations) {
      throw new NotFoundException('Error al actualizar la renta');
    }

    return this.removeClientIdIfClientPresent(rentWithRelations);
  }

  async clienteRecoger(id: number, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para marcar rentas como recogidas');
    }

    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (rent.estado !== EstadoRenta.ESPERANDO_RECOGER) {
      throw new BadRequestException(
        `Solo se pueden marcar como recogidas las rentas en estado "esperando_recoger". Estado actual: ${rent.estado}`,
      );
    }

    rent.estado = EstadoRenta.EN_PROGRESO;
    rent.fechaRecogida = new Date();

    const savedRent = await this.rentsRepository.save(rent);
    const rentWithRelations = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentWithRelations) {
      throw new NotFoundException('Error al actualizar la renta');
    }

    return this.removeClientIdIfClientPresent(rentWithRelations);
  }

  async finalizarTiempo(id: number, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para finalizar el tiempo de renta');
    }

    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (rent.estado !== EstadoRenta.EN_PROGRESO) {
      throw new BadRequestException(
        `Solo se puede finalizar el tiempo de las rentas en estado "en_progreso". Estado actual: ${rent.estado}`,
      );
    }

    rent.estado = EstadoRenta.PENDIENTE_DEVOLUCION;

    await this.rentsRepository.save(rent);
    const rentWithRelations = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentWithRelations) {
      throw new NotFoundException('Error al actualizar la renta');
    }

    return this.removeClientIdIfClientPresent(rentWithRelations);
  }

  async marcarParaRecoger(id: number, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para marcar rentas para recoger');
    }

    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (rent.estado !== EstadoRenta.PENDIENTE_DEVOLUCION) {
      throw new BadRequestException(
        `Solo se pueden marcar para recoger las rentas en estado "pendiente_devolucion". Estado actual: ${rent.estado}`,
      );
    }

    rent.estado = EstadoRenta.RECOGER_PRODUCTO;

    await this.rentsRepository.save(rent);
    const rentWithRelations = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentWithRelations) {
      throw new NotFoundException('Error al actualizar la renta');
    }

    return this.removeClientIdIfClientPresent(rentWithRelations);
  }

  async finalizarRenta(id: number, user?: any): Promise<Rent> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para finalizar rentas');
    }

    // Cargar con productos para actualizar stock
    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['rentProducts', 'rentProducts.product'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (rent.estado !== EstadoRenta.RECOGER_PRODUCTO) {
      throw new BadRequestException(
        `Solo se pueden finalizar las rentas en estado "recoger_producto". Estado actual: ${rent.estado}`,
      );
    }

    rent.estado = EstadoRenta.TERMINADO;
    rent.fechaDevolucion = new Date();

    const productos = rent.rentProducts.map((rp) => rp.product);
    productos.forEach((producto) => {
      producto.estado = EstadoProducto.DISPONIBLE;
      producto.stock = producto.stock + 1;
    });

    await this.productsRepository.save(productos);
    await this.rentsRepository.save(rent);

    const rentFinalizada = await this.rentsRepository.findOne({
      where: { id },
      relations: ['cliente', 'rentProducts'],
    });

    if (!rentFinalizada) {
      throw new NotFoundException('Error al finalizar la renta');
    }

    return this.removeClientIdIfClientPresent(rentFinalizada);
  }

  async remove(id: number, user?: any): Promise<void> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para eliminar rentas');
    }

    // Cargar con productos para restaurar stock si es necesario
    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: ['rentProducts', 'rentProducts.product'],
    });

    if (!rent) {
      throw new NotFoundException(`Renta con ID ${id} no encontrada`);
    }

    if (rent.estado !== EstadoRenta.TERMINADO) {
      const productos = rent.rentProducts.map((rp) => rp.product);
      productos.forEach((producto) => {
        producto.estado = EstadoProducto.DISPONIBLE;
        producto.stock = producto.stock + 1;
      });
      await this.productsRepository.save(productos);
    }

    await this.rentsRepository.remove(rent);
  }
}

