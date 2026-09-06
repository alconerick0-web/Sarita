/**
 * Script standalone de emergencia. Normalmente el seed corre automático
 * al iniciar NestJS. Usar sólo si necesitas poblar una BD sin levantar la app.
 *
 * Ejecutar: npm run seed
 */
import 'dotenv/config';
import { DataSource }        from 'typeorm';
import * as bcrypt           from 'bcrypt';
import { Role }              from '../roles/entities/role.entity';
import { User }              from '../users/entities/user.entity';
import { Category }          from '../categories/entities/category.entity';
import { Flavor }            from '../flavors/entities/flavor.entity';
import { Ingredient }        from '../ingredients/entities/ingredient.entity';
import { InventoryMovement } from '../ingredients/entities/inventory-movement.entity';
import { Product }           from '../products/entities/product.entity';
import { ProductStep }       from '../products/entities/product-step.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { Order }             from '../orders/entities/order.entity';
import { OrderItem }         from '../orders/entities/order-item.entity';
import { OrderItemUsed }     from '../orders/entities/order-item-used.entity';
import { Invoice }           from '../invoices/entities/invoice.entity';
import { ROLES_SEED, USERS_SEED }         from './seeds/roles.seed';
import { FLAVORS_SEED, INGREDIENTS_SEED } from './seeds/ingredients.seed';
import { CATEGORIES_SEED, PRODUCTS_SEED } from './seeds/products.seed';

const dataSource = new DataSource({
  type: 'postgres',
  host:     process.env.POSTGRES_HOST     ?? 'localhost',
  port:     Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB       ?? 'sarita',
  username: process.env.POSTGRES_USER     ?? 'sarita_user',
  password: process.env.POSTGRES_PASSWORD ?? 'sarita_pass',
  entities: [
    Role, User, Category, Flavor, Ingredient, InventoryMovement,
    Product, ProductStep, ProductIngredient, Order, OrderItem, OrderItemUsed, Invoice,
  ],
  synchronize: true,
});

async function main() {
  await dataSource.initialize();
  console.log('Conectado. Ejecutando seed...\n');

  const existing = await dataSource.getRepository(Role).count();
  if (existing > 0) {
    console.log('Base de datos ya inicializada — seed omitido.');
    await dataSource.destroy();
    process.exit(0);
  }

  await dataSource.transaction(async (manager) => {
    // Roles y usuarios
    const roles = await manager.save(Role, ROLES_SEED);
    const roleMap = new Map(roles.map((r) => [r.name, r]));
    const users = await Promise.all(
      USERS_SEED.map(async ({ name, email, password, roleName }) => ({
        name, email,
        passwordHash: await bcrypt.hash(password, 10),
        role: roleMap.get(roleName),
      })),
    );
    await manager.save(User, users);
    console.log(`  ✔ Roles: ${roles.map((r) => r.name).join(', ')}`);

    // Sabores e ingredientes
    await manager.save(Flavor, FLAVORS_SEED);
    await manager.save(Ingredient, INGREDIENTS_SEED);
    console.log(`  ✔ ${FLAVORS_SEED.length} sabores, ${INGREDIENTS_SEED.length} ingredientes`);

    // Categorías
    const cats = await manager.save(Category, CATEGORIES_SEED);
    const catMap = new Map(cats.map((c) => [c.name, c]));

    // Ingredientes (ya guardados) para map de productos
    const ingredients = await manager.find(Ingredient);
    const ingMap = new Map(ingredients.map((i) => [i.name, i]));

    // Productos
    for (const def of PRODUCTS_SEED) {
      const product = await manager.save(Product, {
        name: def.name, category: catMap.get(def.categoryName),
        price: def.price, containerSize: def.container, active: true,
      });
      await manager.save(ProductStep, def.steps.map((s, i) => ({
        product, stepNumber: i + 1, description: s.desc,
        requiresFlavor: s.requiresFlavor ?? false,
        requiresTopping: s.requiresTopping ?? false,
      })));
      await manager.save(ProductIngredient, def.ingredients.map(([name, qty]) => ({
        product, ingredient: ingMap.get(name), quantityPerUnit: qty,
      })));
    }
    console.log(`  ✔ ${PRODUCTS_SEED.length} productos creados`);
  });

  console.log('\n✅ Seed completado exitosamente.');
  await dataSource.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
