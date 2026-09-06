import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.repo.remove(role);
  }
}
