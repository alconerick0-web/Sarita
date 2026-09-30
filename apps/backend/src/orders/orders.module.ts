import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemUsed } from './entities/order-item-used.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { TelegramModule } from '../telegram/telegram.module';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderItemUsed, Invoice]),
    ProductsModule,
    IngredientsModule,
    InvoicesModule,
    TelegramModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
