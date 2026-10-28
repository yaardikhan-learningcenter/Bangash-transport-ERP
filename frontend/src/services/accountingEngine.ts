/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ERPDatabaseState,
  dbService,
} from './db';
import {
  CustomerLedgerEntry,
  DayBookEntry,
  Trip,
  Vehicle,
  Customer,
  Driver,
  Invoice,
  ExpenseVoucher,
  CashBankTransaction,
  Supplier,
  PurchaseItem,
} from '../types';

export type DateFilterPeriod = 'All Time' | 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export function getDateRangeFromPeriod(period: DateFilterPeriod, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  const format = (d: Date) => d.toISOString().substring(0, 10);

  if (period === 'All Time') {
    return { startDate: '2020-01-01', endDate: '2030-12-31' };
  }

  if (period === 'Custom' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  if (period === 'Today') {
    const todayStr = format(now);
    return { startDate: todayStr, endDate: todayStr };
  }

  if (period === 'This Week') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: format(monday), endDate: format(sunday) };
  }

  if (period === 'This Month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { startDate: format(firstDay), endDate: format(lastDay) };
  }

  if (period === 'This Year') {
    const year = now.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    return { startDate: format(firstDay), endDate: format(lastDay) };
  }

  return { startDate: '2026-01-01', endDate: '2026-12-31' };
}

export function isDateInRange(dateStr: string, range: DateRange): boolean {
  if (!dateStr) return false;
  const d = dateStr.substring(0, 10);
  return d >= range.startDate && d <= range.endDate;
}

// Format Currency
export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Convert numerical amount to formal currency words (Lakh / Crore standard)
export function amountToWords(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) {
    return 'Zero Rupees Only';
  }

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (hundred > 0) {
      res += units[hundred] + ' Hundred';
      if (rem > 0) res += ' and ';
    }
    if (rem > 0) {
      res += convertTwoDigits(rem);
    }
    return res;
  }

  const rounded = Math.round(Math.abs(amount));
  let remaining = rounded;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  let words = '';
  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remaining > 0) words += convertThreeDigits(remaining);

  return (words.trim() ? words.trim() : 'Zero') + ' Rupees Only';
}

// --- CUSTOMER LEDGER GENERATOR ---
export interface CustomerLedgerResult {
  customer: Customer;
  openingBalance: number;
  entries: CustomerLedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export function generateCustomerLedger(
  customerId: string,
  dateRange: DateRange
): CustomerLedgerResult | null {
  const state = dbService.getState();
  const customer = state.customers.find((c) => c.id === customerId);
  if (!customer) return null;

  // Compute opening balance before startDate
  let priorDebits = 0;
  let priorCredits = 0;

  // Invoices before startDate
  state.invoices
    .filter((inv) => inv.customerId === customerId && inv.paymentStatus !== 'Cancelled')
    .forEach((inv) => {
      if (inv.invoiceDate < dateRange.startDate) {
        priorDebits += inv.totalInvoiceAmount;
      }
    });

  // Receipts / Advances before startDate
  state.transactions
    .filter((t) => t.partyId === customerId && t.status === 'Posted' && t.transactionType.includes('Receipt'))
    .forEach((t) => {
      if (t.date < dateRange.startDate) {
        priorCredits += t.amount;
      }
    });

  const baseOpening =
    customer.openingBalanceType === 'Receivable' ? customer.openingBalance : -customer.openingBalance;
  const computedOpeningBalance = baseOpening + priorDebits - priorCredits;

  // Gather period records
  const rawEvents: Array<{
    date: string;
    type: CustomerLedgerEntry['transactionType'];
    voucherNumber: string;
    tripNumber?: string;
    invoiceNumber?: string;
    description: string;
    debit: number;
    credit: number;
  }> = [];

  // Invoices in range
  state.invoices
    .filter((inv) => inv.customerId === customerId && inv.paymentStatus !== 'Cancelled')
    .forEach((inv) => {
      if (isDateInRange(inv.invoiceDate, dateRange)) {
        rawEvents.push({
          date: inv.invoiceDate,
          type: 'Freight Invoice',
          voucherNumber: inv.invoiceNumber,
          tripNumber: inv.tripNumber,
          invoiceNumber: inv.invoiceNumber,
          description: `Freight invoice for ${inv.goodsDescription} (${inv.quantity} ${inv.quantityUnit})`,
          debit: inv.totalInvoiceAmount,
          credit: 0,
        });
      }
    });

  // Payments / Receipts in range
  state.transactions
    .filter((t) => t.partyId === customerId && t.status === 'Posted' && t.transactionType.includes('Receipt'))
    .forEach((t) => {
      if (isDateInRange(t.date, dateRange)) {
        rawEvents.push({
          date: t.date,
          type: 'Customer Receipt',
          voucherNumber: t.voucherNumber,
          tripNumber: t.tripNumber,
          invoiceNumber: t.invoiceNumber,
          description: t.description,
          debit: 0,
          credit: t.amount,
        });
      }
    });

  // Sort chronologically
  rawEvents.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  let running = computedOpeningBalance;
  let totalDebit = 0;
  let totalCredit = 0;

  const entries: CustomerLedgerEntry[] = rawEvents.map((ev, idx) => {
    running = running + ev.debit - ev.credit;
    totalDebit += ev.debit;
    totalCredit += ev.credit;
    return {
      id: `c-led-${idx}-${ev.voucherNumber}`,
      date: ev.date,
      transactionType: ev.type,
      voucherNumber: ev.voucherNumber,
      tripNumber: ev.tripNumber,
      invoiceNumber: ev.invoiceNumber,
      description: ev.description,
      debit: ev.debit,
      credit: ev.credit,
      runningBalance: running,
    };
  });

  return {
    customer,
    openingBalance: computedOpeningBalance,
    entries,
    totalDebit,
    totalCredit,
    closingBalance: running,
  };
}

// --- SUPPLIER / PARTY LEDGER GENERATOR ---
export interface SupplierLedgerEntry {
  id: string;
  date: string;
  voucherNumber: string;
  transactionType: string;
  category?: string;
  description: string;
  referenceNumber?: string;
  debit: number; // Payment made to supplier (decreases payable)
  credit: number; // Bill / purchase from supplier (increases payable)
  runningBalance: number;
}

export interface SupplierLedgerResult {
  supplier: Supplier;
  openingBalance: number;
  entries: SupplierLedgerEntry[];
  totalDebit: number; // Total payments disbursed
  totalCredit: number; // Total purchases / bills
  closingBalance: number; // Current payable due
  dateRange: DateRange;
  periodLabel: string;
}

export function generateSupplierLedger(
  supplierId: string,
  dateRange: DateRange,
  periodLabel: string = 'Custom Period'
): SupplierLedgerResult | null {
  const state = dbService.getState();
  const supplier = state.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return null;

  const supNameLower = supplier.name.toLowerCase().trim();

  // All purchases for this supplier
  const allPurchases = (state.purchases || []).filter(
    (p) =>
      p.supplierId === supplierId ||
      (p.supplierName && p.supplierName.toLowerCase().trim() === supNameLower)
  );

  // All expense vouchers for this supplier
  const allVouchers = (state.expenseVouchers || []).filter(
    (v) =>
      v.payee &&
      v.payee.toLowerCase().trim() === supNameLower &&
      v.status === 'Posted'
  );

  // All cash & bank transactions for this supplier
  const allTransactions = (state.transactions || []).filter(
    (t) =>
      t.status === 'Posted' &&
      (t.partyId === supplierId ||
        (t.partyName && t.partyName.toLowerCase().trim() === supNameLower))
  );

  interface RawSupplierEvent {
    id: string;
    date: string;
    voucherNumber: string;
    type: string;
    category?: string;
    description: string;
    referenceNumber?: string;
    debit: number;
    credit: number;
  }

  const allEvents: RawSupplierEvent[] = [];

  // 1. Purchases (Bill amount increases payable -> Credit)
  allPurchases.forEach((p) => {
    allEvents.push({
      id: `pur-${p.id}`,
      date: p.date,
      voucherNumber: p.purchaseNumber,
      type: `Purchase (${p.category})`,
      category: p.category,
      description: `${p.itemName} (${p.quantity} ${p.unit} @ ${formatCurrency(p.unitPrice, 'PKR')})${
        p.vehicleNumber ? ' • Vehicle: ' + p.vehicleNumber : ''
      }${p.remarks ? ' • ' + p.remarks : ''}`,
      referenceNumber: p.invoiceBillNumber || p.purchaseNumber,
      credit: p.totalAmount,
      debit: 0,
    });
  });

  // 2. Expense Vouchers (Services, route bills, parts -> Credit)
  const purchaseRefNumbers = new Set(allPurchases.map((p) => p.purchaseNumber));
  allVouchers.forEach((v) => {
    if (purchaseRefNumbers.has(v.voucherNumber)) return;
    allEvents.push({
      id: `vch-${v.id}`,
      date: v.date,
      voucherNumber: v.voucherNumber,
      type: `Expense Bill (${v.categoryName})`,
      category: v.categoryName,
      description: `${v.expenseName || v.categoryName}: ${v.description || ''}${
        v.vehicleNumber ? ' • Vehicle: ' + v.vehicleNumber : ''
      }`,
      referenceNumber: v.referenceNumber || v.voucherNumber,
      credit: v.amount,
      debit: 0,
    });
  });

  // 3. Payments made to supplier (Cash/Bank Outflow -> Debit)
  allTransactions.forEach((tx) => {
    if (
      tx.transactionType.includes('Payment') ||
      tx.transactionType.includes('Advance') ||
      tx.transactionType === 'Expense Payment'
    ) {
      allEvents.push({
        id: `tx-${tx.id}`,
        date: tx.date,
        voucherNumber: tx.voucherNumber,
        type: tx.transactionType,
        category: 'Payment',
        description: `${tx.description} (Paid via ${tx.accountName})`,
        referenceNumber: tx.referenceNumber || tx.voucherNumber,
        credit: 0,
        debit: tx.amount,
      });
    }
  });

  // Sort events chronologically
  allEvents.sort((a, b) => a.date.localeCompare(b.date));

  // Compute opening balance before dateRange.startDate
  let priorCredit = 0;
  let priorDebit = 0;

  allEvents.forEach((ev) => {
    if (ev.date < dateRange.startDate) {
      priorCredit += ev.credit;
      priorDebit += ev.debit;
    }
  });

  const computedOpening = (supplier.openingBalance || 0) + priorCredit - priorDebit;

  // Filter events within dateRange
  const inRangeEvents = allEvents.filter((ev) => isDateInRange(ev.date, dateRange));

  let running = computedOpening;
  let totalCredit = 0;
  let totalDebit = 0;

  const entries: SupplierLedgerEntry[] = inRangeEvents.map((ev, idx) => {
    running = running + ev.credit - ev.debit;
    totalCredit += ev.credit;
    totalDebit += ev.debit;

    return {
      id: `sup-led-${idx}-${ev.voucherNumber}`,
      date: ev.date,
      voucherNumber: ev.voucherNumber,
      transactionType: ev.type,
      category: ev.category,
      description: ev.description,
      referenceNumber: ev.referenceNumber,
      credit: ev.credit,
      debit: ev.debit,
      runningBalance: running,
    };
  });

  return {
    supplier,
    openingBalance: computedOpening,
    entries,
    totalDebit,
    totalCredit,
    closingBalance: running,
    dateRange,
    periodLabel,
  };
}

// --- DAY BOOK REGISTER GENERATOR ---
export interface DayBookSummary {
  entries: DayBookEntry[];
  totalCashIn: number;
  totalCashOut: number;
  totalBankIn: number;
  totalBankOut: number;
  totalReceipts: number;
  totalPayments: number;
  closingCash: number;
  closingBank: number;
}

export function generateDayBook(dateRange: DateRange): DayBookSummary {
  const state = dbService.getState();
  const rawList: Array<Omit<DayBookEntry, 'id' | 'runningCashBalance' | 'runningBankBalance'>> = [];

  // Opening balances of cash and bank accounts before start date
  let priorCash = 0;
  let priorBank = 0;

  state.accounts.forEach((acc) => {
    if (acc.accountType === 'Cash in Hand' || acc.accountType === 'Petty Cash') {
      priorCash += acc.openingBalance;
    } else {
      priorBank += acc.openingBalance;
    }
  });

  // Transactions before range
  state.transactions
    .filter((tx) => tx.status === 'Posted' && tx.date < dateRange.startDate)
    .forEach((tx) => {
      const srcAcc = state.accounts.find((a) => a.id === tx.accountId);
      const isSrcCash = srcAcc?.accountType === 'Cash in Hand' || srcAcc?.accountType === 'Petty Cash';

      if (tx.transactionType === 'Customer Receipt' || tx.transactionType === 'Cash Receipt' || tx.transactionType === 'Bank Receipt') {
        if (isSrcCash) priorCash += tx.amount;
        else priorBank += tx.amount;
      } else if (tx.transactionType.includes('Transfer') && tx.targetAccountId) {
        const destAcc = state.accounts.find((a) => a.id === tx.targetAccountId);
        const isDestCash = destAcc?.accountType === 'Cash in Hand' || destAcc?.accountType === 'Petty Cash';
        if (isSrcCash && !isDestCash) {
          priorCash -= tx.amount;
          priorBank += tx.amount;
        } else if (!isSrcCash && isDestCash) {
          priorBank -= tx.amount;
          priorCash += tx.amount;
        }
      } else {
        // Payment
        if (isSrcCash) priorCash -= tx.amount;
        else priorBank -= tx.amount;
      }
    });

  // 1. Transactions in range
  state.transactions
    .filter((tx) => tx.status === 'Posted' && isDateInRange(tx.date, dateRange))
    .forEach((tx) => {
      const srcAcc = state.accounts.find((a) => a.id === tx.accountId);
      const isSrcCash = srcAcc?.accountType === 'Cash in Hand' || srcAcc?.accountType === 'Petty Cash';

      let cashIn = 0;
      let cashOut = 0;
      let bankIn = 0;
      let bankOut = 0;

      if (tx.transactionType === 'Cash-to-Bank Transfer') {
        cashOut = tx.amount;
        bankIn = tx.amount;
      } else if (tx.transactionType === 'Bank-to-Cash Transfer') {
        bankOut = tx.amount;
        cashIn = tx.amount;
      } else if (tx.transactionType.includes('Receipt') || tx.transactionType === 'Opening Balance') {
        if (isSrcCash) cashIn = tx.amount;
        else bankIn = tx.amount;
      } else {
        // Payment / Advance / Expense
        if (isSrcCash) cashOut = tx.amount;
        else bankOut = tx.amount;
      }

      rawList.push({
        date: tx.date,
        voucherNumber: tx.voucherNumber,
        tripNumber: tx.tripNumber,
        transactionType: tx.transactionType,
        partyName: tx.partyName || srcAcc?.accountName || 'Cash/Bank',
        description: tx.description,
        cashIn,
        cashOut,
        bankIn,
        bankOut,
        debit: cashOut + bankOut,
        credit: cashIn + bankIn,
        postedBy: tx.postedBy,
        status: tx.status,
      });
    });

  // 2. Operational Trip entries (Clearly marked as operational with no cash impact)
  state.trips
    .filter((t) => isDateInRange(t.tripDate, dateRange) && t.status !== 'Cancelled')
    .forEach((t) => {
      rawList.push({
        date: t.tripDate,
        voucherNumber: t.tripNumber,
        tripNumber: t.tripNumber,
        transactionType: `Trip Dispatch (${t.status})`,
        partyName: t.customerCompanyName,
        vehicleNumber: t.vehicleNumber,
        description: `${t.goodsDescription} (${t.startingLocation} -> ${t.destinationLocation})`,
        cashIn: 0,
        cashOut: 0,
        bankIn: 0,
        bankOut: 0,
        debit: t.totalFreightAmount,
        credit: 0,
        postedBy: 'Operations',
        status: t.status,
        isOperationalOnly: true,
      });
    });

  // Sort by date then voucher
  rawList.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  let runningCash = priorCash;
  let runningBank = priorBank;
  let totalCashIn = 0;
  let totalCashOut = 0;
  let totalBankIn = 0;
  let totalBankOut = 0;

  const entries: DayBookEntry[] = rawList.map((item, idx) => {
    if (!item.isOperationalOnly) {
      runningCash = runningCash + item.cashIn - item.cashOut;
      runningBank = runningBank + item.bankIn - item.bankOut;
      totalCashIn += item.cashIn;
      totalCashOut += item.cashOut;
      totalBankIn += item.bankIn;
      totalBankOut += item.bankOut;
    }
    return {
      ...item,
      id: `db-${idx}-${item.voucherNumber}`,
      runningCashBalance: runningCash,
      runningBankBalance: runningBank,
    };
  });

  return {
    entries,
    totalCashIn,
    totalCashOut,
    totalBankIn,
    totalBankOut,
    totalReceipts: totalCashIn + totalBankIn,
    totalPayments: totalCashOut + totalBankOut,
    closingCash: runningCash,
    closingBank: runningBank,
  };
}

// --- PROFIT AND LOSS REPORT GENERATOR ---
export interface ProfitAndLossReport {
  period: DateRange;
  accountingBasis: 'Accrual' | 'Cash';
  income: {
    freightRevenue: number;
    additionalCharges: number;
    otherOperatingIncome: number;
    totalIncome: number;
  };
  directCosts: {
    fuel: number;
    loadingUnloading: number;
    driverAllowances: number;
    tollRoadTaxes: number;
    repairMaintenance: number;
    parkingFoodOther: number;
    totalDirectCosts: number;
  };
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: {
    salaries: number;
    officeRent: number;
    utilities: number;
    tyresOverhaul: number;
    bankCharges: number;
    misc: number;
    totalOperatingExpenses: number;
  };
  netProfit: number;
  netProfitMargin: number;
  tripWise: Array<{
    tripNumber: string;
    tripDate: string;
    customer: string;
    vehicleNumber: string;
    driverName: string;
    revenue: number;
    directExpenses: number;
    netProfit: number;
    margin: number;
    status: string;
  }>;
  vehicleWise: Array<{
    vehicleNumber: string;
    makeModel: string;
    ownership: string;
    tripCount: number;
    revenue: number;
    directCosts: number;
    profit: number;
    margin: number;
  }>;
  customerWise: Array<{
    customerName: string;
    tripCount: number;
    totalRevenue: number;
    directCosts: number;
    profit: number;
  }>;
}

export function generateProfitAndLoss(
  dateRange: DateRange,
  basis: 'Accrual' | 'Cash' = 'Accrual'
): ProfitAndLossReport {
  const state = dbService.getState();

  // Trips in date range
  const filteredTrips = state.trips.filter(
    (t) => isDateInRange(t.tripDate, dateRange) && t.status !== 'Cancelled'
  );

  // Invoices in range
  const filteredInvoices = state.invoices.filter(
    (inv) => isDateInRange(inv.invoiceDate, dateRange) && inv.paymentStatus !== 'Cancelled'
  );

  // Receipts in range (for Cash basis revenue)
  const filteredReceipts = state.transactions.filter(
    (tx) =>
      isDateInRange(tx.date, dateRange) &&
      tx.status === 'Posted' &&
      (tx.transactionType === 'Customer Receipt' || tx.transactionType === 'Cash Receipt' || tx.transactionType === 'Bank Receipt')
  );

  let freightRevenue = 0;
  let additionalCharges = 0;

  if (basis === 'Accrual') {
    // Under Accrual: Recognized freight from trips dispatched/invoiced in period
    filteredTrips.forEach((t) => {
      freightRevenue += t.totalFreightAmount;
    });
    filteredInvoices.forEach((inv) => {
      additionalCharges += (inv.loadingUnloadingCharges || 0) + (inv.additionalCharges || 0);
    });
  } else {
    // Cash basis: Only actual money collected
    filteredReceipts.forEach((r) => {
      freightRevenue += r.amount;
    });
  }

  const otherOperatingIncome = 0;
  const totalIncome = freightRevenue + additionalCharges + otherOperatingIncome;

  // Direct Trip Expenses
  let fuel = 0;
  let loadingUnloading = 0;
  let driverAllowances = 0;
  let tollRoadTaxes = 0;
  let repairMaintenance = 0;
  let parkingFoodOther = 0;

  // Operating Overheads
  let salaries = 0;
  let officeRent = 0;
  let utilities = 0;
  let tyresOverhaul = 0;
  let bankCharges = 0;
  let misc = 0;

  state.expenseVouchers
    .filter((v) => isDateInRange(v.date, dateRange) && v.status === 'Posted')
    .forEach((v) => {
      const cat = v.categoryName.toLowerCase();
      if (v.type === 'Direct Trip') {
        if (cat.includes('fuel') || cat.includes('diesel')) fuel += v.amount;
        else if (cat.includes('loading') || cat.includes('unloading')) loadingUnloading += v.amount;
        else if (cat.includes('allowance')) driverAllowances += v.amount;
        else if (cat.includes('toll') || cat.includes('road')) tollRoadTaxes += v.amount;
        else if (cat.includes('repair') || cat.includes('maintenance')) repairMaintenance += v.amount;
        else parkingFoodOther += v.amount;
      } else {
        if (cat.includes('salary') || cat.includes('payroll')) salaries += v.amount;
        else if (cat.includes('rent')) officeRent += v.amount;
        else if (cat.includes('utility') || cat.includes('electricity') || cat.includes('water')) utilities += v.amount;
        else if (cat.includes('tyre') || cat.includes('overhaul')) tyresOverhaul += v.amount;
        else if (cat.includes('bank') || cat.includes('commission')) bankCharges += v.amount;
        else misc += v.amount;
      }
    });

  // Also include estimated trip direct expenses if vouchers haven't been entered yet for planned/in-transit trips
  if (fuel === 0 && filteredTrips.length > 0) {
    filteredTrips.forEach((t) => {
      fuel += t.financials?.fuelExpenses || 0;
      loadingUnloading += (t.financials?.loadingCharges || 0) + (t.financials?.unloadingCharges || 0);
      driverAllowances += t.financials?.driverAllowance || 0;
      tollRoadTaxes += (t.financials?.tollTaxes || 0) + (t.financials?.roadTaxes || 0);
      repairMaintenance += t.financials?.vehicleRepairMaintenance || 0;
      parkingFoodOther +=
        (t.financials?.parkingCharges || 0) +
        (t.financials?.foodAccommodation || 0) +
        (t.financials?.otherDirectCosts || 0);
    });
  }

  const totalDirectCosts =
    fuel + loadingUnloading + driverAllowances + tollRoadTaxes + repairMaintenance + parkingFoodOther;
  const grossProfit = totalIncome - totalDirectCosts;
  const grossProfitMargin = totalIncome > 0 ? Number(((grossProfit / totalIncome) * 100).toFixed(2)) : 0;

  const totalOperatingExpenses =
    salaries + officeRent + utilities + tyresOverhaul + bankCharges + misc;
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(2)) : 0;

  // Trip-wise breakdown
  const tripWise = filteredTrips.map((t) => ({
    tripNumber: t.tripNumber,
    tripDate: t.tripDate,
    customer: t.customerCompanyName,
    vehicleNumber: t.vehicleNumber,
    driverName: t.driverName,
    revenue: t.totalFreightAmount,
    directExpenses: t.financials?.totalTripExpenses || 0,
    netProfit: t.financials?.netTripProfit || 0,
    margin: t.financials?.profitMarginPercentage || 0,
    status: t.status,
  }));

  // Vehicle-wise breakdown
  const vehicleMap: Record<
    string,
    { vehicleNumber: string; makeModel: string; ownership: string; tripCount: number; revenue: number; directCosts: number }
  > = {};

  state.vehicles.forEach((v) => {
    vehicleMap[v.vehicleNumber] = {
      vehicleNumber: v.vehicleNumber,
      makeModel: v.makeModel,
      ownership: v.ownership,
      tripCount: 0,
      revenue: 0,
      directCosts: 0,
    };
  });

  filteredTrips.forEach((t) => {
    if (!vehicleMap[t.vehicleNumber]) {
      vehicleMap[t.vehicleNumber] = {
        vehicleNumber: t.vehicleNumber,
        makeModel: t.vehicleType,
        ownership: 'Owned',
        tripCount: 0,
        revenue: 0,
        directCosts: 0,
      };
    }
    const item = vehicleMap[t.vehicleNumber];
    item.tripCount += 1;
    item.revenue += t.totalFreightAmount;
    item.directCosts += t.financials?.totalTripExpenses || 0;
  });

  const vehicleWise = Object.values(vehicleMap).map((vm) => {
    const profit = vm.revenue - vm.directCosts;
    const margin = vm.revenue > 0 ? Number(((profit / vm.revenue) * 100).toFixed(2)) : 0;
    return {
      ...vm,
      profit,
      margin,
    };
  });

  // Customer-wise breakdown
  const customerMap: Record<
    string,
    { customerName: string; tripCount: number; totalRevenue: number; directCosts: number }
  > = {};

  filteredTrips.forEach((t) => {
    if (!customerMap[t.customerCompanyName]) {
      customerMap[t.customerCompanyName] = {
        customerName: t.customerCompanyName,
        tripCount: 0,
        totalRevenue: 0,
        directCosts: 0,
      };
    }
    const c = customerMap[t.customerCompanyName];
    c.tripCount += 1;
    c.totalRevenue += t.totalFreightAmount;
    c.directCosts += t.financials?.totalTripExpenses || 0;
  });

  const customerWise = Object.values(customerMap).map((cm) => ({
    ...cm,
    profit: cm.totalRevenue - cm.directCosts,
  }));

  return {
    period: dateRange,
    accountingBasis: basis,
    income: {
      freightRevenue,
      additionalCharges,
      otherOperatingIncome,
      totalIncome,
    },
    directCosts: {
      fuel,
      loadingUnloading,
      driverAllowances,
      tollRoadTaxes,
      repairMaintenance,
      parkingFoodOther,
      totalDirectCosts,
    },
    grossProfit,
    grossProfitMargin,
    operatingExpenses: {
      salaries,
      officeRent,
      utilities,
      tyresOverhaul,
      bankCharges,
      misc,
      totalOperatingExpenses,
    },
    netProfit,
    netProfitMargin,
    tripWise,
    vehicleWise,
    customerWise,
  };
}

// --- DASHBOARD KPI AGGREGATOR ---
export interface DashboardKPIs {
  totalTrips: number;
  tripsInProgress: number;
  completedTrips: number;
  pendingDeliveries: number;
  pendingPODs: number;
  totalFreightRevenue: number;
  totalTripExpenses: number;
  totalTripProfit: number;
  profitMarginPercent: number;
  customerReceivables: number;
  supplierPayables: number;
  totalCashBalance: number;
  totalBankBalance: number;
  totalLiquidFunds: number;
  vehicleUtilizationPercent: number;
  activeVehicles: number;
  totalVehicles: number;
  expiringDocumentsCount: number;
}

export function computeDashboardKPIs(dateRange: DateRange): DashboardKPIs {
  const state = dbService.getState();

  const inRangeTrips = state.trips.filter(
    (t) => isDateInRange(t.tripDate, dateRange) && t.status !== 'Cancelled'
  );

  const totalTrips = inRangeTrips.length;
  const tripsInProgress = inRangeTrips.filter((t) => ['Dispatched', 'In Transit'].includes(t.status)).length;
  const completedTrips = inRangeTrips.filter((t) => ['Delivered', 'POD Received', 'Invoiced', 'Completed'].includes(t.status)).length;
  const pendingDeliveries = inRangeTrips.filter((t) => ['Planned', 'Dispatched', 'In Transit'].includes(t.status)).length;

  // Pending PODs are PODs in 'Generated' or 'Pending' or 'Rejected' state
  const pendingPODs = state.pods.filter((p) => p.status === 'Generated' || p.status === 'Pending').length;

  let totalFreightRevenue = 0;
  let totalTripExpenses = 0;

  inRangeTrips.forEach((t) => {
    totalFreightRevenue += t.totalFreightAmount || 0;
    totalTripExpenses += t.financials?.totalTripExpenses || 0;
  });

  const totalTripProfit = totalFreightRevenue - totalTripExpenses;
  const profitMarginPercent =
    totalFreightRevenue > 0 ? Number(((totalTripProfit / totalFreightRevenue) * 100).toFixed(2)) : 0;

  // Customer Receivables (Total unpaid/partially paid invoices + customer opening balances)
  let customerReceivables = 0;
  state.customers.forEach((c) => {
    if (c.openingBalanceType === 'Receivable') customerReceivables += c.openingBalance;
  });
  state.invoices.forEach((inv) => {
    if (inv.paymentStatus !== 'Cancelled' && inv.paymentStatus !== 'Paid') {
      customerReceivables += inv.remainingBalance;
    }
  });

  // Supplier Payables
  let supplierPayables = 0;
  state.suppliers.forEach((s) => {
    supplierPayables += s.currentBalance;
  });

  // Cash and Bank balances
  let totalCashBalance = 0;
  let totalBankBalance = 0;
  state.accounts.forEach((acc) => {
    if (acc.accountType === 'Cash in Hand' || acc.accountType === 'Petty Cash') {
      totalCashBalance += acc.currentBalance;
    } else {
      totalBankBalance += acc.currentBalance;
    }
  });

  const totalLiquidFunds = totalCashBalance + totalBankBalance;

  // Vehicle utilization
  const totalVehicles = state.vehicles.length;
  const activeVehicles = state.vehicles.filter((v) => v.status === 'On Trip').length;
  const vehicleUtilizationPercent =
    totalVehicles > 0 ? Number(((activeVehicles / totalVehicles) * 100).toFixed(1)) : 0;

  // Check document expiry (< 30 days)
  const today = new Date().toISOString().substring(0, 10);
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  let expiringDocumentsCount = 0;
  state.vehicles.forEach((v) => {
    if (v.fitnessCertificateExpiryDate && v.fitnessCertificateExpiryDate <= thirtyDaysLater) expiringDocumentsCount++;
    if (v.insuranceExpiryDate && v.insuranceExpiryDate <= thirtyDaysLater) expiringDocumentsCount++;
    if (v.registrationExpiryDate && v.registrationExpiryDate <= thirtyDaysLater) expiringDocumentsCount++;
  });

  return {
    totalTrips,
    tripsInProgress,
    completedTrips,
    pendingDeliveries,
    pendingPODs,
    totalFreightRevenue,
    totalTripExpenses,
    totalTripProfit,
    profitMarginPercent,
    customerReceivables,
    supplierPayables,
    totalCashBalance,
    totalBankBalance,
    totalLiquidFunds,
    vehicleUtilizationPercent,
    activeVehicles,
    totalVehicles,
    expiringDocumentsCount,
  };
}
