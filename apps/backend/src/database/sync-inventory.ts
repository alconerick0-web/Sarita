/**
 * Sincroniza el stock actual de ingredientes con los valores reales del cuaderno.
 * Actualiza los existentes y crea los que no están.
 * NO borra órdenes, usuarios ni ningún otro dato.
 *
 * Ejecutar: npx ts-node -r tsconfig-paths/register src/database/sync-inventory.ts
 */
import { DataSource } from 'typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryMovement } from '../ingredients/entities/inventory-movement.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Flavor } from '../flavors/entities/flavor.entity';
import { Product } from '../products/entities/product.entity';
import { ProductStep } from '../products/entities/product-step.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderItemUsed } from '../orders/entities/order-item-used.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

// ─── Stock real del cuaderno (último valor de cada "Existencia") ──────────────
const INVENTORY: { name: string; unit: string; stockQuantity: number; minThreshold: number }[] = [
  // Ingredientes base recetas
  { name: 'Topping de Fresa',           unit: 'oz',          stockQuantity: 1,   minThreshold: 10 },
  { name: 'Topping de Chocolate',       unit: 'oz',          stockQuantity: 3,   minThreshold: 10 },
  { name: 'Crema Batida',               unit: 'unidad',      stockQuantity: 13,  minThreshold: 5  },
  { name: 'Galleta Redonda',            unit: 'unidad',      stockQuantity: 159, minThreshold: 20 },
  { name: 'Maní / Anicillos',           unit: 'cucharadita', stockQuantity: 5,   minThreshold: 10 },
  { name: 'Gajos de Melocotón',         unit: 'gajo',        stockQuantity: 2,   minThreshold: 10 },
  { name: 'Sarita Shake 200mL',         unit: 'bolsa',       stockQuantity: 25,  minThreshold: 10 },
  { name: 'Gaseosa 500mL',              unit: 'botella',     stockQuantity: 19,  minThreshold: 5  },
  { name: 'Funda Sarita para Conos',    unit: 'unidad',      stockQuantity: 315, minThreshold: 30 },
  { name: 'Envase 22oz',                unit: 'unidad',      stockQuantity: 35,  minThreshold: 10 },
  { name: 'Envase 16oz',                unit: 'unidad',      stockQuantity: 55,  minThreshold: 10 },
  { name: 'Envase Banana Split',        unit: 'unidad',      stockQuantity: 87,  minThreshold: 10 },
  // Del cuaderno — nuevos
  { name: 'Cuchara Bomba',              unit: 'unidad',      stockQuantity: 25,  minThreshold: 5  },
  { name: 'Porcion de Pastel',          unit: 'unidad',      stockQuantity: 1,   minThreshold: 1  },
  { name: 'Pastel Entero',              unit: 'unidad',      stockQuantity: 1,   minThreshold: 1  },
  { name: 'Helado 1/2 Galon',           unit: 'unidad',      stockQuantity: 44,  minThreshold: 5  },
  { name: 'Helado Litro',               unit: 'unidad',      stockQuantity: 28,  minThreshold: 5  },
  { name: 'Helado 1/2 Litro',           unit: 'unidad',      stockQuantity: 10,  minThreshold: 3  },
  { name: 'Jugo de Mango',              unit: 'unidad',      stockQuantity: 6,   minThreshold: 2  },
  { name: 'Sarita Shake Chocolate 200mL', unit: 'bolsa',     stockQuantity: 11,  minThreshold: 5  },
  { name: 'Wippeth',                    unit: 'unidad',      stockQuantity: 69,  minThreshold: 10 },
  // Paletería y helados empacados
  { name: 'Barritas',                   unit: 'unidad',      stockQuantity: 27,  minThreshold: 10 },
  { name: 'Topolinos',                  unit: 'unidad',      stockQuantity: 56,  minThreshold: 10 },
  { name: 'Palitos',                    unit: 'unidad',      stockQuantity: 23,  minThreshold: 5  },
  { name: 'UFO',                        unit: 'unidad',      stockQuantity: 10,  minThreshold: 3  },
  { name: 'Miniums',                    unit: 'unidad',      stockQuantity: 23,  minThreshold: 5  },
  { name: 'Choconito',                  unit: 'unidad',      stockQuantity: 20,  minThreshold: 5  },
  { name: 'Choco Cremita',              unit: 'unidad',      stockQuantity: 18,  minThreshold: 5  },
  { name: 'Giga Grande',                unit: 'unidad',      stockQuantity: 7,   minThreshold: 3  },
  { name: 'Coleccionables',             unit: 'unidad',      stockQuantity: 40,  minThreshold: 10 },
  { name: 'Pachones',                   unit: 'unidad',      stockQuantity: 9,   minThreshold: 3  },
  { name: 'Canastas',                   unit: 'unidad',      stockQuantity: 12,  minThreshold: 3  },
  { name: 'Giga Pequeño',               unit: 'unidad',      stockQuantity: 7,   minThreshold: 3  },
  { name: 'Caseros',                    unit: 'unidad',      stockQuantity: 18,  minThreshold: 5  },
  { name: 'Cremosa',                    unit: 'unidad',      stockQuantity: 19,  minThreshold: 5  },
  { name: 'Sorby Cremoso',              unit: 'unidad',      stockQuantity: 18,  minThreshold: 5  },
  { name: 'Sorby Hielo',                unit: 'unidad',      stockQuantity: 15,  minThreshold: 5  },
  { name: 'Cinta Negra Crispy',         unit: 'unidad',      stockQuantity: 11,  minThreshold: 3  },
  { name: 'Cinta Negra',                unit: 'unidad',      stockQuantity: 21,  minThreshold: 5  },
  { name: 'Fruta',                      unit: 'unidad',      stockQuantity: 85,  minThreshold: 20 },
  { name: 'Sandra',                     unit: 'unidad',      stockQuantity: 13,  minThreshold: 3  },
  { name: 'Sandwich',                   unit: 'unidad',      stockQuantity: 48,  minThreshold: 10 },
  { name: 'Bananas Congeladas',         unit: 'unidad',      stockQuantity: 10,  minThreshold: 5  },
  // Paletería — Copas
  { name: 'Copa Sundae',                unit: 'unidad',      stockQuantity: 4,   minThreshold: 2  },
  { name: 'Vasitos',                    unit: 'unidad',      stockQuantity: 20,  minThreshold: 5  },
  { name: 'Giga',                       unit: 'unidad',      stockQuantity: 13,  minThreshold: 3  },
  // Bebidas
  { name: 'Coca Lata',                  unit: 'unidad',      stockQuantity: 16,  minThreshold: 5  },
  { name: 'Coca Pequeño',               unit: 'unidad',      stockQuantity: 7,   minThreshold: 3  },
  // Envases adicionales
  { name: 'Envase 6oz',                 unit: 'unidad',      stockQuantity: 50,  minThreshold: 10 },
  { name: 'Envase 8oz',                 unit: 'unidad',      stockQuantity: 65,  minThreshold: 10 },
  { name: 'Cajas de Conos',             unit: 'caja',        stockQuantity: 9,   minThreshold: 2  },
];

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
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
  const repo = dataSource.getRepository(Ingredient);

  let created = 0;
  let updated = 0;

  for (const item of INVENTORY) {
    const existing = await repo.findOne({ where: { name: item.name } });
    if (existing) {
      existing.stockQuantity = item.stockQuantity;
      existing.unit = item.unit;
      existing.minThreshold = item.minThreshold;
      await repo.save(existing);
      updated++;
      console.log(`✏️  Actualizado: ${item.name} → ${item.stockQuantity} ${item.unit}`);
    } else {
      await repo.save(repo.create(item));
      created++;
      console.log(`➕ Creado:      ${item.name} → ${item.stockQuantity} ${item.unit}`);
    }
  }

  await dataSource.destroy();
  console.log(`\n✅ Listo: ${updated} actualizados, ${created} creados.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
