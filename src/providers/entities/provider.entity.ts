import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoProveedor } from './tipo-proveedor.enum';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  razonSocial: string;

  @Column()
  nombreContacto: string;

  @Column({ unique: true })
  email: string;

  @Column()
  telefono: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  estado: string;

  @Column({
    type: 'enum',
    enum: TipoProveedor,
    default: TipoProveedor.OTROS,
  })
  tipoProveedor: TipoProveedor;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

