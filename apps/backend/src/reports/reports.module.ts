import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderItemUsed } from '../orders/entities/order-item-used.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderItemUsed, Ingredient])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
