/**
 * Script standalone de emergencia. Normalmente el seed corre automático
 * al iniciar NestJS. Usar sólo si necesitas poblar una BD sin levantar la app.
 * Siembra únicamente roles y credenciales de usuarios.
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
import { ROLES_SEED, USERS_SEED } from './seeds/roles.seed';

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

  const existing = await dataSource.getRepository(Role).count({ withDeleted: true });
  if (existing > 0) {
    console.log('Base de datos ya inicializada — seed omitido.');
    await dataSource.destroy();
    process.exit(0);
  }

  await dataSource.transaction(async (manager) => {
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
    console.log(`  ✔ Usuarios: ${USERS_SEED.map((u) => u.email).join(', ')}`);
  });

  console.log('\n✅ Seed completado exitosamente.');
  await dataSource.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
