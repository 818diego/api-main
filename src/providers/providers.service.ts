import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Role } from '../users/entities/role.enum';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto, user?: any): Promise<Provider> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('Solo un administrador o gerente puede crear proveedores');
    }

    const existingProvider = await this.providersRepository.findOne({
      where: { email: createProviderDto.email },
    });

    if (existingProvider) {
      throw new ConflictException('El email ya está registrado para otro proveedor');
    }

    const newProvider = this.providersRepository.create({
      ...createProviderDto,
    });

    return await this.providersRepository.save(newProvider);
  }

  async findAll(user?: any): Promise<Provider[]> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    return await this.providersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(user?: any): Promise<Provider[]> {
    return await this.providersRepository.find({
      where: { isActive: true },
      order: { razonSocial: 'ASC' },
    });
  }

  async findOne(id: number, user?: any): Promise<Provider> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    const provider = await this.providersRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return provider;
  }

  async update(
    id: number,
    updateProviderDto: UpdateProviderDto,
    user?: any,
  ): Promise<Provider> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para actualizar proveedores');
    }

    const provider = await this.providersRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    if (updateProviderDto.email && updateProviderDto.email !== provider.email) {
      const existingProvider = await this.providersRepository.findOne({
        where: { email: updateProviderDto.email },
      });

      if (existingProvider) {
        throw new ConflictException('El email ya está registrado para otro proveedor');
      }
    }

    Object.assign(provider, updateProviderDto);

    return await this.providersRepository.save(provider);
  }

  async remove(id: number, user?: any): Promise<void> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para eliminar proveedores');
    }

    const provider = await this.providersRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    await this.providersRepository.remove(provider);
  }
}

