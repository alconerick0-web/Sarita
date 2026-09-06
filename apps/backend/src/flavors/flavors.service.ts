import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class FlavorsService {
  constructor(@InjectRepository(Flavor) private readonly repo: Repository<Flavor>) {}

  findAll(onlyActive = false) {
    return this.repo.find({ where: onlyActive ? { active: true } : {}, order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundException('Sabor no encontrado');
    return f;
  }

  create(data: Partial<Flavor>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Flavor>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const f = await this.findOne(id);
    return this.repo.remove(f);
  }
}
