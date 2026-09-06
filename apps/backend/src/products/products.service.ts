import { BadRequestException, ConflictException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductIngredient } from './entities/product-ingredient.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(ProductIngredient) private readonly piRepo: Repository<ProductIngredient>,
  ) {}

  findAll(onlyActive = false) {
    return this.repo.find({
      where: onlyActive ? { active: true } : {},
      relations: { category: true, steps: true, productIngredients: { ingredient: true } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const p = await this.repo.findOne({
      where: { id },
      relations: { category: true, steps: true, productIngredients: { ingredient: true } },
    });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async create(data: any) {
    const { ingredients, ...rest } = data;
    if (rest.name) {
      const exists = await this.repo.findOne({ where: { name: rest.name } });
      if (exists) throw new ConflictException(`Ya existe un producto con el nombre "${rest.name}"`);
    }
    const product = this.repo.create(rest as any);
    const saved = (await this.repo.save(product as any)) as any;
    if (ingredients?.length) {
      await this.saveIngredients(saved.id as number, ingredients);
    }
    return this.findOne(saved.id as number);
  }

  async update(id: number, data: any) {
    const { ingredients, categoryId, ...rest } = data;
    const existing = await this.findOne(id);
    if (rest.name && rest.name !== existing.name) {
      const duplicate = await this.repo.findOne({ where: { name: rest.name, id: Not(id) } });
      if (duplicate) throw new ConflictException(`Ya existe un producto con el nombre "${rest.name}"`);
    }
    const updateData: any = { id, ...rest };
    if (categoryId !== undefined) updateData.category = { id: Number(categoryId) };
    await this.repo.save(updateData);
    if (ingredients !== undefined) {
      await this.piRepo.delete({ product: { id } });
      if (ingredients.length) await this.saveIngredients(id, ingredients);
    }
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const product = await this.findOne(id);
    product.active = !product.active;
    return this.repo.save(product);
  }

  async remove(id: number) {
    const p = await this.findOne(id);
    const [{ count }] = await this.repo.manager.query<[{ count: string }]>(
      'SELECT COUNT(*)::int AS count FROM order_items WHERE product_id = $1',
      [id],
    );
    if (Number(count) > 0) {
      throw new BadRequestException(
        `No se puede eliminar "${p.name}": ha sido utilizado en ${count} pedido(s). Desactívalo si no deseas que aparezca en el menú.`,
      );
    }
    await this.piRepo.delete({ product: { id } });
    return this.repo.remove(p);
  }

  async getProductIngredients(productId: number) {
    return this.piRepo.find({
      where: { product: { id: productId } },
      relations: { ingredient: true },
    });
  }

  async generateRecipePdf(categoryId?: number): Promise<StreamableFile> {
    const query = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.productIngredients', 'pi')
      .leftJoinAndSelect('pi.ingredient', 'ingredient')
      .where('p.active = true')
      .orderBy('category.name', 'ASC')
      .addOrderBy('p.name', 'ASC');

    if (categoryId) query.andWhere('category.id = :categoryId', { categoryId });

    const products = await query.getMany();

    // ── Agrupar por categoría
    const byCategory = new Map<string, typeof products>();
    for (const p of products) {
      const key = p.category?.name ?? 'Sin categoría';
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(p);
    }

    // ── Construir HTML
    const date = new Date().toLocaleDateString('es-GT', { dateStyle: 'long' });

    const categorySections = [...byCategory.entries()].map(([catName, prods]) => {
      const cards = prods.map((p) => {
        const ing = (p.productIngredients ?? []).sort((a, b) =>
          (a.ingredient?.name ?? '').localeCompare(b.ingredient?.name ?? ''),
        );
        const rows = ing.length
          ? ing
              .map(
                (pi, i) => `
              <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'}">
                <td style="padding:7px 14px;color:#374151;font-size:12px">${pi.ingredient?.name ?? '—'}</td>
                <td style="padding:7px 14px;color:#111;font-weight:700;text-align:right;font-size:12px">${Number(pi.quantityPerUnit)}</td>
                <td style="padding:7px 14px;color:#6b7280;text-align:center;font-size:12px">${pi.ingredient?.unit ?? '—'}</td>
              </tr>`,
              )
              .join('')
          : `<tr><td colspan="3" style="padding:10px 14px;color:#9ca3af;font-style:italic;text-align:center;font-size:12px">Sin ingredientes configurados</td></tr>`;

        return `
          <div class="card">
            <div class="card-header">
              <div>
                <div class="product-name">${p.name}</div>
                ${p.containerSize ? `<div class="product-size">${p.containerSize}</div>` : ''}
              </div>
              <div class="price-badge">Q${Number(p.price).toFixed(2)}</div>
            </div>
            <table class="ing-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th style="text-align:right">Cantidad</th>
                  <th style="text-align:center">Unidad</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
      }).join('');

      return `
        <div class="category-block">
          <div class="category-header">
            <div class="category-bar"></div>
            <h2 class="category-name">${catName}</h2>
            <div class="category-line"></div>
            <span class="category-count">${prods.length} producto${prods.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="cards-grid">${cards}</div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#f3f4f6; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

  .page-header {
    background: linear-gradient(135deg,#1a0505 0%,#7a0000 50%,#ec0927 100%);
    padding: 36px 48px 28px;
    color: white;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .brand { display:flex; align-items:center; gap:14px; }
  .brand-icon { width:52px; height:52px; background:white; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; }
  .brand-name { font-size:34px; font-weight:900; letter-spacing:-1.5px; }
  .brand-sub { font-size:11px; opacity:.7; letter-spacing:3px; text-transform:uppercase; margin-top:2px; }
  .header-title { font-size:20px; font-weight:700; margin-top:14px; opacity:.95; }
  .header-meta { text-align:right; opacity:.75; }
  .header-meta p { font-size:11px; line-height:1.7; }

  .content { padding:32px 48px 16px; }

  .category-block { margin-bottom:32px; page-break-inside:avoid; }
  .category-header { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .category-bar { width:5px; height:22px; background:#ec0927; border-radius:3px; flex-shrink:0; }
  .category-name { font-size:15px; font-weight:800; color:#111; letter-spacing:.2px; white-space:nowrap; }
  .category-line { flex:1; height:1px; background:#e5e7eb; }
  .category-count { font-size:10px; color:#9ca3af; font-weight:600; white-space:nowrap; }

  .cards-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

  .card { background:white; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; page-break-inside:avoid; }
  .card-header { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #f1f3f5; gap:12px; }
  .product-name { font-size:13px; font-weight:700; color:#111; }
  .product-size { font-size:10px; color:#9ca3af; margin-top:2px; }
  .price-badge { background:linear-gradient(135deg,#ec0927,#b91c1c); color:white; padding:5px 12px; border-radius:20px; font-size:13px; font-weight:800; white-space:nowrap; flex-shrink:0; }

  .ing-table { width:100%; border-collapse:collapse; }
  .ing-table thead tr { background:#f9fafb; }
  .ing-table th { padding:6px 14px; font-size:9px; color:#9ca3af; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
  .ing-table th:first-child { text-align:left; }

  .page-footer { padding:14px 48px; border-top:1px solid #e5e7eb; text-align:center; background:white; margin-top:8px; }
  .page-footer p { font-size:9px; color:#9ca3af; }
</style>
</head>
<body>
  <div class="page-header">
    <div>
      <div class="brand">
        <div class="brand-icon">🍦</div>
        <div>
          <div class="brand-name">SARITA</div>
          <div class="brand-sub">Heladería</div>
        </div>
      </div>
      <div class="header-title">Libro de Recetas</div>
    </div>
    <div class="header-meta">
      <p>${date}</p>
      <p>${products.length} receta${products.length !== 1 ? 's' : ''}</p>
    </div>
  </div>

  <div class="content">
    ${categorySections}
  </div>

  <div class="page-footer">
    <p>Sarita Heladería — Documento confidencial de uso interno — ${date}</p>
  </div>
</body>
</html>`;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const buffer = await page.pdf({
        format: 'Letter',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        printBackground: true,
      });
      return new StreamableFile(buffer as Buffer, {
        type: 'application/pdf',
        disposition: `attachment; filename="recetas-sarita-${Date.now()}.pdf"`,
      });
    } finally {
      await browser.close();
    }
  }

  private async saveIngredients(productId: number, ingredients: { ingredientId: number; quantityPerUnit: number }[]) {
    const records = ingredients.map((i) =>
      this.piRepo.create({
        product: { id: productId } as any,
        ingredient: { id: i.ingredientId } as any,
        quantityPerUnit: i.quantityPerUnit,
      }),
    );
    return this.piRepo.save(records);
  }
}
