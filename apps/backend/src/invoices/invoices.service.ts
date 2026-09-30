import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(@InjectRepository(Invoice) private readonly repo: Repository<Invoice>) {}

  findAll() {
    return this.repo.find({ relations: { order: { items: { product: true } } }, withDeleted: true, order: { issuedAt: 'DESC' }, take: 200 });
  }

  async findOne(id: number) {
    const inv = await this.repo.findOne({
      where: { id },
      relations: { order: { items: { product: true, flavor: true }, employee: true } },
      withDeleted: true,
    });
    if (!inv) throw new NotFoundException('Factura no encontrada');
    return inv;
  }

  async generatePdf(id: number): Promise<StreamableFile> {
    const inv = await this.findOne(id);
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(20).fillColor('#ec0927').text('SARITA', { align: 'center' });
    doc.fontSize(10).fillColor('#333').text('Heladería Sarita', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('#000').text(`Factura: ${inv.invoiceNumber}`, { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${inv.issuedAt.toLocaleDateString('es-GT')}`, { align: 'center' });
    if (inv.customerName) doc.text(`Cliente: ${inv.customerName}`, { align: 'center' });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Producto', 50, doc.y, { width: 250 });
    doc.text('Cant.', 310, doc.y - doc.currentLineHeight(), { width: 60, align: 'center' });
    doc.text('Precio', 380, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' });
    doc.text('Total', 470, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica');
    for (const item of inv.order?.items ?? []) {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      const y = doc.y;
      doc.text(item.product?.name ?? '', 50, y, { width: 250 });
      doc.text(String(item.quantity), 310, y, { width: 60, align: 'center' });
      doc.text(`Q${Number(item.unitPrice).toFixed(2)}`, 380, y, { width: 80, align: 'right' });
      doc.text(`Q${lineTotal.toFixed(2)}`, 470, y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12).text(`TOTAL: Q${Number(inv.total).toFixed(2)}`, { align: 'right' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(9).fillColor('#666').text('¡Gracias por su preferencia!', { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(new StreamableFile(buffer, { type: 'application/pdf', disposition: `attachment; filename="${inv.invoiceNumber}.pdf"` }));
      });
    });
  }
}
