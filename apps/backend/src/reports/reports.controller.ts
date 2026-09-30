import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.service.getDashboardStats();
  }

  @Get('revenue')
  revenue(@Query('period') period: 'day' | 'week' | 'month' = 'week') {
    return this.service.getRevenueSummary(period);
  }

  @Get('top-products')
  topProducts(@Query('limit') limit?: string) {
    return this.service.getTopProducts(limit ? +limit : 10);
  }

  @Get('ingredient-consumption')
  consumption(@Query('from') from: string, @Query('to') to: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.service.getIngredientConsumption(from ?? today, to ?? today);
  }
}
