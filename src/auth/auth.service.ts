import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '../users/entities/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  async register(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono: string,
    rol?: Role,
  ) {
    const user = await this.usersService.create(
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol,
    );
    const payload = {
      sub: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      rol: user.rol,
      isActive: user.isActive,
    };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      rol: user.rol,
      isActive: user.isActive,
    };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        isActive: user.isActive,
      },
    };
  }
}
