import { Body, Controller, Headers, HttpCode, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Update } from 'telegraf/types';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() update: Update,
    @Headers('x-telegram-bot-api-secret-token') secretHeader: string,
  ) {
    const expectedSecret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET') ?? '';

    if (expectedSecret && secretHeader !== expectedSecret) {
      this.logger.warn('Webhook recibido con secret inválido');
      throw new UnauthorizedException();
    }

    await this.telegramService.handleUpdate(update);
  }
}
