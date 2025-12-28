import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Role } from '../users/entities/role.enum';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, user?: any): Promise<Client> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('Solo un administrador o gerente puede crear clientes');
    }

    const newClient = this.clientsRepository.create({
      nombre: createClientDto.nombre,
      telefono: createClientDto.telefono,
      email: createClientDto.email,
      direccion: createClientDto.direccion,
    });

    return await this.clientsRepository.save(newClient);
  }

  async findAll(user?: any): Promise<Client[]> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    return await this.clientsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(user?: any): Promise<Client[]> {
    return await this.clientsRepository.find({
      where: { isActive: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number, user?: any): Promise<Client> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    const client = await this.clientsRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return client;
  }

  async update(
    id: number,
    updateClientDto: UpdateClientDto,
    user?: any,
  ): Promise<Client> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para actualizar clientes');
    }

    const client = await this.clientsRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    Object.assign(client, updateClientDto);

    return await this.clientsRepository.save(client);
  }

  async remove(id: number, user?: any): Promise<void> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para eliminar clientes');
    }

    const client = await this.clientsRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    await this.clientsRepository.remove(client);
  }
}

