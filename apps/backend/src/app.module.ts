import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { FlavorsModule } from './flavors/flavors.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { TelegramModule } from './telegram/telegram.module';
import { SeederModule } from './database/seeder.module';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Flavor } from './flavors/entities/flavor.entity';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { InventoryMovement } from './ingredients/entities/inventory-movement.entity';
import { Product } from './products/entities/product.entity';
import { ProductStep } from './products/entities/product-step.entity';
import { ProductIngredient } from './products/entities/product-ingredient.entity';
import { ProductComponent } from './products/entities/product-component.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { OrderItemUsed } from './orders/entities/order-item-used.entity';
import { Invoice } from './invoices/entities/invoice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        database: config.get('POSTGRES_DB', 'sarita'),
        username: config.get('POSTGRES_USER', 'sarita_user'),
        password: config.get('POSTGRES_PASSWORD', 'sarita_pass'),
        entities: [
          Role, User, Category, Flavor, Ingredient, InventoryMovement,
          Product, ProductStep, ProductIngredient, ProductComponent,
          Order, OrderItem, OrderItemUsed, Invoice,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    FlavorsModule,
    IngredientsModule,
    ProductsModule,
    OrdersModule,
    InvoicesModule,
    ReportsModule,
    TelegramModule,
    SeederModule,
  ],
})
export class AppModule {}
