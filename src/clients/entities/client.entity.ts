import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Rent } from '../../rents/entities/rent.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Rent, (rent) => rent.cliente)
  rents: Rent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

