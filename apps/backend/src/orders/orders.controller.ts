import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { User } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query('all') all?: string) {
    const isAdmin = user.role?.name === 'admin';
    return this.service.findAll(isAdmin && all === 'true' ? undefined : user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: { customerName?: string }) {
    return this.service.createOrder(user, body.customerName);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() body: any) {
    return this.service.addItem(+id, body);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(+id, +itemId);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.service.completeOrder(+id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancelOrder(+id);
  }
}
