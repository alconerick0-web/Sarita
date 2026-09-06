import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role }              from '../roles/entities/role.entity';
import { User }              from '../users/entities/user.entity';
import { Category }          from '../categories/entities/category.entity';
import { Flavor }            from '../flavors/entities/flavor.entity';
import { Ingredient }        from '../ingredients/entities/ingredient.entity';
import { Product }           from '../products/entities/product.entity';
import { ProductStep }       from '../products/entities/product-step.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { ROLES_SEED, USERS_SEED }           from './seeds/roles.seed';
import { FLAVORS_SEED, INGREDIENTS_SEED }   from './seeds/ingredients.seed';
import { CATEGORIES_SEED, PRODUCTS_SEED }   from './seeds/products.seed';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    const alreadySeeded = await this.dataSource.getRepository(Role).count() > 0;
    if (alreadySeeded) {
      const stepsSeeded = await this.dataSource.getRepository(ProductStep).count() > 0;
      if (!stepsSeeded) {
        this.logger.log('Sembrando pasos de productos...');
        await this.dataSource.transaction(async (manager) => {
          await this.seedProductSteps(manager);
        });
        this.logger.log('Pasos de productos sembrados');
      } else {
        this.logger.log('Base de datos ya inicializada — seed omitido');
        await this.syncFlavorCounts();
      }
      return;
    }
    await this.run();
  }

  private async syncFlavorCounts() {
    for (const def of PRODUCTS_SEED) {
      for (let i = 0; i < def.steps.length; i++) {
        const step = def.steps[i];
        if (!step.flavorCount || step.flavorCount <= 1) continue;
        await this.dataSource.query(
          `UPDATE product_steps ps
           SET flavor_count = $1
           FROM products p
           WHERE ps.product_id = p.id
             AND p.name = $2
             AND ps.step_number = $3
             AND ps.flavor_count != $1`,
          [step.flavorCount, def.name, i + 1],
        );
      }
    }
    this.logger.log('  ✔ Sincronización de flavorCount completada');
  }

  private async run() {
    this.logger.log('Iniciando seed inicial de base de datos...');

    await this.dataSource.transaction(async (manager) => {
      await this.seedRolesAndUsers(manager);
      await this.seedFlavors(manager);
      await this.seedIngredients(manager);
      await this.seedCategoriesAndProducts(manager);
      await this.seedProductSteps(manager);
    });

    this.logger.log('Seed completado exitosamente');
  }

  private async seedRolesAndUsers(manager: EntityManager) {
    const roles = await manager.save(Role, ROLES_SEED);
    const roleMap = new Map(roles.map((r) => [r.name, r]));

    const users = await Promise.all(
      USERS_SEED.map(async ({ name, email, password, roleName }) => ({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: roleMap.get(roleName),
      })),
    );
    await manager.save(User, users);

    this.logger.log(`  ✔ Roles: ${roles.map((r) => r.name).join(', ')}`);
    this.logger.log(`  ✔ Usuarios: ${USERS_SEED.map((u) => u.email).join(', ')}`);
  }

  private async seedFlavors(manager: EntityManager) {
    await manager.save(Flavor, FLAVORS_SEED);
    this.logger.log(`  ✔ ${FLAVORS_SEED.length} sabores creados`);
  }

  private async seedIngredients(manager: EntityManager) {
    await manager.save(Ingredient, INGREDIENTS_SEED);
    this.logger.log(`  ✔ ${INGREDIENTS_SEED.length} ingredientes / items de inventario creados`);
  }

  private async seedProductSteps(manager: EntityManager) {
    const products = await manager.find(Product);
    const productMap = new Map(products.map((p) => [p.name, p]));
    let total = 0;

    for (const def of PRODUCTS_SEED) {
      const product = productMap.get(def.name);
      if (!product || !def.steps.length) continue;

      await manager.save(
        ProductStep,
        def.steps.map((step, i) => ({
          product,
          stepNumber: i + 1,
          description: step.desc,
          requiresFlavor: step.requiresFlavor ?? false,
          requiresTopping: step.requiresTopping ?? false,
          requiresSodaFlavor: false,
          flavorCount: step.flavorCount ?? 1,
        })),
      );
      total += def.steps.length;
    }

    this.logger.log(`  ✔ ${total} pasos de productos creados`);
  }

  private async seedCategoriesAndProducts(manager: EntityManager) {
    const cats = await manager.save(Category, CATEGORIES_SEED);
    const catMap = new Map(cats.map((c) => [c.name, c]));
    this.logger.log(`  ✔ ${cats.length} categorías creadas`);

    const ingredients = await manager.find(Ingredient);
    const ingMap = new Map(ingredients.map((i) => [i.name, i]));

    for (const def of PRODUCTS_SEED) {
      const product = await manager.save(Product, {
        name: def.name,
        category: catMap.get(def.categoryName),
        price: def.price,
        containerSize: def.container,
        active: true,
      });

      const missingIng = def.ingredients
        .filter(([name]) => !ingMap.has(name))
        .map(([name]) => name);
      if (missingIng.length) {
        throw new Error(`Producto "${def.name}" referencia ingredientes no encontrados: ${missingIng.join(', ')}`);
      }

      await manager.save(
        ProductIngredient,
        def.ingredients.map(([name, qty]) => ({
          product,
          ingredient: ingMap.get(name),
          quantityPerUnit: qty,
        })),
      );
    }

    this.logger.log(`  ✔ ${PRODUCTS_SEED.length} productos creados con ingredientes`);
  }
}
