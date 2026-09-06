import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  findAll() {
    return this.repo.find({ select: ['id', 'name', 'email', 'telegramChatId', 'active', 'createdAt'] as any });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(data: { name: string; email: string; password: string; roleId: number; telegramChatId?: string }) {
    const role = await this.rolesService.findOne(data.roleId);
    const user = this.repo.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      telegramChatId: data.telegramChatId,
      role,
    });
    return this.repo.save(user);
  }

  async update(id: number, data: Partial<{ name: string; email: string; password: string; roleId: number; telegramChatId: string; active: boolean }>) {
    const user = await this.findOne(id);
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.password) user.passwordHash = data.password;
    if (data.telegramChatId !== undefined) user.telegramChatId = data.telegramChatId;
    if (data.active !== undefined) user.active = data.active;
    if (data.roleId) user.role = await this.rolesService.findOne(data.roleId);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    user.active = false;
    return this.repo.save(user);
  }

  async findUsersWithTelegramByRole(roleIds: number[]) {
    return this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('role.id IN (:...roleIds)', { roleIds })
      .andWhere('u.telegram_chat_id IS NOT NULL')
      .andWhere('u.active = true')
      .getMany();
  }
}
