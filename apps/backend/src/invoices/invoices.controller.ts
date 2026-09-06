import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    res.set({ 'Content-Type': 'application/pdf' });
    return this.service.generatePdf(+id);
  }
}
