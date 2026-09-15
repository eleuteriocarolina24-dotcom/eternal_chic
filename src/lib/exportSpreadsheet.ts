import { Product, StoreSettings } from '../types';
import { DEFAULT_PIECE_IMAGE } from './firebase';
import { formatDateBR } from '../utils/dateUtils';

/**
 * Downloads an Excel-compatible spreadsheet (.xls) with EMBEDDED PHOTOS.
 * When opened in Microsoft Excel, Apple Numbers, LibreOffice Calc, or Google Sheets,
 * the actual photos are rendered inside the cells of the first column!
 */
export function downloadExcelWithPhotos(
  products: Product[],
  settings?: Partial<StoreSettings>
): void {
  if (!products || products.length === 0) return;

  const storeName = settings?.storeName || 'Eternal Chic';
  const ownerName = settings?.ownerName || 'Carolina Eleutério';
  const currentDateBR = new Date().toLocaleDateString('pt-BR');

  // Totals calculations
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
  const totalCost = products.reduce((sum, p) => sum + (Number(p.costPrice) * (Number(p.stockQuantity) || 0)), 0);
  const totalSale = products.reduce((sum, p) => sum + (Number(p.salePrice) * (Number(p.stockQuantity) || 0)), 0);
  const totalProfit = totalSale - totalCost;

  const rowsHtml = products
    .map((p, idx) => {
      const cost = Number(p.costPrice) || 0;
      const sale = Number(p.salePrice) || 0;
      const unitProfit = sale - cost;
      const qty = Number(p.stockQuantity) || 0;
      const stockCost = cost * qty;
      const stockSale = sale * qty;
      const dateFormatted = formatDateBR(p.entryDate || p.createdAt);
      const photoSrc = p.imageUrl && p.imageUrl.trim() ? p.imageUrl : DEFAULT_PIECE_IMAGE;
      const statusText = qty <= 0 ? 'ESGOTADO' : qty <= (settings?.lowStockThreshold || 2) ? 'BAIXO ESTOQUE' : 'DISPONÍVEL';
      const statusBg = qty <= 0 ? '#FEE2E2' : qty <= (settings?.lowStockThreshold || 2) ? '#FEF3C7' : '#DCFCE7';
      const statusColor = qty <= 0 ? '#991B1B' : qty <= (settings?.lowStockThreshold || 2) ? '#92400E' : '#166534';
      const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FAF8F5';

      return `
        <tr style="background-color: ${rowBg}; height: 80px;">
          <td style="text-align: center; vertical-align: middle; padding: 6px; width: 85px;">
            <img src="${photoSrc}" width="65" height="65" alt="${p.name}" style="object-fit: cover; border-radius: 4px; border: 1px solid #D9C5B2; display: block; margin: 0 auto;" />
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: monospace; font-weight: bold; font-size: 11px; color: #3D2B1F; border: 1px solid #D9C5B2;">
            ${p.code || 'S/C'}
          </td>
          <td style="vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #3D2B1F; padding: 8px; border: 1px solid #D9C5B2;">
            ${p.name || ''}
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; color: #5C4D42; border: 1px solid #D9C5B2;">
            ${p.category || 'Geral'}
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; color: #3D2B1F; font-weight: 600; border: 1px solid #D9C5B2;">
            ${p.size || 'Único'}
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; color: #5C4D42; border: 1px solid #D9C5B2;">
            ${p.color || '-'}
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; color: #3D2B1F; border: 1px solid #D9C5B2;">
            ${dateFormatted}
          </td>
          <td style="text-align: right; vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; padding: 8px; border: 1px solid #D9C5B2;">
            R$ ${cost.toFixed(2).replace('.', ',')}
          </td>
          <td style="text-align: right; vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #166534; padding: 8px; border: 1px solid #D9C5B2;">
            R$ ${sale.toFixed(2).replace('.', ',')}
          </td>
          <td style="text-align: right; vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #047857; padding: 8px; border: 1px solid #D9C5B2;">
            + R$ ${unitProfit.toFixed(2).replace('.', ',')}
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; font-weight: 600; color: #3D2B1F; border: 1px solid #D9C5B2;">
            ${p.profitMargin !== undefined ? p.profitMargin.toFixed(1).replace('.', ',') : '0,0'}%
          </td>
          <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #3D2B1F; border: 1px solid #D9C5B2;">
            ${qty} un
          </td>
          <td style="text-align: right; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; color: #5C4D42; padding: 8px; border: 1px solid #D9C5B2;">
            R$ ${stockCost.toFixed(2).replace('.', ',')}
          </td>
          <td style="text-align: right; vertical-align: middle; font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; color: #3D2B1F; padding: 8px; border: 1px solid #D9C5B2;">
            R$ ${stockSale.toFixed(2).replace('.', ',')}
          </td>
          <td style="text-align: center; vertical-align: middle; padding: 6px; border: 1px solid #D9C5B2;">
            <span style="background-color: ${statusBg}; color: ${statusColor}; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block;">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Estoque & Peças</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFFFFF; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #3D2B1F; color: #FFFFFF; font-weight: bold; font-size: 11px; text-transform: uppercase; padding: 10px 8px; border: 1px solid #D9C5B2; text-align: center; }
        td { border: 1px solid #D9C5B2; }
      </style>
    </head>
    <body>
      <div style="padding: 16px; background-color: #FAF8F5; border-bottom: 2px solid #3D2B1F; margin-bottom: 12px;">
        <h1 style="font-family: Georgia, serif; color: #3D2B1F; margin: 0; font-size: 22px;">
          ${storeName} — Planilha Oficial de Peças & Estoque
        </h1>
        <p style="margin: 4px 0 0 0; color: #8C7A6B; font-size: 12px;">
          Responsável: <strong>${ownerName}</strong> | Data de Emissão: <strong>${currentDateBR}</strong> | Total de Modelos: <strong>${products.length}</strong>
        </p>
      </div>

      <table border="1" cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th style="width: 85px;">Foto da Peça</th>
            <th style="width: 90px;">Código</th>
            <th style="width: 200px; text-align: left; padding-left: 8px;">Nome da Peça</th>
            <th style="width: 100px;">Categoria</th>
            <th style="width: 70px;">Tamanho</th>
            <th style="width: 90px;">Cor</th>
            <th style="width: 100px;">Data de Entrada</th>
            <th style="width: 100px;">Valor Pago (Custo)</th>
            <th style="width: 100px;">Valor Venda</th>
            <th style="width: 100px;">Lucro Unitário</th>
            <th style="width: 80px;">Margem (%)</th>
            <th style="width: 80px;">Estoque</th>
            <th style="width: 110px;">Total Custo</th>
            <th style="width: 110px;">Total Venda</th>
            <th style="width: 110px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #3D2B1F; color: #FFFFFF; font-weight: bold; height: 40px;">
            <td colspan="7" style="text-align: right; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              TOTAIS GERAIS:
            </td>
            <td style="text-align: right; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              -
            </td>
            <td style="text-align: right; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              -
            </td>
            <td style="text-align: right; padding: 10px; font-size: 12px; color: #86EFAC; border: 1px solid #3D2B1F;">
              Lucro Potencial: R$ ${totalProfit.toFixed(2).replace('.', ',')}
            </td>
            <td style="text-align: center; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              -
            </td>
            <td style="text-align: center; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              ${totalUnits} un
            </td>
            <td style="text-align: right; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              R$ ${totalCost.toFixed(2).replace('.', ',')}
            </td>
            <td style="text-align: right; padding: 10px; font-size: 12px; border: 1px solid #3D2B1F;">
              R$ ${totalSale.toFixed(2).replace('.', ',')}
            </td>
            <td style="text-align: center; padding: 10px; font-size: 11px; border: 1px solid #3D2B1F;">
              ${products.length} Peças
            </td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  // Trigger download as .xls
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileNameDate = new Date().toISOString().slice(0, 10);
  link.download = `planilha_pecas_eternal_chic_com_fotos_${fileNameDate}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-optimized window that can be directly saved as PDF or printed on A4 paper,
 * with high-quality photos rendered alongside every clothing piece.
 */
export function openPrintableSpreadsheet(
  products: Product[],
  settings?: Partial<StoreSettings>
): void {
  if (!products || products.length === 0) return;

  const storeName = settings?.storeName || 'Eternal Chic';
  const ownerName = settings?.ownerName || 'Carolina Eleutério';
  const currentDateBR = new Date().toLocaleDateString('pt-BR');

  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
  const totalCost = products.reduce((sum, p) => sum + (Number(p.costPrice) * (Number(p.stockQuantity) || 0)), 0);
  const totalSale = products.reduce((sum, p) => sum + (Number(p.salePrice) * (Number(p.stockQuantity) || 0)), 0);
  const totalProfit = totalSale - totalCost;

  const rows = products
    .map((p) => {
      const cost = Number(p.costPrice) || 0;
      const sale = Number(p.salePrice) || 0;
      const unitProfit = sale - cost;
      const qty = Number(p.stockQuantity) || 0;
      const photoSrc = p.imageUrl && p.imageUrl.trim() ? p.imageUrl : DEFAULT_PIECE_IMAGE;

      return `
        <tr>
          <td style="text-align: center; width: 60px;">
            <img src="${photoSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 3px; border: 1px solid #D9C5B2;" />
          </td>
          <td style="font-family: monospace; font-weight: bold; text-align: center; font-size: 11px;">${p.code}</td>
          <td style="font-weight: bold;">${p.name} <br/><span style="font-size: 10px; font-weight: normal; color: #666;">${p.category} • Tam: ${p.size || 'U'} • ${p.color || ''}</span></td>
          <td style="text-align: center; font-size: 11px;">${formatDateBR(p.entryDate || p.createdAt)}</td>
          <td style="text-align: right;">R$ ${cost.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold; color: #166534;">R$ ${sale.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold; color: #047857;">+ R$ ${unitProfit.toFixed(2)}</td>
          <td style="text-align: center; font-weight: bold;">${qty}</td>
        </tr>
      `;
    })
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Planilha de Peças & Estoque - ${storeName}</title>
      <meta charset="utf-8">
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #3D2B1F; margin: 0; padding: 15px; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #3D2B1F; padding-bottom: 10px; margin-bottom: 15px; }
        h1 { margin: 0; font-size: 20px; font-family: Georgia, serif; }
        .subtitle { font-size: 11px; color: #8C7A6B; margin-top: 3px; }
        .stats { display: flex; gap: 15px; font-size: 11px; margin-bottom: 15px; }
        .stat-badge { background: #FAF8F5; border: 1px solid #D9C5B2; padding: 6px 12px; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #3D2B1F; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 6px 8px; border-bottom: 1px solid #E5DCD3; vertical-align: middle; }
        tr:nth-child(even) { background-color: #FCFBF9; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; display: flex; gap: 10px;">
        <button onclick="window.print()" style="background: #3D2B1F; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir / Salvar como PDF
        </button>
        <button onclick="window.close()" style="background: #E5DCD3; color: #3D2B1F; border: none; padding: 10px 20px; border-radius: 4px; font-size: 12px; cursor: pointer;">
          Fechar
        </button>
      </div>

      <div class="header">
        <div>
          <h1>${storeName} — Catálogo & Planilha de Peças</h1>
          <div class="subtitle">Responsável: ${ownerName} | Emissão: ${currentDateBR}</div>
        </div>
        <div style="text-align: right; font-size: 11px;">
          <strong>${products.length}</strong> Peças Cadastradas | <strong>${totalUnits}</strong> Unidades em Estoque
        </div>
      </div>

      <div class="stats">
        <div class="stat-badge">Investimento em Estoque: <strong>R$ ${totalCost.toFixed(2)}</strong></div>
        <div class="stat-badge">Faturamento Potencial: <strong>R$ ${totalSale.toFixed(2)}</strong></div>
        <div class="stat-badge">Lucro Potencial Estimado: <strong style="color: #047857;">R$ ${totalProfit.toFixed(2)}</strong></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Foto</th>
            <th style="text-align: center;">Código</th>
            <th>Nome da Peça & Detalhes</th>
            <th style="text-align: center;">Data Entrada</th>
            <th style="text-align: right;">Custo</th>
            <th style="text-align: right;">Venda</th>
            <th style="text-align: right;">Lucro Unit.</th>
            <th style="text-align: center;">Estoque</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Standard CSV exporter
 */
export function downloadCSV(products: Product[]): void {
  if (!products || products.length === 0) return;

  const headers = [
    'Código',
    'Nome da Peça',
    'Categoria',
    'Tamanho',
    'Cor',
    'Data de Entrada',
    'Valor Pago (Custo)',
    'Valor Final (Venda)',
    'Lucro Unitário',
    'Margem (%)',
    'Qtd Estoque',
    'Foto URL',
  ];

  const rows = products.map((p) => {
    const cost = Number(p.costPrice) || 0;
    const sale = Number(p.salePrice) || 0;
    const margin = p.profitMargin !== undefined ? p.profitMargin : cost > 0 ? ((sale - cost) / cost) * 100 : 100;
    const dateFormatted = formatDateBR(p.entryDate || p.createdAt);

    return [
      `"${p.code || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category || 'Geral'}"`,
      `"${p.size || 'M'}"`,
      `"${p.color || ''}"`,
      `"${dateFormatted}"`,
      cost.toFixed(2),
      sale.toFixed(2),
      (sale - cost).toFixed(2),
      `${margin.toFixed(1)}%`,
      p.stockQuantity || 0,
      `"${p.imageUrl || ''}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `planilha_pecas_eternal_chic_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
