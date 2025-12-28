import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { EstadoProducto } from './estado-producto.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: EstadoProducto,
    default: EstadoProducto.NO_DISPONIBLE,
  })
  estado: EstadoProducto;

  @Column({ name: 'provider_id' })
  providerId: number;

  @ManyToOne(() => Provider, (provider) => provider.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  proveedor: Provider;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

