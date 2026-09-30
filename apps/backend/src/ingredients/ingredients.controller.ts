import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IngredientsService } from './ingredients.service';
import { User } from '../users/entities/user.entity';

@Controller('ingredients')
@UseGuards(JwtAuthGuard)
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('low-stock')
  lowStock() {
    return this.service.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggle(@Param('id') id: string) {
    return this.service.toggle(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post(':id/restock')
  @UseGuards(RolesGuard)
  @Roles('admin')
  restock(
    @Param('id') id: string,
    @Body() body: { quantity: number; reason: string },
    @CurrentUser() user: User,
  ) {
    return this.service.restock(+id, body.quantity, body.reason, user);
  }

  @Get(':id/movements')
  @UseGuards(RolesGuard)
  @Roles('admin')
  movements(@Param('id') id: string) {
    return this.service.findMovements(+id);
  }
}
