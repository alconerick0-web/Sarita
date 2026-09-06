import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/types';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  bot: Telegraf;

  // chatId → esperando email de verificación
  private readonly pendingVerification = new Map<string, true>();

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN no configurado — bot deshabilitado');
      return;
    }

    this.bot = new Telegraf(token);
    this.registerHandlers();

    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    const webhookUrl = this.config.get<string>('TELEGRAM_WEBHOOK_URL');

    if (isDev || !webhookUrl) {
      // Modo local: polling — no necesita URL pública
      await this.bot.telegram.deleteWebhook();
      this.bot.launch();
      this.logger.log('Bot de Telegram iniciado en modo polling (desarrollo)');
      process.once('SIGINT', () => this.bot?.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));
    } else {
      // Modo producción: webhook
      const secret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET') ?? '';
      const endpoint = `${webhookUrl}/api/telegram/webhook`;
      await this.bot.telegram.setWebhook(endpoint, { secret_token: secret || undefined });
      this.logger.log(`Bot de Telegram iniciado en modo webhook: ${endpoint}`);
    }
  }

  // Llamado desde TelegramController en cada POST de Telegram
  async handleUpdate(update: Update) {
    if (!this.bot) return;
    await this.bot.handleUpdate(update);
  }

  // ─── Handlers del bot ────────────────────────────────────────────────────
  private registerHandlers() {
    // /start → pide correo
    this.bot.start(async (ctx: Context) => {
      const chatId = String(ctx.chat!.id);
      const existing = await this.userRepo.findOne({
        where: { telegramChatId: chatId, active: true },
        relations: { role: true },
      });

      if (existing) {
        await ctx.reply(
          `✅ Ya estás vinculado como *${existing.name}* (${existing.role?.name ?? '—'}).\nRecibirás las notificaciones de Sarita aquí.`,
          { parse_mode: 'Markdown' },
        );
        return;
      }

      this.pendingVerification.set(chatId, true);
      await ctx.reply(
        '👋 Bienvenido al sistema *Sarita* 🍦\n\nPara vincular tu cuenta, escribe tu *correo electrónico* registrado en el sistema:',
        { parse_mode: 'Markdown' },
      );
    });

    // Texto libre → flujo de verificación por email
    this.bot.on('text', async (ctx: Context) => {
      const chatId = String(ctx.chat!.id);
      if (!this.pendingVerification.has(chatId)) return;

      const email = (ctx as any).message.text.trim().toLowerCase();
      const user = await this.userRepo.findOne({
        where: { email, active: true },
        relations: { role: true },
      });

      if (!user) {
        this.pendingVerification.delete(chatId);
        await ctx.reply(
          `❌ No encontré ningún usuario con el correo *${email}*.\n\nVerifica el correo e intenta de nuevo con /start.`,
          { parse_mode: 'Markdown' },
        );
        return;
      }

      user.telegramChatId = chatId;
      await this.userRepo.save(user);
      this.pendingVerification.delete(chatId);

      await ctx.reply(
        `✅ ¡Cuenta vinculada exitosamente!\n\n👤 *${user.name}*\n🔑 Rol: *${user.role?.name ?? '—'}*\n\nA partir de ahora recibirás las notificaciones de Sarita aquí.`,
        { parse_mode: 'Markdown' },
      );
    });
  }

  // ─── Notificación de venta completada ────────────────────────────────────
  async sendSaleNotification(order: Order) {
    if (!this.bot) return;
    const recipients = await this.getNotifiableUsers();
    if (!recipients.length) return;

    const lines = (order.items ?? []).map(
      (item) =>
        `  • ${item.product?.name ?? '?'}${item.flavor ? ` (${item.flavor.name})` : ''} ×${item.quantity} — Q${(Number(item.unitPrice) * item.quantity).toFixed(2)}`,
    );

    const hora = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

    const message =
      `🛒 *VENTA COMPLETADA — SARITA*\n\n` +
      `📋 Factura: \`${order.invoiceNumber}\`\n` +
      `👤 Empleado: ${order.employee?.name ?? '—'}\n` +
      `🕐 ${hora}\n\n` +
      `*Productos vendidos:*\n${lines.join('\n')}\n\n` +
      `💰 *Total: Q${Number(order.total).toFixed(2)}*`;

    await this.broadcast(recipients, message);
  }

  // ─── Alerta de stock bajo ─────────────────────────────────────────────────
  async sendLowStockAlert(ingredients: Ingredient[]) {
    if (!this.bot) return;
    const recipients = await this.getNotifiableUsers();
    if (!recipients.length) return;

    const lines = ingredients.map(
      (i) =>
        `  • ${i.name}: *${Number(i.stockQuantity).toFixed(2)} ${i.unit}* (mín: ${Number(i.minThreshold).toFixed(2)})`,
    );

    const message =
      `⚠️ *STOCK BAJO — SARITA*\n\n` +
      `Los siguientes ingredientes necesitan reabastecimiento:\n\n${lines.join('\n')}`;

    await this.broadcast(recipients, message);
  }

  // ─── Privados ─────────────────────────────────────────────────────────────
  private async getNotifiableUsers(): Promise<User[]> {
    const roles = await this.roleRepo.find({ where: { telegramNotify: true, active: true } });
    if (!roles.length) return [];

    return this.userRepo
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .where('r.id IN (:...roleIds)', { roleIds: roles.map((r) => r.id) })
      .andWhere('u.telegram_chat_id IS NOT NULL')
      .andWhere('u.active = true')
      .getMany();
  }

  private async broadcast(users: User[], message: string) {
    for (const user of users) {
      try {
        await this.bot.telegram.sendMessage(user.telegramChatId!, message, { parse_mode: 'Markdown' });
      } catch (e) {
        this.logger.warn(`No se pudo enviar a ${user.name}: ${e}`);
      }
    }
  }
}
