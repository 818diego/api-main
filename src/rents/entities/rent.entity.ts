import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoRentaPrestamo } from './tipo-renta-prestamo.enum';
import { UnidadTiempo } from './unidad-tiempo.enum';
import { EstadoRenta } from './estado-renta.enum';
import { RentProduct } from './rent-product.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('rents')
export class Rent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @ManyToOne(() => Client, (client) => client.rents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  cliente: Client;

  @Column('decimal', { precision: 10, scale: 2 })
  precioTotal: number;

  @Column()
  cantidadTiempo: number;

  @Column({
    type: 'enum',
    enum: UnidadTiempo,
    default: UnidadTiempo.DIAS,
  })
  unidadTiempo: UnidadTiempo;

  @Column({
    type: 'enum',
    enum: TipoRentaPrestamo,
  })
  tipo: TipoRentaPrestamo;

  @Column({
    type: 'enum',
    enum: EstadoRenta,
    default: EstadoRenta.ESPERANDO_RECOGER,
  })
  estado: EstadoRenta;

  @Column({ type: 'datetime' })
  fechaInicio: Date;

  @Column({ type: 'datetime' })
  fechaFin: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaRecogida: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaDevolucion: Date;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RentProduct, (rentProduct) => rentProduct.rent, { cascade: true })
  rentProducts: RentProduct[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

