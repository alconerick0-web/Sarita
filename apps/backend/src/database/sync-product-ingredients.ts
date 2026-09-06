/**
 * Vincula ingredientes de receta a los productos que ya existen en la DB.
 * Sólo actúa sobre productos que aún no tienen ningún product_ingredient.
 * NO borra órdenes, stock ni ningún otro dato.
 *
 * Ejecutar:
 *   npx ts-node -r tsconfig-paths/register src/database/sync-product-ingredients.ts
 */
import { DataSource } from 'typeorm';
import { Ingredient }        from '../ingredients/entities/ingredient.entity';
import { InventoryMovement } from '../ingredients/entities/inventory-movement.entity';
import { Role }              from '../roles/entities/role.entity';
import { User }              from '../users/entities/user.entity';
import { Category }          from '../categories/entities/category.entity';
import { Flavor }            from '../flavors/entities/flavor.entity';
import { Product }           from '../products/entities/product.entity';
import { ProductStep }       from '../products/entities/product-step.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { Order }             from '../orders/entities/order.entity';
import { OrderItem }         from '../orders/entities/order-item.entity';
import { OrderItemUsed }     from '../orders/entities/order-item-used.entity';
import { Invoice }           from '../invoices/entities/invoice.entity';
import { PRODUCTS_SEED }     from './seeds/products.seed';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host:     process.env.DB_HOST ?? 'localhost',
    port:     Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    database: process.env.DB_NAME ?? 'sarita',
    entities: [
      Ingredient, InventoryMovement, Role, User, Category, Flavor,
      Product, ProductStep, ProductIngredient, Order, OrderItem, OrderItemUsed, Invoice,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const productRepo = dataSource.getRepository(Product);
  const ingRepo     = dataSource.getRepository(Ingredient);
  const piRepo      = dataSource.getRepository(ProductIngredient);

  // Build lookup maps
  const ingredients = await ingRepo.find();
  const ingMap = new Map(ingredients.map((i) => [i.name, i]));

  let linked = 0;
  let skipped = 0;
  let missing = 0;

  for (const def of PRODUCTS_SEED) {
    const product = await productRepo.findOne({
      where: { name: def.name },
      relations: { productIngredients: true },
    });

    if (!product) {
      console.log(`⚠️  No encontrado en DB: "${def.name}" — omitido`);
      skipped++;
      continue;
    }

    // Skip products that already have ingredients linked
    if (product.productIngredients?.length > 0) {
      console.log(`✅ Ya tiene ingredientes: "${def.name}" (${product.productIngredients.length})`);
      skipped++;
      continue;
    }

    // Validate all ingredients exist
    const missingIng = def.ingredients
      .filter(([name]) => !ingMap.has(name))
      .map(([name]) => name);

    if (missingIng.length) {
      console.error(`❌ Ingredientes no encontrados para "${def.name}": ${missingIng.join(', ')}`);
      missing += missingIng.length;
      continue;
    }

    // Create the links
    const records = def.ingredients.map(([name, qty]) =>
      piRepo.create({
        product,
        ingredient: ingMap.get(name)!,
        quantityPerUnit: qty,
      }),
    );
    await piRepo.save(records);

    const summary = def.ingredients.map(([n, q]) => `${q} ${ingMap.get(n)?.unit ?? ''} ${n}`).join(' · ');
    console.log(`🔗 Vinculado: "${def.name}" → ${records.length} ingredientes`);
    console.log(`   ${summary}`);
    linked++;
  }

  await dataSource.destroy();
  console.log(`\n✅ Listo: ${linked} productos vinculados, ${skipped} omitidos, ${missing} ingredientes faltantes.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
