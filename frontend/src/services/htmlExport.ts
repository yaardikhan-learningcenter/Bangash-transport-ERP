/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DEFAULT_LOGO from '../logo';
import { Trip, Invoice, POD, Customer, CompanySettings, DayBookEntry, Supplier, ExpenseVoucher, CashBankTransaction, PurchaseItem } from '../types';
import { ERPDatabaseState } from './db';
import { formatCurrency, CustomerLedgerResult, ProfitAndLossReport, DayBookSummary, DateRange, SupplierLedgerResult, amountToWords } from './accountingEngine';

export function downloadHtmlFile(filename: string, htmlContent: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

const commonStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 30px 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .document-container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 25px;
      gap: 20px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-img {
      width: 76px;
      height: 76px;
      object-fit: contain;
      border-radius: 10px;
      background: #ffffff;
      padding: 4px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .company-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }
    .company-tagline {
      font-size: 12px;
      color: #2563eb;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .company-details {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
      line-height: 1.45;
    }
    .doc-badge {
      text-align: right;
      min-width: 220px;
    }
    .badge-title {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 7px 16px;
      font-weight: 800;
      font-size: 13px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      margin-top: 10px;
      font-size: 12px;
      color: #334155;
      line-height: 1.6;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      background: #f8fafc;
    }
    .info-box-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #94a3b8;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody tr:hover {
      background: #f1f5f9;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .total-row {
      background: #f1f5f9 !important;
      font-weight: 800;
    }
    .net-due-row {
      background: #0f172a !important;
      color: #ffffff !important;
      font-weight: 900;
      font-size: 14px;
    }
    .net-due-row td {
      color: #ffffff !important;
      padding: 14px 12px;
    }
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    .signature-line {
      height: 50px;
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 8px;
    }
    .signature-label {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .action-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 20px;
      max-width: 960px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #2563eb;
      color: white;
      padding: 9px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: background-color 0.15s ease;
    }
    .btn:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #0f172a;
    }
    .btn-secondary:hover {
      background: #1e293b;
    }
    .doc-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 11px;
    }
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    @media print {
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 11.5px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .document-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .no-print { display: none !important; }
      table, tr, td, th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .info-box, .signatures, .amount-in-words-box, .official-signatures-wrap {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
`;

export interface OfficialSignatureCol {
  title: string;
  subtitle?: string;
  name?: string;
  isAuthorized?: boolean;
}

export function renderOfficialSignatures(
  settings: CompanySettings,
  cols: OfficialSignatureCol[]
): string {
  const signatoryName = settings.authorizedSignatoryName || 'Malik Bangash (Managing Director)';
  const signatoryTitle = settings.authorizedSignatoryTitle || 'Authorized Signatory';
  const showStamp = settings.showOfficialStamp !== false;
  return `
    <div class="official-signatures-wrap" style="margin-top:32px;display:grid;grid-template-columns:repeat(${cols.length}, 1fr);gap:14px;page-break-inside:avoid;break-inside:avoid;">
      ${cols.map((c) => `
        <div style="border:1.5px solid ${c.isAuthorized ? '#0284c7' : '#cbd5e1'};border-radius:8px;padding:12px 10px;background:${c.isAuthorized ? '#f0f9ff' : '#f8fafc'};text-align:center;display:flex;flex-direction:column;justify-content:space-between;min-height:125px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:10px;font-weight:800;color:${c.isAuthorized ? '#0369a1' : '#475569'};text-transform:uppercase;letter-spacing:0.5px;">
            ${c.isAuthorized ? `For ${settings.companyName}` : c.title}
          </div>
          <div style="height:48px;display:flex;align-items:center;justify-content:center;">
            ${c.isAuthorized && showStamp ? `
              <div style="border:1.5px dashed #0284c7;background:#ffffff;border-radius:6px;padding:4px 10px;font-size:9px;color:#0369a1;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 1px 2px rgba(2,132,199,0.1);">
                ★ Official Seal &amp; Stamp ★
              </div>
            ` : '<div style="border-bottom:1.5px solid #94a3b8;width:82%;margin:0 auto;"></div>'}
          </div>
          <div style="border-top:1.5px solid ${c.isAuthorized ? '#bae6fd' : '#cbd5e1'};padding-top:6px;">
            <div style="font-size:11px;font-weight:900;color:#0f172a;line-height:1.2;">
              ${c.isAuthorized ? signatoryName : (c.name || c.title)}
            </div>
            <div style="font-size:10px;color:${c.isAuthorized ? '#0284c7' : '#64748b'};font-weight:700;margin-top:1px;">
              ${c.isAuthorized ? signatoryTitle : (c.subtitle || '')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderAmountInWords(amount: number, label: string = 'Amount in Words'): string {
  const words = amountToWords(amount);
  return `
    <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-left:4px solid #0284c7;border-radius:6px;padding:9px 14px;margin:16px 0;display:flex;align-items:flex-start;gap:10px;page-break-inside:avoid;break-inside:avoid;">
      <div style="font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;padding-top:1px;">
        ${label}:
      </div>
      <div style="font-size:12px;font-weight:800;color:#0f172a;font-style:italic;line-height:1.4;">
        ${words}
      </div>
    </div>
  `;
}

function renderHeader(settings: CompanySettings, badgeTitle: string, metaLines: { label: string; value: string; color?: string }[]) {
  const logoUrl = settings.logoUrl || DEFAULT_LOGO;
  return `
    <div class="header">
      <div class="brand-section">
        <img src="${logoUrl}" alt="${settings.companyName}" class="logo-img" />
        <div>
          <h1 class="company-title">${settings.companyName}</h1>
          <div class="company-tagline">${settings.tagline}</div>
          <div class="company-details">
            ${settings.address}, ${settings.cityCountry}<br>
            Phone: ${settings.phone} | Email: ${settings.email}<br>
            <strong>Tax NTN / GST:</strong> ${settings.taxRegistrationNumber}
          </div>
        </div>
      </div>

      <div class="doc-badge">
        <div class="badge-title">${badgeTitle}</div>
        <div class="doc-meta">
          ${metaLines.map(m => `<div><strong>${m.label}:</strong> <span style="${m.color ? `color:${m.color};font-weight:800;` : ''}">${m.value}</span></div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

export function generateBiltyHtml(trip: Trip, settings: CompanySettings, currency: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Goods Consignment Note - ${trip.bdNumber}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'Goods Consignment Note (Bilty)', [
      { label: 'Bilty Number', value: trip.bdNumber, color: '#2563eb' },
      { label: 'Trip Number', value: trip.tripNumber },
      { label: 'Trip Date', value: trip.tripDate },
      { label: 'Status', value: trip.status, color: '#059669' },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">Consignor (Customer) Particulars</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">${trip.customerCompanyName}</div>
        <div style="color:#475569;margin-top:2px;">Customer PO / Ref: ${trip.customerInvoiceNumber || 'N/A'}</div>
        <div style="margin-top:6px;"><strong>Origin (Pickup Location):</strong> ${trip.startingLocation}</div>
        <div><strong>Dispatched Date &amp; Time:</strong> ${trip.startingDateTime}</div>
      </div>

      <div class="info-box">
        <div class="info-box-title">Fleet &amp; Driver Details</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">Vehicle: ${trip.vehicleNumber}</div>
        <div style="color:#475569;">${trip.vehicleType} (${trip.vehicleSize})</div>
        <div style="margin-top:6px;"><strong>Driver Name:</strong> ${trip.driverName} (${trip.driverContactNumber})</div>
        <div><strong>Driver CNIC / ID:</strong> ${trip.driverIdNumber}</div>
      </div>
    </div>

    <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">Destination (Delivery Location):</div>
        <div style="font-size:13px;font-weight:800;color:#0f172a;">${trip.destinationLocation}</div>
        ${trip.additionalLocations ? `<div style="font-size:11px;color:#475569;">Additional Enroute Stops: ${trip.additionalLocations}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">Expected Delivery Date:</div>
        <div style="font-size:12px;font-weight:700;color:#0f172a;">${trip.expectedDeliveryDateTime}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Cargo Description &amp; Marks</th>
          <th class="text-center">Quantity</th>
          <th class="text-center">Unit</th>
          <th class="text-right">Freight Rate</th>
          <th class="text-right">Freight Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${trip.goodsDescription}</strong>
            ${trip.remarks ? `<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic;">Note: ${trip.remarks}</div>` : ''}
          </td>
          <td class="text-center font-bold">${trip.goodsQuantity}</td>
          <td class="text-center">${trip.quantityUnit}</td>
          <td class="text-right font-bold">${formatCurrency(trip.freightRate, currency)} (${trip.rateType})</td>
          <td class="text-right font-black" style="font-size:13px;">${formatCurrency(trip.totalFreightAmount, currency)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="4" class="text-right">Gross Freight Revenue:</td>
          <td class="text-right">${formatCurrency(trip.totalFreightAmount, currency)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" class="text-right" style="color:#059669;">Less: Customer Advance Paid:</td>
          <td class="text-right" style="color:#059669;">− ${formatCurrency(trip.advanceReceived, currency)}</td>
        </tr>
        <tr class="net-due-row">
          <td colspan="4" class="text-right">Balance Payable Upon Delivery:</td>
          <td class="text-right" style="color:#34d399;">${formatCurrency(trip.outstandingFreightAmount, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(trip.totalFreightAmount, 'Total Freight Value in Words')}

    <div style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;background:#f8fafc;font-size:10px;color:#64748b;margin-top:16px;">
      <strong>Terms of Carriage:</strong> Goods carried strictly in accordance with standard forwarding laws and regulations. Dangerous/prohibited cargo must be declared prior to dispatch. Carrier lien applies until all freight dues are cleared.
    </div>

    ${renderOfficialSignatures(settings, [
      { title: 'Consignor / Shipper', subtitle: 'Signature & Official Stamp', name: trip.customerCompanyName },
      { title: 'Fleet Driver', subtitle: 'Driver Thumbprint & Sign', name: `${trip.driverName} (${trip.vehicleNumber})` },
      { title: 'Booking Dispatch', subtitle: 'Station Verified', name: 'Operations Desk' },
      { title: 'Carrier Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Consignment Record • ${settings.companyName}</span>
      <span>Printed from Enterprise ERP</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateInvoiceHtml(inv: Invoice, settings: CompanySettings, currency: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Freight Tax Invoice - ${inv.invoiceNumber}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'FREIGHT TAX INVOICE', [
      { label: 'Invoice #', value: inv.invoiceNumber, color: '#2563eb' },
      { label: 'Invoice Date', value: inv.invoiceDate },
      { label: 'Payment Due', value: inv.dueDate },
      { label: 'Payment Status', value: inv.paymentStatus, color: inv.paymentStatus === 'Paid' ? '#059669' : '#dc2626' },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">BILLED TO (CUSTOMER):</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">${inv.customerName}</div>
        <div style="color:#475569;">${inv.billingAddress || 'Corporate Office Address'}</div>
        <div style="margin-top:4px;"><strong>Customer NTN / Tax ID:</strong> ${inv.customerTaxNumber || 'N/A'}</div>
      </div>

      <div class="info-box">
        <div class="info-box-title">CONSIGNMENT &amp; LOGISTICS PARTICULARS:</div>
        <div><strong>Linked Trip #:</strong> ${inv.tripNumber}</div>
        <div><strong>Fleet Vehicle #:</strong> ${inv.vehicleNumber}</div>
        <div><strong>Consignment Cargo:</strong> ${inv.goodsDescription}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description of Freight Service</th>
          <th class="text-center">Quantity</th>
          <th class="text-right">Freight Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Freight Transportation Service</strong>
            <div style="font-size:11px;color:#64748b;">${inv.goodsDescription} (Trip ${inv.tripNumber})</div>
          </td>
          <td class="text-center font-bold">${inv.quantity} ${inv.quantityUnit}</td>
          <td class="text-right">${formatCurrency(inv.freightRate, currency)}</td>
          <td class="text-right font-bold">${formatCurrency(inv.freightAmount, currency)}</td>
        </tr>
        ${inv.loadingUnloadingCharges > 0 ? `
        <tr>
          <td>Loading &amp; Offloading Handling Charges</td>
          <td class="text-center">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-medium">${formatCurrency(inv.loadingUnloadingCharges, currency)}</td>
        </tr>` : ''}
        ${inv.additionalCharges > 0 ? `
        <tr>
          <td>Additional Demurrage / Surcharges</td>
          <td class="text-center">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-medium">${formatCurrency(inv.additionalCharges, currency)}</td>
        </tr>` : ''}
        ${inv.discount > 0 ? `
        <tr>
          <td style="color:#059669;font-weight:bold;">Contract Discount Allowed</td>
          <td class="text-center">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-bold" style="color:#059669;">− ${formatCurrency(inv.discount, currency)}</td>
        </tr>` : ''}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3" class="text-right">Total Invoice Value:</td>
          <td class="text-right" style="font-size:13px;font-weight:900;">${formatCurrency(inv.totalInvoiceAmount, currency)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right" style="color:#059669;">Less: Payments / Advances Received:</td>
          <td class="text-right font-bold" style="color:#059669;">− ${formatCurrency(inv.amountReceived, currency)}</td>
        </tr>
        <tr class="net-due-row">
          <td colspan="3" class="text-right">NET BALANCE DUE:</td>
          <td class="text-right" style="color:#34d399;">${formatCurrency(inv.remainingBalance, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(inv.remainingBalance > 0 ? inv.remainingBalance : inv.totalInvoiceAmount, inv.remainingBalance > 0 ? 'Net Balance Payable in Words' : 'Total Invoice Value in Words')}

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;margin-bottom:4px;">Bank Settlement Instructions:</div>
      <div style="font-size:12px;color:#334155;">${settings.bankDetailsForInvoice}</div>
    </div>

    ${renderOfficialSignatures(settings, [
      { title: 'Client / Consignor Acceptance', subtitle: 'Received & Accepted', name: inv.customerName },
      { title: 'Billing & Accounts Auditor', subtitle: 'Accounts Division', name: 'Finance Wing' },
      { title: 'Commercial Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>${settings.companyName} • Commercial Freight Division</span>
      <span>Generated by Forwarding ERP</span>
    </div>
  </div>
</body>
</html>`;
}

export function generatePODHtml(pod: POD, settings: CompanySettings): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Proof of Delivery (POD) - ${pod.podNumber}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'PROOF OF DELIVERY (POD)', [
      { label: 'POD Number', value: pod.podNumber, color: '#2563eb' },
      { label: 'Trip Reference', value: pod.tripNumber },
      { label: 'Delivery Status', value: pod.status, color: pod.status === 'Verified' ? '#059669' : '#d97706' },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">Consignee &amp; Delivery Destination</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">${pod.customerName}</div>
        <div style="margin-top:4px;"><strong>Destination Location:</strong> ${pod.deliveryLocation}</div>
        <div><strong>Delivered Date &amp; Time:</strong> ${pod.deliveryDateTime}</div>
      </div>

      <div class="info-box">
        <div class="info-box-title">Transport Fleet &amp; Driver</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">Vehicle: ${pod.vehicleNumber}</div>
        <div style="margin-top:4px;"><strong>Assigned Driver:</strong> ${pod.driverName}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Consignment Cargo Description</th>
          <th class="text-center">Dispatched Qty</th>
          <th class="text-center">Delivered Qty</th>
          <th class="text-center">Unit</th>
          <th>Condition / Shortage / Damage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${pod.goodsDescription}</strong></td>
          <td class="text-center font-bold">${pod.quantityDispatched}</td>
          <td class="text-center font-black" style="color:#2563eb;">${pod.quantityDelivered}</td>
          <td class="text-center">${pod.quantityUnit}</td>
          <td style="color:#059669;font-weight:700;">${pod.shortageDamageDetails || 'Nil / Zero Shortage - In Pristine Condition'}</td>
        </tr>
      </tbody>
    </table>

    <div class="info-box" style="margin-bottom:24px;">
      <div class="info-box-title">Consignee Receiver Acknowledgment Particulars:</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;">
        <div><strong>Received By:</strong> ${pod.receivedBy || 'Designated Receiver'}</div>
        <div><strong>Designation:</strong> ${pod.receiverDesignation || 'Warehouse In-charge'}</div>
        <div><strong>Contact Phone:</strong> ${pod.receiverContactNumber || 'N/A'}</div>
      </div>
      ${pod.deliveryRemarks ? `<div style="margin-top:8px;color:#475569;"><strong>Delivery Remarks:</strong> ${pod.deliveryRemarks}</div>` : ''}
    </div>

    ${renderOfficialSignatures(settings, [
      { title: 'Consignee Receiver Stamp', subtitle: pod.receiverDesignation || 'Warehouse In-charge', name: pod.receivedBy || 'Designated Consignee' },
      { title: 'Delivering Fleet Driver', subtitle: 'Delivery Confirmed', name: `${pod.driverName} (${pod.vehicleNumber})` },
      { title: 'Carrier Operations Audit', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Proof of Delivery Record • ${settings.companyName}</span>
      <span>Forwarding ERP Verified</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateLedgerHtml(customer: Customer, ledger: CustomerLedgerResult, settings: CompanySettings, currency: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Customer Statement of Account - ${customer.companyName}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'STATEMENT OF ACCOUNT', [
      { label: 'Statement Date', value: new Date().toISOString().substring(0, 10) },
      { label: 'Closing Balance', value: formatCurrency(ledger.closingBalance, currency), color: '#059669' },
    ])}

    <div class="info-box" style="margin-bottom:24px;">
      <div class="info-box-title">ACCOUNT HOLDER (CUSTOMER):</div>
      <div style="font-size:16px;font-weight:800;color:#0f172a;">${customer.companyName}</div>
      <div style="color:#475569;">${customer.billingAddress}</div>
      <div style="margin-top:4px;">Tax NTN / GST: ${customer.taxRegistrationNumber} | Terms: ${customer.paymentTerms} | Credit Limit: ${formatCurrency(customer.creditLimit, currency)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Transaction Type</th>
          <th>Voucher #</th>
          <th>Description</th>
          <th class="text-right">Debit (Billed)</th>
          <th class="text-right">Credit (Received)</th>
          <th class="text-right">Running Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr class="total-row">
          <td colspan="4">OPENING BALANCE</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-bold">${formatCurrency(ledger.openingBalance, currency)}</td>
        </tr>
        ${ledger.entries.map((e) => `
        <tr>
          <td>${e.date}</td>
          <td><span style="font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;background:#f1f5f9;">${e.transactionType}</span></td>
          <td class="font-bold">${e.voucherNumber}</td>
          <td>${e.description}</td>
          <td class="text-right font-bold" style="color:#2563eb;">${e.debit > 0 ? formatCurrency(e.debit, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#059669;">${e.credit > 0 ? formatCurrency(e.credit, currency) : '-'}</td>
          <td class="text-right font-black">${formatCurrency(e.runningBalance, currency)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="net-due-row">
          <td colspan="4" class="text-right">NET CLOSING STATEMENT BALANCE:</td>
          <td class="text-right">${formatCurrency(ledger.totalDebit, currency)}</td>
          <td class="text-right">${formatCurrency(ledger.totalCredit, currency)}</td>
          <td class="text-right" style="color:#34d399;font-size:15px;">${formatCurrency(ledger.closingBalance, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(ledger.closingBalance, 'Closing Balance in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Customer Accounts Officer', subtitle: 'Statement Confirmed', name: customer.companyName },
      { title: 'Billing & Receivables Auditor', subtitle: 'Reconciled & Verified', name: 'Finance Department' },
      { title: 'Commercial Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>${settings.companyName} • Customer Accounts Department</span>
      <span>Generated by Goods Forwarding ERP</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateDayBookHtml(
  entries: DayBookEntry[],
  summary: DayBookSummary,
  settings: CompanySettings,
  currency: string,
  dateRange: DateRange
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Day Book Register (${dateRange.startDate} to ${dateRange.endDate})</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'DAY BOOK REGISTER', [
      { label: 'Period From', value: dateRange.startDate },
      { label: 'Period To', value: dateRange.endDate },
      { label: 'Total Entries', value: entries.length.toString() },
    ])}

    <div class="grid-3">
      <div class="info-box">
        <div class="info-box-title">Cash Flow</div>
        <div>Inflows: <strong style="color:#059669;">${formatCurrency(summary.totalCashIn, currency)}</strong></div>
        <div>Outflows: <strong style="color:#dc2626;">${formatCurrency(summary.totalCashOut, currency)}</strong></div>
        <div style="margin-top:4px;font-weight:800;">Closing: ${formatCurrency(summary.closingCash, currency)}</div>
      </div>
      <div class="info-box">
        <div class="info-box-title">Bank Flow</div>
        <div>Inflows: <strong style="color:#059669;">${formatCurrency(summary.totalBankIn, currency)}</strong></div>
        <div>Outflows: <strong style="color:#dc2626;">${formatCurrency(summary.totalBankOut, currency)}</strong></div>
        <div style="margin-top:4px;font-weight:800;">Closing: ${formatCurrency(summary.closingBank, currency)}</div>
      </div>
      <div class="info-box">
        <div class="info-box-title">Net Operations</div>
        <div>Net Cash Flow: <strong style="color:${(summary.totalCashIn - summary.totalCashOut) >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(summary.totalCashIn - summary.totalCashOut, currency)}</strong></div>
        <div>Net Bank Flow: <strong style="color:${(summary.totalBankIn - summary.totalBankOut) >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(summary.totalBankIn - summary.totalBankOut, currency)}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Voucher #</th>
          <th>Type</th>
          <th>Party / Payee</th>
          <th>Description</th>
          <th class="text-right">Cash In</th>
          <th class="text-right">Cash Out</th>
          <th class="text-right">Bank In</th>
          <th class="text-right">Bank Out</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((e) => `
        <tr>
          <td>${e.date}</td>
          <td class="font-bold">${e.voucherNumber}</td>
          <td><span style="font-weight:700;font-size:10px;padding:2px 5px;border-radius:4px;background:#f1f5f9;">${e.transactionType}</span></td>
          <td class="font-bold">${e.partyName}</td>
          <td>${e.description}</td>
          <td class="text-right font-bold" style="color:#059669;">${e.cashIn > 0 ? formatCurrency(e.cashIn, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#dc2626;">${e.cashOut > 0 ? formatCurrency(e.cashOut, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#059669;">${e.bankIn > 0 ? formatCurrency(e.bankIn, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#dc2626;">${e.bankOut > 0 ? formatCurrency(e.bankOut, currency) : '-'}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="5" class="text-right">PERIOD TOTALS:</td>
          <td class="text-right" style="color:#059669;">${formatCurrency(summary.totalCashIn, currency)}</td>
          <td class="text-right" style="color:#dc2626;">${formatCurrency(summary.totalCashOut, currency)}</td>
          <td class="text-right" style="color:#059669;">${formatCurrency(summary.totalBankIn, currency)}</td>
          <td class="text-right" style="color:#dc2626;">${formatCurrency(summary.totalBankOut, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderOfficialSignatures(settings, [
      { title: 'Cashier / Treasury Desk', subtitle: 'Transactions Posted', name: 'Treasury Wing' },
      { title: 'Senior Auditor', subtitle: 'Accounts Checked', name: 'Audit Team' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>${settings.companyName} • Master Audit Ledger</span>
      <span>${settings.printNotesFooter || 'Official Day Book Report • Bangash Transport Co.'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateProfitLossHtml(
  report: ProfitAndLossReport,
  settings: CompanySettings,
  currency: string,
  dateRange: DateRange,
  basis: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Profit & Loss Statement (${basis} Basis)</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'PROFIT & LOSS STATEMENT', [
      { label: 'Accounting Basis', value: `${basis} Basis`, color: '#2563eb' },
      { label: 'Period', value: `${dateRange.startDate} to ${dateRange.endDate}` },
      { label: 'Net Operating Profit', value: formatCurrency(report.netProfit, currency), color: '#059669' },
    ])}

    <div class="grid-3">
      <div class="info-box">
        <div class="info-box-title">Revenue (Income)</div>
        <div style="font-size:16px;font-weight:900;color:#0f172a;">${formatCurrency(report.income.totalIncome, currency)}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">Freight &amp; Surcharges</div>
      </div>
      <div class="info-box">
        <div class="info-box-title">Gross Freight Profit</div>
        <div style="font-size:16px;font-weight:900;color:#2563eb;">${formatCurrency(report.grossProfit, currency)}</div>
        <div style="font-size:11px;color:#2563eb;font-weight:700;margin-top:2px;">Gross Margin: ${report.grossProfitMargin}%</div>
      </div>
      <div class="info-box">
        <div class="info-box-title">Net Operating Profit</div>
        <div style="font-size:16px;font-weight:900;color:#059669;">${formatCurrency(report.netProfit, currency)}</div>
        <div style="font-size:11px;color:#059669;font-weight:700;margin-top:2px;">Net Margin: ${report.netProfitMargin}%</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Account / Category Description</th>
          <th class="text-right">Subtotal</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr class="total-row">
          <td colspan="3"><strong>1. OPERATING REVENUE (FREIGHT INCOME)</strong></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Gross Freight Revenue Recognized</td>
          <td class="text-right">${formatCurrency(report.income.freightRevenue, currency)}</td>
          <td></td>
        </tr>
        ${report.income.additionalCharges > 0 ? `
        <tr>
          <td style="padding-left:24px;">Additional Surcharges &amp; Demurrage</td>
          <td class="text-right">${formatCurrency(report.income.additionalCharges, currency)}</td>
          <td></td>
        </tr>` : ''}
        <tr class="total-row">
          <td><strong>TOTAL OPERATING REVENUE:</strong></td>
          <td></td>
          <td class="text-right font-black" style="color:#0f172a;">${formatCurrency(report.income.totalIncome, currency)}</td>
        </tr>

        <tr class="total-row">
          <td colspan="3"><strong>2. DIRECT TRIP EXPENSES (COST OF FREIGHT TRANSPORT)</strong></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Fuel &amp; Diesel Expenses</td>
          <td class="text-right">${formatCurrency(report.directCosts.fuel, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Highway Toll Taxes &amp; Road Cess</td>
          <td class="text-right">${formatCurrency(report.directCosts.tollRoadTaxes, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Driver Per-Diem Allowances</td>
          <td class="text-right">${formatCurrency(report.directCosts.driverAllowances, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Terminal Loading &amp; Offloading Charges</td>
          <td class="text-right">${formatCurrency(report.directCosts.loadingUnloading, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Enroute Repair &amp; Maintenance</td>
          <td class="text-right">${formatCurrency(report.directCosts.repairMaintenance, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Parking, Food &amp; Other Direct Logistics</td>
          <td class="text-right">${formatCurrency(report.directCosts.parkingFoodOther, currency)}</td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td><strong>TOTAL DIRECT TRIP EXPENSES:</strong></td>
          <td></td>
          <td class="text-right font-bold" style="color:#dc2626;">− ${formatCurrency(report.directCosts.totalDirectCosts, currency)}</td>
        </tr>

        <tr style="background:#e0f2fe;font-weight:900;">
          <td><strong>GROSS FREIGHT MARGIN:</strong></td>
          <td></td>
          <td class="text-right" style="color:#0369a1;font-size:14px;">${formatCurrency(report.grossProfit, currency)} (${report.grossProfitMargin}%)</td>
        </tr>

        <tr class="total-row">
          <td colspan="3"><strong>3. OPERATING OVERHEAD EXPENSES (ADMINISTRATIVE &amp; FACILITY)</strong></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Terminal Office &amp; Warehouse Rent</td>
          <td class="text-right">${formatCurrency(report.operatingExpenses.officeRent, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Admin Staff Salaries &amp; Payroll</td>
          <td class="text-right">${formatCurrency(report.operatingExpenses.salaries, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Utilities &amp; Office Internet</td>
          <td class="text-right">${formatCurrency(report.operatingExpenses.utilities, currency)}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:24px;">Bank Charges, Tyres &amp; Miscellaneous</td>
          <td class="text-right">${formatCurrency(report.operatingExpenses.bankCharges + report.operatingExpenses.tyresOverhaul + report.operatingExpenses.misc, currency)}</td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td><strong>TOTAL OPERATING OVERHEADS:</strong></td>
          <td></td>
          <td class="text-right font-bold" style="color:#dc2626;">− ${formatCurrency(report.operatingExpenses.totalOperatingExpenses, currency)}</td>
        </tr>

        <tr class="net-due-row">
          <td colspan="2">NET OPERATING PROFIT / (LOSS):</td>
          <td class="text-right" style="color:#34d399;font-size:16px;">${formatCurrency(report.netProfit, currency)} (${report.netProfitMargin}%)</td>
        </tr>
      </tbody>
    </table>

    ${renderAmountInWords(report.netProfit, 'Net Operating Profit in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Chief Financial Officer', subtitle: 'Finance Wing', name: 'Finance Controller' },
      { title: 'Internal Audit Committee', subtitle: 'Audited & Reconciled', name: 'Audit Team' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>${settings.companyName} • Financial Accounts Division</span>
      <span>${settings.printNotesFooter || 'Enterprise P&L Statement • Certified by Bangash Transport Co.'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateReportHtml(
  reportTitle: string,
  subtitle: string,
  tableHeaders: string[],
  tableRows: (string | number)[][],
  summaryCards: { label: string; value: string }[],
  settings: CompanySettings,
  currency: string,
  dateRange: DateRange
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - ${reportTitle}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, reportTitle, [
      { label: 'Report Generated', value: new Date().toISOString().substring(0, 10) },
      { label: 'Date Range', value: `${dateRange.startDate} to ${dateRange.endDate}` },
      { label: 'Total Records', value: tableRows.length.toString(), color: '#2563eb' },
    ])}

    ${subtitle ? `<div style="font-size:13px;color:#475569;margin-bottom:20px;font-style:italic;">${subtitle}</div>` : ''}

    ${summaryCards && summaryCards.length > 0 ? `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(summaryCards.length, 4)}, 1fr);gap:14px;margin-bottom:24px;">
      ${summaryCards.map(c => `
      <div class="info-box">
        <div class="info-box-title">${c.label}</div>
        <div style="font-size:15px;font-weight:900;color:#0f172a;">${c.value}</div>
      </div>`).join('')}
    </div>` : ''}

    <table>
      <thead>
        <tr>
          ${tableHeaders.map((th, idx) => `<th class="${idx >= tableHeaders.length - 3 ? 'text-right' : ''}">${th}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableRows.length === 0 ? `
        <tr>
          <td colspan="${tableHeaders.length}" class="text-center" style="padding:30px;color:#94a3b8;">No records found for the selected criteria.</td>
        </tr>` : tableRows.map(row => `
        <tr>
          ${row.map((cell, idx) => `<td class="${idx >= tableHeaders.length - 3 ? 'text-right' : ''}">${cell}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>

    ${renderOfficialSignatures(settings, [
      { title: 'Prepared By', subtitle: 'Systems Reporting Desk', name: 'Operations Executive' },
      { title: 'Audited & Verified', subtitle: 'Accounting Division', name: 'Internal Audit' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>${settings.companyName} • Statutory &amp; Operational Reports</span>
      <span>${settings.printNotesFooter || 'Generated by Forwarding ERP • Verified Operational Register'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateSupplierStatementHtml(
  supplier: Supplier,
  transactions: CashBankTransaction[],
  vouchers: ExpenseVoucher[],
  settings: CompanySettings,
  currency: string
): string {
  // Filter transactions and vouchers for this supplier
  const supTx = transactions.filter(
    (t) =>
      t.partyId === supplier.id ||
      (t.partyName && t.partyName.toLowerCase() === supplier.name.toLowerCase())
  );

  const supVouchers = vouchers.filter(
    (v) =>
      v.payee && v.payee.toLowerCase() === supplier.name.toLowerCase() && v.status === 'Posted'
  );

  // Build statement entries:
  // - Vouchers billed / supplies (Credit to Supplier, increases payable)
  // - Payments made to supplier (Debit to Supplier, decreases payable)
  interface StmtEntry {
    date: string;
    refNo: string;
    description: string;
    type: string;
    billed: number; // Supplies / Expenses (Credit to Payable)
    paid: number; // Payments made (Debit to Payable)
    balance: number;
  }

  const rawEntries: Array<Omit<StmtEntry, 'balance'>> = [];

  supVouchers.forEach((v) => {
    rawEntries.push({
      date: v.date,
      refNo: v.voucherNumber,
      description: `${v.expenseName || v.categoryName}: ${v.description || ''}`,
      type: 'Supplies / Bills',
      billed: v.amount,
      paid: 0,
    });
  });

  supTx.forEach((t) => {
    rawEntries.push({
      date: t.date,
      refNo: t.voucherNumber,
      description: `${t.transactionType}: ${t.description || ''} (Paid via ${t.accountName})`,
      type: 'Payment Made',
      billed: 0,
      paid: t.amount,
    });
  });

  rawEntries.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  let running = supplier.openingBalance || 0;
  let totalBilled = 0;
  let totalPaid = 0;

  const entries: StmtEntry[] = rawEntries.map((e) => {
    running = running + e.billed - e.paid;
    totalBilled += e.billed;
    totalPaid += e.paid;
    return {
      ...e,
      balance: running,
    };
  });

  const closingBalance = running;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Supplier Statement - ${supplier.name}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'SUPPLIER / PAYABLE STATEMENT', [
      { label: 'Statement Date', value: new Date().toISOString().substring(0, 10) },
      { label: 'Current Payable Due', value: formatCurrency(closingBalance, currency), color: '#dc2626' },
      { label: 'Payment Terms', value: supplier.paymentTerms || 'Credit Account' },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">SUPPLIER / VENDOR DETAILS:</div>
        <div style="font-size:16px;font-weight:800;color:#0f172a;">${supplier.name}</div>
        <div style="color:#475569;margin-top:2px;">Contact: <strong>${supplier.contactPerson || '-'}</strong></div>
        <div style="color:#475569;">Mobile: ${supplier.mobileNumber || '-'}</div>
        <div style="color:#475569;font-size:11px;margin-top:2px;">${supplier.address || ''}</div>
      </div>

      <div class="info-box">
        <div class="info-box-title">ACCOUNT SUMMARY:</div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Opening Balance:</span>
          <strong>${formatCurrency(supplier.openingBalance, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Total Supplies / Invoices:</span>
          <strong style="color:#dc2626;">+ ${formatCurrency(totalBilled, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Total Payments Released:</span>
          <strong style="color:#059669;">− ${formatCurrency(totalPaid, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid #cbd5e1;font-size:13px;font-weight:900;">
          <span>Net Payable Balance:</span>
          <span style="color:#dc2626;">${formatCurrency(closingBalance, currency)}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Voucher / Ref #</th>
          <th>Transaction Details</th>
          <th>Type</th>
          <th class="text-right">Supplies (Payable)</th>
          <th class="text-right">Paid (Debit)</th>
          <th class="text-right">Running Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr class="total-row">
          <td colspan="4">OPENING BALANCE</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-bold">${formatCurrency(supplier.openingBalance, currency)}</td>
        </tr>
        ${entries.length === 0 ? `
        <tr>
          <td colspan="7" class="text-center" style="padding:24px;color:#94a3b8;">No transactions logged for this vendor period.</td>
        </tr>` : entries.map(e => `
        <tr>
          <td>${e.date}</td>
          <td class="font-bold">${e.refNo}</td>
          <td>${e.description}</td>
          <td><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#f1f5f9;font-weight:700;">${e.type}</span></td>
          <td class="text-right font-bold" style="color:#dc2626;">${e.billed > 0 ? formatCurrency(e.billed, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#059669;">${e.paid > 0 ? formatCurrency(e.paid, currency) : '-'}</td>
          <td class="text-right font-black">${formatCurrency(e.balance, currency)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="net-due-row">
          <td colspan="4" class="text-right font-bold">TOTALS &amp; CLOSING PAYABLE:</td>
          <td class="text-right font-bold">${formatCurrency(totalBilled, currency)}</td>
          <td class="text-right font-bold">${formatCurrency(totalPaid, currency)}</td>
          <td class="text-right font-black" style="color:#34d399;font-size:15px;">${formatCurrency(closingBalance, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(closingBalance, 'Net Payable Balance in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Vendor / Supplier Stamp', subtitle: 'Confirmation & Seal', name: supplier.name },
      { title: 'Accounts & Payables Auditor', subtitle: 'Verified & Reconciled', name: 'Finance Wing' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Payable Statement • ${settings.companyName}</span>
      <span>${settings.printNotesFooter || 'Enterprise Accounts Division • Verified Vendor Statement'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateSupplierLedgerHtml(
  supplier: Supplier,
  ledger: SupplierLedgerResult,
  settings: CompanySettings,
  currency: string
): string {
  const periodText =
    ledger.dateRange.startDate === '2020-01-01' && ledger.dateRange.endDate === '2030-12-31'
      ? 'All Time (Full Ledger History)'
      : `${ledger.dateRange.startDate} to ${ledger.dateRange.endDate} (${ledger.periodLabel})`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Supplier Party Ledger - ${supplier.name}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'SUPPLIER / PARTY LEDGER STATEMENT', [
      { label: 'Statement Date', value: new Date().toISOString().substring(0, 10) },
      { label: 'Period Filter', value: periodText },
      { label: 'Net Payable Due', value: formatCurrency(ledger.closingBalance, currency), color: ledger.closingBalance > 0 ? '#dc2626' : '#059669' },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">SUPPLIER / VENDOR DETAILS:</div>
        <div style="font-size:16px;font-weight:800;color:#0f172a;">${supplier.name}</div>
        <div style="color:#475569;margin-top:2px;">Contact: <strong>${supplier.contactPerson || '-'}</strong></div>
        <div style="color:#475569;">Mobile: ${supplier.mobileNumber || '-'}</div>
        <div style="color:#475569;font-size:11px;margin-top:2px;">${supplier.address || ''}</div>
        <div style="margin-top:4px;"><span class="badge badge-blue">Terms: ${supplier.paymentTerms || 'Weekly Credit'}</span></div>
      </div>

      <div class="info-box">
        <div class="info-box-title">LEDGER PERIOD SUMMARY:</div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Opening Balance (as of ${ledger.dateRange.startDate}):</span>
          <strong>${formatCurrency(ledger.openingBalance, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Period Purchases &amp; Supplies:</span>
          <strong style="color:#dc2626;">+ ${formatCurrency(ledger.totalCredit, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:3px 0;">
          <span>Period Payments Disbursed:</span>
          <strong style="color:#059669;">− ${formatCurrency(ledger.totalDebit, currency)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #cbd5e1;font-size:13px;font-weight:900;">
          <span>Net Payable Balance:</span>
          <span style="color:${ledger.closingBalance > 0 ? '#dc2626' : '#059669'};">${formatCurrency(ledger.closingBalance, currency)}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Voucher / Ref #</th>
          <th>Transaction Type</th>
          <th>Details &amp; Vehicle Allocation</th>
          <th class="text-right">Purchases / Billed (Credit)</th>
          <th class="text-right">Paid Disbursed (Debit)</th>
          <th class="text-right">Running Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr class="total-row">
          <td colspan="4">OPENING BALANCE AS OF ${ledger.dateRange.startDate}</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right font-black">${formatCurrency(ledger.openingBalance, currency)}</td>
        </tr>
        ${ledger.entries.length === 0 ? `
        <tr>
          <td colspan="7" class="text-center" style="padding:28px;color:#94a3b8;">No vendor transactions recorded for this period.</td>
        </tr>` : ledger.entries.map(e => `
        <tr>
          <td>${e.date}</td>
          <td class="font-bold">${e.voucherNumber}</td>
          <td><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#f1f5f9;font-weight:700;">${e.transactionType}</span></td>
          <td>${e.description}</td>
          <td class="text-right font-bold" style="color:#dc2626;">${e.credit > 0 ? formatCurrency(e.credit, currency) : '-'}</td>
          <td class="text-right font-bold" style="color:#059669;">${e.debit > 0 ? formatCurrency(e.debit, currency) : '-'}</td>
          <td class="text-right font-black">${formatCurrency(e.runningBalance, currency)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="net-due-row">
          <td colspan="4" class="text-right font-bold">PERIOD TOTALS &amp; CLOSING BALANCE:</td>
          <td class="text-right font-bold">${formatCurrency(ledger.totalCredit, currency)}</td>
          <td class="text-right font-bold">${formatCurrency(ledger.totalDebit, currency)}</td>
          <td class="text-right font-black" style="color:#34d399;font-size:15px;">${formatCurrency(ledger.closingBalance, currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(ledger.closingBalance, 'Net Closing Payable in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Vendor / Supplier Stamp', subtitle: 'Party Acknowledgment', name: supplier.name },
      { title: 'Accounts & Payables Auditor', subtitle: 'Audit & Reconciliation', name: 'Finance Wing' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Vendor Party Ledger • ${settings.companyName}</span>
      <span>${settings.printNotesFooter || 'Enterprise Accounts Division • Authenticated Party Ledger'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateExpenseVoucherHtml(
  voucher: ExpenseVoucher,
  settings: CompanySettings,
  currency: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Expense Voucher ${voucher.voucherNumber}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'EXPENSE PAYMENT VOUCHER', [
      { label: 'Voucher Number', value: voucher.voucherNumber },
      { label: 'Voucher Date', value: voucher.date },
      { label: 'Classification', value: voucher.type, color: voucher.type === 'Direct Trip' ? '#b45309' : '#4338ca' },
    ])}

    <div class="info-box" style="margin-bottom:20px;">
      <div class="info-box-title">EXPENSE PARTICULARS</div>
      <div style="font-size:16px;font-weight:900;color:#0f172a;">${voucher.expenseName || voucher.categoryName}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px;">Category: <strong>${voucher.categoryName}</strong> (${voucher.type})</div>
      <div style="margin-top:6px;font-size:13px;color:#1e293b;">${voucher.description}</div>
    </div>

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">PAYEE &amp; PAYMENT DETAILS</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;">Paid To: ${voucher.payee}</div>
        <div style="margin-top:4px;color:#475569;">Payment Method: <strong>${voucher.paymentMethod}</strong></div>
        <div style="color:#475569;">Reference / Bill #: <strong>${voucher.referenceNumber || 'N/A'}</strong></div>
        ${voucher.remarks ? `<div style="margin-top:4px;font-style:italic;color:#64748b;">Remarks: ${voucher.remarks}</div>` : ''}
      </div>

      <div class="info-box">
        <div class="info-box-title">FLEET &amp; TRIP LINKAGE</div>
        <div>Linked Trip: <strong>${voucher.tripNumber || 'General Company Overhead'}</strong></div>
        <div>Assigned Vehicle: <strong>${voucher.vehicleNumber || 'N/A'}</strong></div>
        <div>Assigned Driver: <strong>${voucher.driverName || 'N/A'}</strong></div>
        <div style="margin-top:4px;">Status: <span style="font-weight:800;color:#059669;">${voucher.status}</span></div>
      </div>
    </div>

    <div style="background:#f1f5f9;border:2px solid #0f172a;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#475569;">Total Amount Disbursed / Paid</div>
      <div style="font-size:32px;font-weight:900;color:#0f172a;margin-top:4px;">${formatCurrency(voucher.amount, currency)}</div>
    </div>

    ${renderAmountInWords(voucher.amount, 'Amount Disbursed in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Prepared By', subtitle: 'Accounts Desk', name: 'Billing Clerk' },
      { title: 'Payee Signature', subtitle: 'Amount Received By', name: voucher.payee },
      { title: 'Accounts Officer', subtitle: 'Finance Wing', name: 'Internal Audit' },
      { title: 'Executive Approval', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Payment Voucher • ${settings.companyName}</span>
      <span>${settings.printNotesFooter || 'Forwarding ERP Automated Accounting • Validated Commercial Voucher'}</span>
    </div>
  </div>
</body>
</html>`;
}

export interface PaymentReceiptData {
  receiptNumber: string;
  receiptDate: string;
  receivedFrom: string;
  tripNumber?: string;
  biltyNumber?: string;
  vehicleNumber?: string;
  route?: string;
  cargoDescription?: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  towardsParticulars: string;
  totalFreightAmount?: number;
  remainingBalance?: number;
  notes?: string;
}

export function generatePaymentReceiptHtml(
  data: PaymentReceiptData,
  settings: CompanySettings,
  currency: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.companyName} - Official Payment Receipt - ${data.receiptNumber}</title>
  ${commonStyles}
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="document-container">
    ${renderHeader(settings, 'OFFICIAL PAYMENT RECEIPT', [
      { label: 'Receipt #', value: data.receiptNumber, color: '#059669' },
      { label: 'Receipt Date', value: data.receiptDate },
      { label: 'Payment Method', value: data.paymentMethod },
    ])}

    <div class="grid-2">
      <div class="info-box">
        <div class="info-box-title">RECEIVED WITH THANKS FROM:</div>
        <div style="font-size:16px;font-weight:900;color:#0f172a;">${data.receivedFrom}</div>
        <div style="font-size:12px;color:#475569;margin-top:4px;">
          Towards: <strong>${data.towardsParticulars}</strong>
        </div>
        ${data.referenceNumber ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">Cheque / Trans Ref: ${data.referenceNumber}</div>` : ''}
      </div>

      <div class="info-box">
        <div class="info-box-title">FREIGHT & CONSIGNMENT PARTICULARS:</div>
        ${data.tripNumber ? `<div><strong>Trip #:</strong> ${data.tripNumber}</div>` : ''}
        ${data.biltyNumber ? `<div><strong>Bilty (LR) #:</strong> ${data.biltyNumber}</div>` : ''}
        ${data.vehicleNumber ? `<div><strong>Vehicle Fleet #:</strong> ${data.vehicleNumber}</div>` : ''}
        ${data.route ? `<div><strong>Route:</strong> ${data.route}</div>` : ''}
        ${data.cargoDescription ? `<div><strong>Consignment Cargo:</strong> ${data.cargoDescription}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Transaction Particulars</th>
          <th class="text-center">Mode of Receipt</th>
          <th class="text-right">Total Freight Due</th>
          <th class="text-right">Amount Received</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${data.towardsParticulars}</strong>
            <div style="font-size:11px;color:#64748b;">${data.tripNumber ? `Consignment Ref: ${data.tripNumber}` : 'General Freight Settlement'}</div>
          </td>
          <td class="text-center font-bold text-blue-700">${data.paymentMethod}</td>
          <td class="text-right font-medium text-slate-700">${data.totalFreightAmount !== undefined ? formatCurrency(data.totalFreightAmount, currency) : '-'}</td>
          <td class="text-right font-black text-emerald-600" style="font-size:15px;">${formatCurrency(data.amount, currency)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3" class="text-right">TOTAL AMOUNT RECEIVED:</td>
          <td class="text-right" style="font-size:15px;font-weight:900;color:#059669;">${formatCurrency(data.amount, currency)}</td>
        </tr>
        ${data.remainingBalance !== undefined ? `
        <tr class="net-due-row">
          <td colspan="3" class="text-right">Remaining Balance Payable:</td>
          <td class="text-right" style="color:${data.remainingBalance > 0 ? '#f59e0b' : '#34d399'};">${formatCurrency(data.remainingBalance, currency)}</td>
        </tr>` : ''}
      </tfoot>
    </table>

    ${renderAmountInWords(data.amount, 'Amount Received in Words')}

    ${settings.bankDetailsForInvoice ? `
    <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;margin:16px 0;font-size:11px;color:#334155;">
      <strong>Bank Remittance / Deposit Account:</strong> ${settings.bankDetailsForInvoice}
    </div>` : ''}

    ${data.notes ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:16px 0;font-size:11px;color:#475569;">
      <strong>Payment Particulars &amp; Notes:</strong> ${data.notes}
    </div>` : ''}

    ${renderOfficialSignatures(settings, [
      { title: 'Customer / Depositor', subtitle: 'Signature & Official Stamp', name: data.receivedFrom },
      { title: 'Cashier / Accountant', subtitle: 'Accounts & Treasury', name: 'Finance Wing' },
      { title: 'Authorized Carrier Approval', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Payment Receipt • ${settings.companyName}</span>
      <span>${settings.printNotesFooter || 'Generated by Forwarding ERP • Authenticated Commercial Transport Document'}</span>
    </div>
  </div>
</body>
</html>`;
}

export function generateOfflineErpAppHtml(state: ERPDatabaseState): string {
  const currency = state.settings.currencySymbol || 'PKR';
  const logoUrl = state.settings.logoUrl || DEFAULT_LOGO;
  const dataJson = JSON.stringify(state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.settings.companyName} - Offline Portable ERP & Accounting Portal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.45;
    }
    .top-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      background: #fff;
      border-radius: 8px;
      padding: 3px;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-tag {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 700;
    }
    .offline-badge {
      background: #059669;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-tabs {
      background: #1e293b;
      display: flex;
      overflow-x: auto;
      padding: 0 16px;
    }
    .tab-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      padding: 12px 18px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #f8fafc; }
    .tab-btn.active {
      color: #38bdf8;
      border-bottom-color: #38bdf8;
      background: rgba(255,255,255,0.05);
    }
    .main-wrap {
      max-width: 1300px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      margin-bottom: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 16px;
      border-left: 4px solid #2563eb;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
    }
    .stat-val {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 4px;
    }
    .search-bar {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:hover td { background: #f8fafc; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .btn-action {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-action:hover { background: #1e293b; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 800; }
    @media print {
      .top-bar, .nav-tabs, .search-bar, .no-print { display: none !important; }
      body { background: #fff; padding: 0; }
      .main-wrap { max-width: 100%; padding: 0; margin: 0; }
      .card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-wrap">
      <img src="${logoUrl}" alt="Logo" class="logo-img" />
      <div>
        <div class="brand-name">${state.settings.companyName}</div>
        <div class="brand-tag">${state.settings.tagline} • Standalone Offline ERP</div>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:12px;">
      <div class="offline-badge">
        <span>●</span>
        <span>OFFLINE STANDALONE PORTAL</span>
      </div>
      <button onclick="window.print()" class="btn-action" style="background:#2563eb;padding:7px 14px;font-size:12px;">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <nav class="nav-tabs no-print">
    <button class="tab-btn active" onclick="switchTab('trips')">🚚 Trips Register (${state.trips.length})</button>
    <button class="tab-btn" onclick="switchTab('invoices')">🧾 Invoices & Billing (${state.invoices.length})</button>
    <button class="tab-btn" onclick="switchTab('ledgers')">📊 Customer Ledgers (${state.customers.length})</button>
    <button class="tab-btn" onclick="switchTab('cashbank')">🏦 Cash & Bank Book</button>
    <button class="tab-btn" onclick="switchTab('suppliers')">🏢 Suppliers / Payables (${state.suppliers.length})</button>
    <button class="tab-btn" onclick="switchTab('fleet')">🚛 Fleet & Drivers</button>
  </nav>

  <div class="main-wrap">
    <!-- TRIPS TAB -->
    <div id="tab-trips" class="tab-content">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:16px;font-weight:900;">All Trips & Consignment Dispatches</h2>
          <span style="font-size:12px;color:#64748b;">Total: <strong>${state.trips.length}</strong> Entries</span>
        </div>
        <input type="text" id="tripSearch" class="search-bar no-print" placeholder="Search by Trip #, Bilty #, Customer, Cargo, Driver, Location..." onkeyup="filterTrips()" />
        <div style="overflow-x:auto;">
          <table id="tripsTable">
            <thead>
              <tr>
                <th>Trip # &amp; Date</th>
                <th>Bilty #</th>
                <th>Customer</th>
                <th>Vehicle &amp; Driver</th>
                <th>Route</th>
                <th>Cargo Details</th>
                <th class="text-right">Total Freight</th>
                <th class="text-right">Advance</th>
                <th class="text-right">Net Profit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.trips.map(t => `
              <tr>
                <td><strong>${t.tripNumber}</strong><br><span style="color:#64748b;font-size:10px;">${t.tripDate}</span></td>
                <td><span style="font-family:monospace;font-weight:700;">${t.bdNumber}</span></td>
                <td><strong>${t.customerCompanyName}</strong></td>
                <td>${t.vehicleNumber}<br><span style="color:#64748b;font-size:10px;">${t.driverName}</span></td>
                <td>${t.startingLocation} ➔ ${t.destinationLocation}</td>
                <td>${t.goodsDescription} (${t.goodsQuantity} ${t.quantityUnit})</td>
                <td class="text-right font-bold">${formatCurrency(t.totalFreightAmount, currency)}</td>
                <td class="text-right" style="color:#059669;">${formatCurrency(t.advanceReceived, currency)}</td>
                <td class="text-right font-bold" style="color:${(t.financials?.netTripProfit || 0) >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(t.financials?.netTripProfit || 0, currency)}</td>
                <td><span class="badge ${t.status === 'Completed' || t.status === 'Delivered' ? 'badge-green' : t.status === 'Cancelled' ? 'badge-red' : 'badge-blue'}">${t.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- INVOICES TAB -->
    <div id="tab-invoices" class="tab-content" style="display:none;">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:16px;font-weight:900;">Customer Freight Tax Invoices</h2>
          <span style="font-size:12px;color:#64748b;">Total: <strong>${state.invoices.length}</strong> Invoices</span>
        </div>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Invoice # &amp; Date</th>
                <th>Customer</th>
                <th>Trip &amp; Vehicle</th>
                <th>Cargo Description</th>
                <th class="text-right">Gross Amount</th>
                <th class="text-right">Amount Received</th>
                <th class="text-right">Balance Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.invoices.map(i => `
              <tr>
                <td><strong>${i.invoiceNumber}</strong><br><span style="color:#64748b;font-size:10px;">${i.invoiceDate}</span></td>
                <td><strong>${i.customerName}</strong></td>
                <td>${i.tripNumber} (${i.vehicleNumber})</td>
                <td>${i.goodsDescription} (${i.quantity} ${i.quantityUnit})</td>
                <td class="text-right font-bold">${formatCurrency(i.totalInvoiceAmount, currency)}</td>
                <td class="text-right" style="color:#059669;">${formatCurrency(i.amountReceived, currency)}</td>
                <td class="text-right font-bold" style="color:${i.remainingBalance > 0 ? '#2563eb' : '#64748b'};">${formatCurrency(i.remainingBalance, currency)}</td>
                <td><span class="badge ${i.paymentStatus === 'Paid' ? 'badge-green' : i.paymentStatus === 'Partially Paid' ? 'badge-blue' : 'badge-amber'}">${i.paymentStatus}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUPPLIERS TAB -->
    <div id="tab-suppliers" class="tab-content" style="display:none;">
      <div class="card">
        <h2 style="font-size:16px;font-weight:900;margin-bottom:16px;">Suppliers &amp; Accounts Payable</h2>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Mobile Number</th>
                <th>Highway Location / Address</th>
                <th>Payment Terms</th>
                <th class="text-right">Current Payable Balance</th>
              </tr>
            </thead>
            <tbody>
              ${state.suppliers.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.contactPerson}</td>
                <td>${s.mobileNumber}</td>
                <td>${s.address}</td>
                <td><span class="badge badge-blue">${s.paymentTerms}</span></td>
                <td class="text-right font-bold" style="color:#dc2626;font-size:14px;">${formatCurrency(s.currentBalance, currency)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CASH & BANK TAB -->
    <div id="tab-cashbank" class="tab-content" style="display:none;">
      <div class="stats-grid">
        ${state.accounts.map(acc => `
        <div class="stat-card" style="border-left-color:${acc.accountType === 'Cash in Hand' ? '#059669' : '#2563eb'};">
          <div class="stat-label">${acc.accountType}</div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">${acc.accountName}</div>
          <div class="stat-val">${formatCurrency(acc.currentBalance, currency)}</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <h2 style="font-size:16px;font-weight:900;margin-bottom:16px;">Cash &amp; Bank Transaction Logs</h2>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Voucher # &amp; Date</th>
                <th>Account</th>
                <th>Transaction Type</th>
                <th>Party / Payee</th>
                <th>Description</th>
                <th class="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.transactions.map(tx => `
              <tr>
                <td><strong>${tx.voucherNumber}</strong><br><span style="color:#64748b;font-size:10px;">${tx.date}</span></td>
                <td><strong>${tx.accountName}</strong></td>
                <td><span class="badge ${tx.transactionType.includes('Receipt') ? 'badge-green' : 'badge-amber'}">${tx.transactionType}</span></td>
                <td>${tx.partyName || '-'}</td>
                <td>${tx.description}</td>
                <td class="text-right font-bold" style="color:${tx.transactionType.includes('Receipt') ? '#059669' : '#dc2626'};">${formatCurrency(tx.amount, currency)}</td>
                <td><span class="badge badge-green">${tx.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FLEET TAB -->
    <div id="tab-fleet" class="tab-content" style="display:none;">
      <div class="card">
        <h2 style="font-size:16px;font-weight:900;margin-bottom:16px;">Fleet Register (${state.vehicles.length} Prime Movers &amp; Trailers)</h2>
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle Name / Model</th>
                <th>Body Type</th>
                <th>Payload Capacity</th>
                <th>Assigned Driver</th>
                <th>Ownership</th>
                <th>Fitness Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.vehicles.map(v => `
              <tr>
                <td><strong>${v.vehicleNumber}</strong></td>
                <td>${v.name}</td>
                <td>${v.vehicleType}</td>
                <td>${v.sizeCapacity}</td>
                <td>${v.assignedDriverName || '-'}</td>
                <td><span class="badge badge-blue">${v.ownership}</span></td>
                <td>${v.fitnessCertificateExpiryDate}</td>
                <td><span class="badge ${v.status === 'On Trip' ? 'badge-blue' : v.status === 'Available' ? 'badge-green' : 'badge-amber'}">${v.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    const DB = ${dataJson};

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeEl = document.getElementById('tab-' + tabId);
      if (activeEl) activeEl.style.display = 'block';
      event.currentTarget.classList.add('active');
    }

    function filterTrips() {
      const q = document.getElementById('tripSearch').value.toLowerCase();
      const rows = document.querySelectorAll('#tripsTable tbody tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

// ==========================================
// TRIP SHEET IN PDF / PRINT (ONE BY ONE)
// ==========================================
export function generateTripSheetPdfHtml(
  trips: Trip[],
  filters: {
    customerName?: string;
    vehicleNumber?: string;
    biltyNumber?: string;
    dateRange?: string;
  },
  settings: CompanySettings,
  currency: string
): string {
  const printDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalRevenue = trips.reduce((acc, t) => acc + (t.totalFreightAmount || 0), 0);
  const totalCosts = trips.reduce((acc, t) => acc + (t.financials?.totalTripExpenses || 0), 0);
  const totalProfit = trips.reduce((acc, t) => acc + (t.financials?.netTripProfit || 0), 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Trip Sheets Detailed - ${settings.companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      padding: 24px;
      font-size: 12px;
      line-height: 1.45;
    }
    .no-print-bar {
      max-width: 960px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
    }
    .print-btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .print-btn:hover { background: #1d4ed8; }
    .trip-page {
      max-width: 960px;
      margin: 0 auto 30px auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      page-break-after: always;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 3px;
    }
    .company-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .company-tagline {
      font-size: 11px;
      color: #2563eb;
      font-weight: 700;
      text-transform: uppercase;
    }
    .company-meta {
      font-size: 10px;
      color: #64748b;
      margin-top: 3px;
    }
    .doc-badge {
      text-align: right;
    }
    .badge-title {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 6px 14px;
      font-weight: 800;
      font-size: 12px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .info-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .financials-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .fin-header {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 14px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
    }
    .fin-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
    }
    .fin-row:nth-child(even) { background: #f8fafc; }
    .fin-row.total {
      background: #f1f5f9;
      font-weight: 800;
      border-top: 1px solid #cbd5e1;
      border-bottom: none;
    }
    .profit-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 13px;
    }
    .profit-green { background: #dcfce7; color: #15803d; }
    .profit-red { background: #fee2e2; color: #b91c1c; }
    .sign-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 35px;
      padding-top: 15px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
    }
    .sign-line {
      border-top: 1px solid #64748b;
      margin-bottom: 4px;
    }
    .sign-title {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .no-print-bar { display: none; }
      .trip-page {
        box-shadow: none;
        border: none;
        padding: 20px 0;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong style="font-size:14px;">Trip Sheets Report (${trips.length} Trips)</strong>
      <div style="font-size:11px;opacity:0.85;">
        ${filters.customerName ? 'Customer: ' + filters.customerName + ' | ' : ''}
        ${filters.vehicleNumber ? 'Vehicle: ' + filters.vehicleNumber + ' | ' : ''}
        ${filters.biltyNumber ? 'Bilty/GR: ' + filters.biltyNumber + ' | ' : ''}
        ${filters.dateRange ? 'Date Range: ' + filters.dateRange + ' | ' : ''}
        Printed: ${printDate}
      </div>
    </div>
    <div>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>

  ${trips.map((trip, idx) => {
    const f = trip.financials || {
      grossFreightRevenue: trip.totalFreightAmount || 0,
      fuelExpenses: 0,
      driverAllowance: 0,
      tollTaxes: 0,
      loadingCharges: 0,
      unloadingCharges: 0,
      roadTaxes: 0,
      vehicleRepairMaintenance: 0,
      parkingCharges: 0,
      foodAccommodation: 0,
      routeOtherExpenses: 0,
      totalTripExpenses: 0,
      netTripProfit: trip.totalFreightAmount || 0,
      profitMarginPercentage: 100,
    };
    const isProfit = (f.netTripProfit || 0) >= 0;

    return `
  <div class="trip-page">
    <div class="header">
      <div class="brand-section">
        <img src="${settings.logoUrl || DEFAULT_LOGO}" alt="Logo" class="logo-img" />
        <div>
          <h1 class="company-title">${settings.companyName}</h1>
          <div class="company-tagline">${settings.tagline}</div>
          <div class="company-meta">${settings.address}, ${settings.cityCountry} | NTN: ${settings.taxRegistrationNumber}</div>
        </div>
      </div>
      <div class="doc-badge">
        <div class="badge-title">OFFICIAL TRIP SHEET</div>
        <div style="font-size:13px;font-weight:900;color:#0f172a;margin-top:5px;">Trip #${trip.tripNumber}</div>
        <div style="font-size:10px;color:#64748b;">Date: ${trip.tripDate} | Sheet ${idx + 1} of ${trips.length}</div>
      </div>
    </div>

    <!-- TRIP BASICS -->
    <div class="grid-3">
      <div class="info-card">
        <div class="info-label">Customer / Consignor</div>
        <div class="info-value">${trip.customerCompanyName}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">Bilty / GR #: <strong>${trip.bdNumber || 'N/A'}</strong></div>
      </div>
      <div class="info-card">
        <div class="info-label">Route &amp; Transit</div>
        <div class="info-value">${trip.startingLocation} ➔ ${trip.destinationLocation}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">Status: <strong>${trip.status}</strong></div>
      </div>
      <div class="info-card">
        <div class="info-label">Assigned Vehicle &amp; Driver</div>
        <div class="info-value">${trip.vehicleNumber} (${trip.vehicleType})</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">Driver: ${trip.driverName} | ${trip.driverContactNumber}</div>
      </div>
    </div>

    <!-- GOODS & FREIGHT RATE -->
    <div class="grid-2">
      <div class="info-card">
        <div class="info-label">Cargo Description</div>
        <div class="info-value">${trip.goodsDescription}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">Quantity: <strong>${trip.goodsQuantity} ${trip.quantityUnit}</strong></div>
      </div>
      <div class="info-card">
        <div class="info-label">Freight Calculation &amp; Revenue</div>
        <div class="info-value" style="color:#2563eb;">${formatCurrency(trip.totalFreightAmount, currency)}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">Rate: ${formatCurrency(trip.freightRate, currency)} / ${trip.rateType} | Advance: ${formatCurrency(trip.advanceReceived, currency)}</div>
      </div>
    </div>

    <!-- DETAILED COSTS & NET PROFIT -->
    <div class="financials-box">
      <div class="fin-header">
        <span>Detailed Trip Costs &amp; Expense Breakdown</span>
        <span>Amount (${currency})</span>
      </div>

      ${(trip.tripExpenseItems && trip.tripExpenseItems.length > 0) ? `
        ${trip.tripExpenseItems.map(item => `
          <div class="fin-row">
            <span><strong>${item.name || item.category}</strong>${item.liters ? ` <em style="color:#1d4ed8;">[${item.liters} Liters]</em>` : ''} ${item.note ? ` <em style="color:#64748b;">(${item.note})</em>` : ''}</span>
            <span>${formatCurrency(item.amount, currency)}</span>
          </div>
        `).join('')}
      ` : `
        <div class="fin-row"><span>Fuel / Diesel (Route Consumption)</span><span>${formatCurrency(f.fuelExpenses || 0, currency)}</span></div>
        <div class="fin-row"><span>Driver Road Allowance / Per Diem</span><span>${formatCurrency(f.driverAllowance || 0, currency)}</span></div>
        <div class="fin-row"><span>Motorway &amp; Highway Toll Taxes</span><span>${formatCurrency(f.tollTaxes || 0, currency)}</span></div>
        <div class="fin-row"><span>Loading Charges (Pickup)</span><span>${formatCurrency(f.loadingCharges || 0, currency)}</span></div>
        <div class="fin-row"><span>Unloading Charges (Delivery)</span><span>${formatCurrency(f.unloadingCharges || 0, currency)}</span></div>
        <div class="fin-row"><span>Route Maintenance / Puncture / Repairs</span><span>${formatCurrency(f.vehicleRepairMaintenance || 0, currency)}</span></div>
        <div class="fin-row"><span>Taxes / Police / Gate Passes / Other Direct</span><span>${formatCurrency((f.roadTaxes || 0) + (f.parkingCharges || 0) + (f.foodAccommodation || 0) + (f.routeOtherExpenses || 0) + (f.otherDirectCosts || 0), currency)}</span></div>
      `}

      <div class="fin-row total" style="font-size:12px;">
        <span>TOTAL DIRECT TRIP EXPENSES</span>
        <span style="color:#dc2626;">${formatCurrency(f.totalTripExpenses || 0, currency)}</span>
      </div>

      <div class="fin-row" style="background:#f8fafc;padding:12px 14px;align-items:center;">
        <div>
          <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">NET TRIP PROFIT CALCULATION (Gross Freight - Total Costs)</div>
          <div style="font-size:10px;color:#64748b;">Profit Margin: <strong>${f.profitMarginPercentage ? Number(f.profitMarginPercentage).toFixed(1) : 0}%</strong></div>
        </div>
        <div>
          <span class="profit-pill ${isProfit ? 'profit-green' : 'profit-red'}">
            NET ${isProfit ? 'PROFIT' : 'LOSS'}: ${formatCurrency(Math.abs(f.netTripProfit || 0), currency)}
          </span>
        </div>
      </div>
    </div>

    <!-- SIGNATURES -->
    ${renderOfficialSignatures(settings, [
      { title: 'Fleet Driver', subtitle: 'Driver Acknowledgment', name: trip.driverName },
      { title: 'Dispatched & Checked By', subtitle: 'Operations Wing', name: 'Operations Desk' },
      { title: 'Carrier Authorization', isAuthorized: true },
    ])}
  </div>`;
  }).join('')}

</body>
</html>`;
}

// ==========================================
// PURCHASE BILL & REPORT PDF EXPORT
// ==========================================
export function generatePurchaseBillHtml(purchase: PurchaseItem, settings: CompanySettings, currency: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Purchase Bill - ${purchase.purchaseNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; padding: 30px; background: #f8fafc; color: #0f172a; font-size: 13px; }
    .doc-container { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 36px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 900; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="header">
      <div>
        <h1 class="title">${settings.companyName}</h1>
        <div style="color:#2563eb;font-weight:700;">WORKSHOP &amp; FLEET PROCUREMENT VOUCHER</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">${settings.address}, ${settings.cityCountry}</div>
      </div>
      <div style="text-align:right;">
        <div style="background:#0f172a;color:#fff;padding:6px 14px;border-radius:4px;font-weight:800;font-size:12px;display:inline-block;">PURCHASE BILL</div>
        <div style="font-size:14px;font-weight:900;margin-top:6px;">${purchase.purchaseNumber}</div>
        <div style="font-size:11px;color:#64748b;">Date: ${purchase.date}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
      <div style="background:#f8fafc;padding:14px;border-radius:6px;border:1px solid #e2e8f0;">
        <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">Supplier / Vendor Details</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;margin-top:4px;">${purchase.supplierName}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">Bill / Invoice Ref: <strong>${purchase.invoiceBillNumber || 'N/A'}</strong></div>
      </div>
      <div style="background:#f8fafc;padding:14px;border-radius:6px;border:1px solid #e2e8f0;">
        <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">Procurement Category &amp; Allocation</div>
        <div style="font-size:14px;font-weight:800;color:#0f172a;margin-top:4px;">Category: ${purchase.category}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">Allocated Fleet: <strong>${purchase.vehicleNumber || 'Terminal Bulk / Yard'}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align:center;">Quantity</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${purchase.itemName}</strong>
            <div style="font-size:11px;color:#64748b;margin-top:2px;">${purchase.remarks || ''}</div>
          </td>
          <td style="text-align:center;font-weight:700;">${purchase.quantity} ${purchase.unit}</td>
          <td style="text-align:right;">${formatCurrency(purchase.unitPrice, currency)}</td>
          <td style="text-align:right;font-weight:900;font-size:14px;">${formatCurrency(purchase.totalAmount, currency)}</td>
        </tr>
      </tbody>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:16px;border-radius:6px;border:1px solid #cbd5e1;">
      <div>
        <span class="badge ${purchase.paymentStatus === 'Paid' ? 'badge-green' : 'badge-amber'}">${purchase.paymentStatus} via ${purchase.paymentMethod}</span>
        ${purchase.remainingBalance > 0 ? `<div style="font-size:11px;color:#dc2626;font-weight:700;margin-top:4px;">Remaining Payable: ${formatCurrency(purchase.remainingBalance, currency)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">Grand Total</div>
        <div style="font-size:22px;font-weight:900;color:#0f172a;">${formatCurrency(purchase.totalAmount, currency)}</div>
      </div>
    </div>

    ${renderAmountInWords(purchase.totalAmount, 'Purchase Amount in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Received & Verified By', subtitle: 'Depot Store Incharge', name: 'Stores & Fuel Yard' },
      { title: 'Technical Supervisor', subtitle: 'Workshop Inspection', name: 'Maintenance Wing' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}
  </div>
</body>
</html>`;
}

export function generatePurchaseReportHtml(
  purchases: PurchaseItem[],
  periodLabel: string,
  settings: CompanySettings,
  currency: string
): string {
  const totalAmount = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPaid = purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalBalance = purchases.reduce((acc, p) => acc + (p.remainingBalance || 0), 0);

  // Group by Category
  const byCategory: Record<string, number> = {};
  purchases.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + p.totalAmount;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Purchases Report (${periodLabel}) - ${settings.companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; padding: 30px; background: #f8fafc; color: #0f172a; font-size: 12px; }
    .doc-container { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 900; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; padding: 9px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
    td { padding: 9px; border-bottom: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="header">
      <div>
        <h1 class="title">${settings.companyName}</h1>
        <div style="color:#2563eb;font-weight:700;">FLEET PURCHASES &amp; PROCUREMENT REPORT</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">Period: <strong>${periodLabel}</strong></div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:18px;font-weight:900;color:#0f172a;">${formatCurrency(totalAmount, currency)}</div>
        <div style="font-size:11px;color:#64748b;">Total Billed (${purchases.length} Items)</div>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;margin-bottom:20px;">
      ${Object.entries(byCategory).map(([cat, amt]) => `
        <div style="background:#f8fafc;padding:10px 12px;border:1px solid #e2e8f0;border-radius:6px;">
          <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;">${cat}</div>
          <div style="font-size:14px;font-weight:900;color:#0f172a;margin-top:2px;">${formatCurrency(amt, currency)}</div>
        </div>
      `).join('')}
    </div>

    <table>
      <thead>
        <tr>
          <th>Purchase # &amp; Date</th>
          <th>Category</th>
          <th>Item Name</th>
          <th>Supplier</th>
          <th>Vehicle</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Total Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${purchases.map(p => `
          <tr>
            <td><strong>${p.purchaseNumber}</strong><br><span style="font-size:10px;color:#64748b;">${p.date}</span></td>
            <td><span class="badge badge-blue">${p.category}</span></td>
            <td><strong>${p.itemName}</strong></td>
            <td>${p.supplierName}</td>
            <td>${p.vehicleNumber || 'Depot'}</td>
            <td style="text-align:center;">${p.quantity} ${p.unit}</td>
            <td style="text-align:right;font-weight:800;">${formatCurrency(p.totalAmount, currency)}</td>
            <td><span class="badge ${p.paymentStatus === 'Paid' ? 'badge-green' : 'badge-amber'}">${p.paymentStatus}</span></td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background:#f1f5f9;font-weight:900;">
          <td colspan="6" style="text-align:right;">TOTAL PURCHASES:</td>
          <td style="text-align:right;font-size:13px;">${formatCurrency(totalAmount, currency)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    ${renderAmountInWords(totalAmount, 'Total Procurement Amount in Words')}

    ${renderOfficialSignatures(settings, [
      { title: 'Workshop Store Incharge', subtitle: 'Inventory Verified', name: 'Procurement Wing' },
      { title: 'Internal Audit', subtitle: 'Vouchers Reconciled', name: 'Finance Department' },
      { title: 'Executive Authorization', isAuthorized: true },
    ])}

    <div class="doc-footer">
      <span>Official Fleet Procurement Report • ${settings.companyName}</span>
      <span>${settings.printNotesFooter || 'Workshop & Depot Inventory Division'}</span>
    </div>
  </div>
</body>
</html>`;
}


