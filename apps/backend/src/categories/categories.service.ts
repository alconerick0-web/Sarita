import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  findAll(onlyActive = false, line?: string) {
    return this.repo.find({
      where: { ...(onlyActive ? { active: true } : {}), ...(line ? { line } : {}) },
      relations: { products: { steps: true } },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne({ where: { id }, relations: { products: true } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(data: Partial<Category>) {
    const exists = await this.repo.findOne({ where: { name: data.name } });
    if (exists) throw new ConflictException(`Ya existe una categoría con el nombre "${data.name}"`);
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Category>) {
    const entity = await this.findOne(id);
    if (data.name && data.name !== entity.name) {
      const exists = await this.repo.findOne({ where: { name: data.name, id: Not(id) } });
      if (exists) throw new ConflictException(`Ya existe una categoría con el nombre "${data.name}"`);
    }
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async toggle(id: number) {
    const cat = await this.findOne(id);
    cat.active = !cat.active;
    return this.repo.save(cat);
  }

  async remove(id: number) {
    const cat = await this.findOne(id);
    if ((cat.products ?? []).length > 0) {
      throw new BadRequestException(
        `No se puede eliminar "${cat.name}": tiene ${cat.products.length} producto(s) asignado(s). Elimina o reasigna los productos primero.`,
      );
    }
    cat.name = `${cat.name}__deleted_${cat.id}`;
    await this.repo.save(cat);
    return this.repo.softRemove(cat);
  }
}
