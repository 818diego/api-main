import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rent } from './rent.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('rent_products')
export class RentProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rent_id' })
  rentId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Rent, (rent) => rent.rentProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rent_id' })
  rent: Rent;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precioUnitario: number;
}

