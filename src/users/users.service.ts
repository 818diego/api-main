import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono: string,
    rol?: Role,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telefono,
      rol: rol || Role.CLIENTE,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async createUser(createUserDto: CreateUserDto, adminUser?: any): Promise<Omit<User, 'password'>> {
    if (!adminUser || (adminUser.rol !== Role.ADMINISTRADOR && adminUser.rol !== Role.GERENTE)) {
      throw new ForbiddenException('Solo un administrador o gerente puede crear usuarios');
    }
    if (createUserDto.rol === Role.ADMINISTRADOR) {
      throw new BadRequestException('Contacta con soporte para crear otro usuario admin');
    }

    if (createUserDto.rol === Role.GERENTE) {
      throw new ForbiddenException('No puedes asignar el rol de gerente');
    }

    if (adminUser.rol === Role.GERENTE) {
      const allowedRoles = [Role.PROVEEDOR, Role.CLIENTE];
      const requestedRole = createUserDto.rol || Role.CLIENTE;
      if (!allowedRoles.includes(requestedRole)) {
        throw new ForbiddenException('El gerente solo puede crear usuarios de tipo proveedor o cliente');
      }
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser = this.usersRepository.create({
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      email: createUserDto.email,
      password: hashedPassword,
      telefono: createUserDto.telefono,
      rol: createUserDto.rol || Role.CLIENTE,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async getProfile(user: any): Promise<Omit<User, 'password'>> {
    const foundUser = await this.usersRepository.findOne({
      where: { id: user.id },
    });

    if (!foundUser) {
      throw new NotFoundException(`Usuario no encontrado`);
    }

    const { password, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }

  async findAll(user?: any): Promise<Omit<User, 'password'>[]> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  async findOne(id: number, user?: any): Promise<Omit<User, 'password'>> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso a esta información');
    }

    const foundUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { password, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto, adminUser?: any): Promise<Omit<User, 'password'>> {
    if (!adminUser || (adminUser.rol !== Role.ADMINISTRADOR && adminUser.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para actualizar usuarios');
    }

    if (updateUserDto.rol) {
      if (updateUserDto.rol === Role.ADMINISTRADOR) {
        throw new BadRequestException('Contacta con soporte para crear otro usuario admin');
      }

      if (updateUserDto.rol === Role.GERENTE) {
        throw new ForbiddenException('No puedes asignar el rol de gerente');
      }
    }

    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (adminUser.rol === Role.GERENTE && user.rol === Role.ADMINISTRADOR) {
      throw new ForbiddenException('No puedes editar un administrador');
    }

    if (adminUser.rol === Role.GERENTE && user.rol === Role.GERENTE) {
      throw new ForbiddenException('No puedes editar otro gerente');
    }

    if (updateUserDto.isActive !== undefined && adminUser.rol === Role.GERENTE && user.rol === Role.ADMINISTRADOR) {
      throw new ForbiddenException('No puedes cambiar el estado de un administrador');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number, user?: any): Promise<void> {
    if (!user || (user.rol !== Role.ADMINISTRADOR && user.rol !== Role.GERENTE)) {
      throw new ForbiddenException('No tienes acceso para eliminar usuarios');
    }

    const foundUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (user.rol === Role.GERENTE && foundUser.rol === Role.ADMINISTRADOR) {
      throw new ForbiddenException('No puedes eliminar un administrador');
    }

    await this.usersRepository.remove(foundUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
