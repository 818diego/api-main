import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { Rent } from './entities/rent.entity';
import { RentProduct } from './entities/rent-product.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rent, RentProduct, Product, Client])],
  controllers: [RentsController],
  providers: [RentsService],
  exports: [RentsService],
})
export class RentsModule {}

