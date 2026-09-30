import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  create(data: Partial<Role>) {
    const role = this.repo.create(data);
    return this.repo.save(role);
  }

  async update(id: number, data: Partial<Role>) {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    const [{ count }] = await this.repo.manager.query<[{ count: string }]>(
      'SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (Number(count) > 0) {
      throw new BadRequestException(`No se puede eliminar el rol "${role.name}": tiene ${count} usuario(s) asignado(s).`);
    }
    role.name = `${role.name}__deleted_${role.id}`;
    await this.repo.save(role);
    return this.repo.softRemove(role);
  }
}
