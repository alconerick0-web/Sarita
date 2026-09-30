import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient) private readonly repo: Repository<Ingredient>,
    @InjectRepository(InventoryMovement) private readonly movRepo: Repository<InventoryMovement>,
  ) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findLowStock() {
    return this.repo
      .createQueryBuilder('i')
      .where('i.stock_quantity <= i.min_threshold')
      .andWhere('i.active = true')
      .getMany();
  }

  async findOne(id: number) {
    const i = await this.repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Ingrediente no encontrado');
    return i;
  }

  async create(data: Partial<Ingredient>) {
    if (data.name) {
      const exists = await this.repo.findOne({ where: { name: data.name } });
      if (exists) throw new ConflictException(`Ya existe un ingrediente con el nombre "${data.name}"`);
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Ingredient>) {
    const entity = await this.findOne(id);
    if (data.name && data.name !== entity.name) {
      const exists = await this.repo.findOne({ where: { name: data.name, id: Not(id) } });
      if (exists) throw new ConflictException(`Ya existe un ingrediente con el nombre "${data.name}"`);
    }
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async toggle(id: number) {
    const ingredient = await this.findOne(id);
    ingredient.active = !ingredient.active;
    return this.repo.save(ingredient);
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);
    ingredient.name = `${ingredient.name}__deleted_${ingredient.id}`;
    await this.repo.save(ingredient);
    return this.repo.softRemove(ingredient);
  }

  async restock(id: number, quantity: number, reason: string, user: User) {
    const ingredient = await this.findOne(id);
    ingredient.stockQuantity = Number(ingredient.stockQuantity) + Number(quantity);
    await this.repo.save(ingredient);
    const movement = this.movRepo.create({ ingredient, type: MovementType.IN, quantity, reason, user });
    await this.movRepo.save(movement);
    return ingredient;
  }

  async checkStock(requirements: { ingredientId: number; needed: number }[]) {
    for (const { ingredientId, needed } of requirements) {
      const ingredient = await this.findOne(ingredientId);
      if (Number(ingredient.stockQuantity) < needed) {
        throw new BadRequestException(
          `Stock insuficiente de "${ingredient.name}": disponible ${ingredient.stockQuantity}, requerido ${needed}`,
        );
      }
    }
  }

  async deductStock(ingredientId: number, quantity: number, reason?: string) {
    await this.repo.decrement({ id: ingredientId }, 'stockQuantity', quantity);
    if (reason) {
      const movement = this.movRepo.create({
        ingredient: { id: ingredientId } as any,
        type: MovementType.OUT,
        quantity,
        reason,
      });
      await this.movRepo.save(movement);
    }
  }

  findMovements(ingredientId: number) {
    return this.movRepo.find({
      where: { ingredient: { id: ingredientId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
