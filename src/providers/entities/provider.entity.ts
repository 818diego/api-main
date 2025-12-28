import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TipoProveedor } from './tipo-proveedor.enum';
import { Product } from '../../products/entities/product.entity';

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

  @OneToMany(() => Product, (product) => product.proveedor)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

