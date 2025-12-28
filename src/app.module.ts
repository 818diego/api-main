import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { ProductsModule } from './products/products.module';
import { ClientsModule } from './clients/clients.module';
import { RentsModule } from './rents/rents.module';
import { User } from './users/entities/user.entity';
import { Provider } from './providers/entities/provider.entity';
import { Product } from './products/entities/product.entity';
import { Client } from './clients/entities/client.entity';
import { Rent } from './rents/entities/rent.entity';
import { RentProduct } from './rents/entities/rent-product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'nest_auth'),
        entities: [User, Provider, Product, Client, Rent, RentProduct],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProvidersModule,
    ProductsModule,
    ClientsModule,
    RentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
