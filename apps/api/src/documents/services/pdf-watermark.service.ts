
import { Injectable } from '@nestjs/common';

import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
} from 'pdf-lib';

@Injectable()
export class PdfWatermarkService {
  async applyWatermark(
    pdfBuffer: Buffer,
  ): Promise<Buffer> {
    const pdfDocument = await PDFDocument.load(
      pdfBuffer,
    );

    const font = await pdfDocument.embedFont(
      StandardFonts.HelveticaBold,
    );

    const watermarkText = 'PREVIA - CURRICULO EXPRESS IA';

    for (const page of pdfDocument.getPages()) {
      const { width, height } = page.getSize();

      const fontSize = 25;
      const angle = 35;

      const textWidth = font.widthOfTextAtSize(
        watermarkText,
        fontSize,
      );

      // Distribui as marcas pela altura da página.
      const positions = [
        height * 0.25,
        height * 0.50,
        height * 0.75,
      ];

      for (const y of positions) {
        page.drawText(watermarkText, {
          x: (width - textWidth * 0.8) / 2,
          y,
          size: fontSize,
          font,
          color: rgb(0.55, 0.55, 0.55),
          opacity: 0.28,
          rotate: degrees(angle),
        });
      }

      // Aviso no rodapé.
      const footerText =
        'DOCUMENTO DE PREVISUALIZACAO - NAO VALIDO COMO VERSAO FINAL';

      const footerSize = 8;

      const footerWidth = font.widthOfTextAtSize(
        footerText,
        footerSize,
      );

      page.drawText(footerText, {
        x: (width - footerWidth) / 2,
        y: 20,
        size: footerSize,
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity: 0.9,
      });
    }

    const pdfBytes = await pdfDocument.save();

    return Buffer.from(pdfBytes);
  }
}
