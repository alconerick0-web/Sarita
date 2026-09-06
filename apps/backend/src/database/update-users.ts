/**
 * Actualiza los usuarios existentes a los credenciales reales.
 * Ejecutar una sola vez: npm run update-users
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
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

const UPDATES = [
  { findEmail: 'admin@sarita.gt',    newEmail: 'ealcon', newName: 'Erick Alcon', newPassword: 'ERICK3110alcon', newRoleName: 'admin'    },
  { findEmail: 'empleado@sarita.gt', newEmail: 'jcruz',  newName: 'J. Cruz',     newPassword: 'CRUZ3110mendoza', newRoleName: 'vendedor' },
];

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
  synchronize: false,
});

async function main() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  // Renombrar rol empleado → vendedor si existe
  const rolEmpleado = await roleRepo.findOne({ where: { name: 'empleado' } });
  if (rolEmpleado) {
    rolEmpleado.name = 'vendedor';
    rolEmpleado.description = 'Vendedor de tienda';
    await roleRepo.save(rolEmpleado);
    console.log('  ✔ Rol "empleado" renombrado a "vendedor"');
  }

  for (const upd of UPDATES) {
    // Busca por email viejo O por el nuevo (por si ya fue parcialmente actualizado)
    let user = await userRepo.findOne({ where: { email: upd.findEmail } })
            ?? await userRepo.findOne({ where: { email: upd.newEmail  } });

    if (!user) {
      // Si no existe ninguno, lo crea
      const role = await roleRepo.findOne({ where: { name: upd.newRoleName } });
      user = userRepo.create({
        name: upd.newName, email: upd.newEmail,
        passwordHash: await bcrypt.hash(upd.newPassword, 10),
        role: role ?? undefined,
      });
      await userRepo.save(user);
      console.log(`  ➕ Creado: ${upd.newEmail}`);
    } else {
      const role = await roleRepo.findOne({ where: { name: upd.newRoleName } });
      user.name         = upd.newName;
      user.email        = upd.newEmail;
      user.passwordHash = await bcrypt.hash(upd.newPassword, 10);
      if (role) user.role = role;
      await userRepo.save(user);
      console.log(`  ✏️  Actualizado: ${upd.findEmail} → ${upd.newEmail}`);
    }
  }

  await dataSource.destroy();
  console.log('\n✅ Usuarios actualizados.');
}

main().catch((e) => { console.error(e); process.exit(1); });
