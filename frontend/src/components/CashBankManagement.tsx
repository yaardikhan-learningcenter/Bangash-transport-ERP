/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Building,
  Calendar,
  Printer,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { BankAccount, CashBankTransaction, AccountTransactionType } from '../types';
import {
  formatCurrency,
  DateFilterPeriod,
  DateRange,
  getDateRangeFromPeriod,
  isDateInRange,
} from '../services/accountingEngine';
import { dbService } from '../services/db';
import { downloadHtmlFile, generateReportHtml } from '../services/htmlExport';

interface CashBankManagementProps {
  accounts: BankAccount[];
  transactions: CashBankTransaction[];
  currency: string;
  /** true = the "Banks & Cash Accounts" page (account setup only, no ledger) */
  accountsMode?: boolean;
}

export const CashBankManagement: React.FC<CashBankManagementProps> = ({
  accounts,
  transactions,
  currency,
  accountsMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('All');

  // Time Period Filter State: Daily (Today), Weekly, Monthly, Custom (between 2 dates), Yearly, All
  const [period, setPeriod] = useState<DateFilterPeriod | 'All'>('This Month');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().substring(0, 10));

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(25000);
  const [transferReference, setTransferReference] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  // General Entry modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<AccountTransactionType>('Cash Receipt');
  const [entryAccountId, setEntryAccountId] = useState(accounts[0]?.id || '');
  const [entryAmount, setEntryAmount] = useState<number>(10000);
  const [entryPartyName, setEntryPartyName] = useState('');
  const [entryRef, setEntryRef] = useState('');
  const [entryDesc, setEntryDesc] = useState('');

  const totalCash = accounts
    .filter((a) => a.accountType === 'Cash in Hand' || a.accountType === 'Petty Cash')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalBank = accounts
    .filter((a) => a.accountType === 'Bank Account')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiquid = totalCash + totalBank;

  const dateRange: DateRange =
    period === 'All'
      ? { startDate: '1900-01-01', endDate: '2099-12-31' }
      : getDateRangeFromPeriod(period as DateFilterPeriod, customStartDate, customEndDate);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesAccount =
      selectedAccountId === 'All' ||
      tx.accountId === selectedAccountId ||
      tx.targetAccountId === selectedAccountId;
    const matchesDate = period === 'All' || isDateInRange(tx.date, dateRange);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      tx.voucherNumber.toLowerCase().includes(term) ||
      tx.transactionType.toLowerCase().includes(term) ||
      tx.description.toLowerCase().includes(term) ||
      (tx.partyName && tx.partyName.toLowerCase().includes(term));
    return matchesAccount && matchesDate && matchesSearch;
  });

  // Period flow metrics
  let periodInflows = 0;
  let periodOutflows = 0;
  filteredTransactions.forEach((tx) => {
    if (tx.transactionType.includes('Receipt') || tx.transactionType === 'Opening Balance') {
      periodInflows += tx.amount;
    } else if (tx.transactionType.includes('Payment') || tx.transactionType.includes('Expense')) {
      periodOutflows += tx.amount;
    }
  });
  const periodNetFlow = periodInflows - periodOutflows;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceAccountId === targetAccountId) {
      alert('Source and destination accounts must be distinct.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Transfer amount must be positive.');
      return;
    }

    const src = accounts.find((a) => a.id === sourceAccountId);
    const dest = accounts.find((a) => a.id === targetAccountId);
    if (!src || !dest) return;

    let transferType: AccountTransactionType = 'Bank-to-Bank Transfer';
    if (src.accountType === 'Cash in Hand' && dest.accountType === 'Bank Account') {
      transferType = 'Cash-to-Bank Transfer';
    } else if (src.accountType === 'Bank Account' && (dest.accountType === 'Cash in Hand' || dest.accountType === 'Petty Cash')) {
      transferType = 'Bank-to-Cash Transfer';
    }

    dbService.addCashBankTransaction({
      voucherNumber: dbService.generateNextVoucherNumber('TX-TRF-'),
      date: new Date().toISOString().substring(0, 10),
      transactionType: transferType,
      accountId: src.id,
      accountName: src.accountName,
      targetAccountId: dest.id,
      targetAccountName: dest.accountName,
      amount: transferAmount,
      referenceNumber: transferReference || `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      description: transferDesc || `Fund transfer from ${src.accountName} to ${dest.accountName}`,
      postedBy: 'Treasury Officer',
      status: 'Posted',
    });

    setIsTransferModalOpen(false);
  };

  const handleExecuteGeneralEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryAmount <= 0) return;

    const acc = accounts.find((a) => a.id === entryAccountId);
    if (!acc) return;

    dbService.addCashBankTransaction({
      voucherNumber: dbService.generateNextVoucherNumber('TX-ENT-'),
      date: new Date().toISOString().substring(0, 10),
      transactionType: entryType,
      accountId: acc.id,
      accountName: acc.accountName,
      amount: entryAmount,
      partyName: entryPartyName,
      referenceNumber: entryRef,
      description: entryDesc || `${entryType} posted to ${acc.accountName}`,
      postedBy: 'Cashier / Accountant',
      status: 'Posted',
    });

    setIsEntryModalOpen(false);
  };


  // Add / edit bank or cash account
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const emptyAccountForm = {
    accountType: 'Bank Account' as BankAccount['accountType'],
    accountName: '',
    bankName: '',
    accountNumber: '',
    branchName: '',
    swiftIban: '',
    openingBalance: 0,
    active: true,
  };
  const [accountForm, setAccountForm] = useState(emptyAccountForm);

  const openAddAccount = (type: BankAccount['accountType'] = 'Bank Account') => {
    setEditingAccountId(null);
    setAccountForm({ ...emptyAccountForm, accountType: type });
    setAccountModalOpen(true);
  };

  const openEditAccount = (acc: BankAccount) => {
    setEditingAccountId(acc.id);
    setAccountForm({
      accountType: acc.accountType,
      accountName: acc.accountName,
      bankName: acc.bankName || '',
      accountNumber: acc.accountNumber || '',
      branchName: acc.branchName || '',
      swiftIban: acc.swiftIban || '',
      openingBalance: acc.openingBalance,
      active: acc.active !== false,
    });
    setAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const name = accountForm.accountName.trim();
    if (!name) {
      alert('Account name is required.');
      return;
    }
    const isBank = accountForm.accountType === 'Bank Account';
    const data = {
      accountType: accountForm.accountType,
      accountName: name,
      bankName: isBank ? accountForm.bankName.trim() : undefined,
      accountNumber: isBank ? accountForm.accountNumber.trim() : undefined,
      branchName: isBank ? accountForm.branchName.trim() : undefined,
      swiftIban: isBank ? accountForm.swiftIban.trim() : undefined,
      openingBalance: Number(accountForm.openingBalance) || 0,
      active: accountForm.active,
    };
    if (editingAccountId) {
      dbService.updateAccount(editingAccountId, data);
    } else {
      dbService.addAccount(data);
    }
    setAccountModalOpen(false);
  };

  const handleDeleteAccount = (acc: BankAccount) => {
    if (!window.confirm(`Delete "${acc.accountName}"?`)) return;
    if (!dbService.deleteAccount(acc.id)) {
      alert('This account already has transactions, so it cannot be deleted. Edit it and set Status to Inactive instead.');
    }
  };

  const accountModal = accountModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <form
        onSubmit={handleSaveAccount}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6 overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Landmark className="w-5 h-5 text-blue-400" />
            <span>{editingAccountId ? 'Edit Account' : 'Add New Bank / Cash Account'}</span>
          </div>
          <button type="button" onClick={() => setAccountModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Account Type</span>
              <select
                value={accountForm.accountType}
                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as BankAccount['accountType'] })}
                className="mt-1 w-full p-2 border border-slate-300 rounded font-semibold"
              >
                <option value="Bank Account">Bank Account</option>
                <option value="Cash in Hand">Cash in Hand</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </label>
            <label className="block">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Status</span>
              <select
                value={accountForm.active ? 'active' : 'inactive'}
                onChange={(e) => setAccountForm({ ...accountForm, active: e.target.value === 'active' })}
                className="mt-1 w-full p-2 border border-slate-300 rounded font-semibold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="font-bold text-slate-600 uppercase text-[10px]">Account Name *</span>
            <input
              type="text"
              value={accountForm.accountName}
              onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
              placeholder="e.g. Meezan Bank - Current A/C"
              className="mt-1 w-full p-2 border border-slate-300 rounded font-semibold"
              required
              autoFocus
            />
          </label>
          {accountForm.accountType === 'Bank Account' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">Bank Name</span>
                  <input
                    type="text"
                    value={accountForm.bankName}
                    onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                    placeholder="e.g. Meezan Bank"
                    className="mt-1 w-full p-2 border border-slate-300 rounded"
                  />
                </label>
                <label className="block">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">Account Number</span>
                  <input
                    type="text"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    className="mt-1 w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">Branch</span>
                  <input
                    type="text"
                    value={accountForm.branchName}
                    onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                    className="mt-1 w-full p-2 border border-slate-300 rounded"
                  />
                </label>
                <label className="block">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">IBAN / SWIFT</span>
                  <input
                    type="text"
                    value={accountForm.swiftIban}
                    onChange={(e) => setAccountForm({ ...accountForm, swiftIban: e.target.value })}
                    className="mt-1 w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </label>
              </div>
            </>
          )}
          <label className="block">
            <span className="font-bold text-slate-600 uppercase text-[10px]">Opening Balance ({currency})</span>
            <input
              type="number"
              step="any"
              value={accountForm.openingBalance}
              onChange={(e) => setAccountForm({ ...accountForm, openingBalance: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full p-2 border border-slate-300 rounded font-black text-right"
            />
            {editingAccountId && (
              <span className="text-[10px] text-slate-500 block mt-1">
                Changing the opening balance adjusts the current balance by the same difference.
              </span>
            )}
          </label>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" onClick={() => setAccountModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-white cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer">
            {editingAccountId ? 'Save Changes' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  );

  const accountsManagerView = (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            <span>Banks &amp; Cash Accounts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new banks and cash accounts, edit details and set opening balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddAccount('Bank Account')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
          <button
            onClick={() => openAddAccount('Cash in Hand')}
            className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cash Account</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Account</th>
              <th className="p-3">Type</th>
              <th className="p-3">Bank / A/C No.</th>
              <th className="p-3 text-right">Opening Balance</th>
              <th className="p-3 text-right">Current Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className={acc.active === false ? 'opacity-60' : ''}>
                <td className="p-3 font-bold text-slate-900">{acc.accountName}</td>
                <td className="p-3">{acc.accountType}</td>
                <td className="p-3 text-slate-600">
                  {acc.bankName || '-'}
                  {acc.accountNumber && <span className="block font-mono text-[10px] text-slate-500">{acc.accountNumber}</span>}
                </td>
                <td className="p-3 text-right font-semibold">{formatCurrency(acc.openingBalance, currency)}</td>
                <td className="p-3 text-right font-black text-slate-900">{formatCurrency(acc.currentBalance, currency)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${acc.active === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {acc.active === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEditAccount(acc)} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg font-bold cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button onClick={() => handleDeleteAccount(acc)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete (only if unused)">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">No accounts yet. Click "Add Bank Account" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {accountModal}
    </div>
  );

  if (accountsMode) return accountsManagerView;

  return (
    <div className="space-y-6">
      {accountModal}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            <span>Cash and Bank Accounts Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time liquid treasury funds, inter-account transfers, and dual cash/bank books.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAddAccount('Bank Account')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Landmark className="w-4 h-4" />
            <span>Add Bank / Cash Account</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cash / Bank Entry</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const isCash = acc.accountType === 'Cash in Hand' || acc.accountType === 'Petty Cash';
          return (
            <div
              key={acc.id}
              className={`p-4 rounded-xl border transition-all ${
                isCash
                  ? 'bg-teal-50/50 border-teal-200'
                  : 'bg-indigo-50/50 border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {acc.accountType}
                </span>
                <div
                  className={`p-1.5 rounded-lg ${
                    isCash ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {isCash ? <Wallet className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-xs truncate">{acc.accountName}</h4>
              {acc.accountNumber && (
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">A/C: {acc.accountNumber}</div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400">Current Balance</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {formatCurrency(acc.currentBalance, currency)}
                  </div>
                </div>
                <button
                  onClick={() => openEditAccount(acc)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-600 bg-white/70 hover:bg-blue-600 hover:text-white border border-slate-200 rounded-lg cursor-pointer"
                  title="Edit account / opening balance"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Liquid Funds Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Consolidated Liquid Treasury Funds</h4>
            <p className="text-xs text-slate-400">Cash in Safe + Commercial Bank Balances</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cash in Safe</span>
            <div className="text-base font-bold text-teal-400">{formatCurrency(totalCash, currency)}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Bank Balances</span>
            <div className="text-base font-bold text-indigo-400">{formatCurrency(totalBank, currency)}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Liquid Capital</span>
            <div className="text-xl font-black text-emerald-400">{formatCurrency(totalLiquid, currency)}</div>
          </div>
        </div>
      </div>

      {/* Account Transactions Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Time Period Filter Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3 text-xs bg-slate-50/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Select Time Period:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'Today', label: 'Daily (Today)' },
                  { id: 'This Week', label: 'Weekly (This Week)' },
                  { id: 'This Month', label: 'Monthly (This Month)' },
                  { id: 'Custom', label: 'Between 2 Dates' },
                  { id: 'This Year', label: 'Yearly (This Year)' },
                  { id: 'All', label: 'All Records' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPeriod(item.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      period === item.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const settings = dbService.getState().settings;
                  const tableRows = filteredTransactions.map((tx) => [
                    tx.voucherNumber,
                    tx.date,
                    tx.accountName,
                    tx.transactionType,
                    tx.partyName || '-',
                    tx.description,
                    tx.transactionType.includes('Receipt') ? formatCurrency(tx.amount, currency) : '-',
                    tx.transactionType.includes('Payment') || tx.transactionType.includes('Expense') ? formatCurrency(tx.amount, currency) : '-',
                    tx.status,
                  ]);
                  const html = generateReportHtml(
                    `Cash & Bank Statement (${period})`,
                    `Transactions from ${dateRange.startDate} to ${dateRange.endDate}`,
                    ['Voucher #', 'Date', 'Account', 'Type', 'Party', 'Description', 'Inflow', 'Outflow', 'Status'],
                    tableRows,
                    [
                      { label: 'Total Inflows', value: formatCurrency(periodInflows, currency) },
                      { label: 'Total Outflows', value: formatCurrency(periodOutflows, currency) },
                      { label: 'Net Period Flow', value: formatCurrency(periodNetFlow, currency) },
                      { label: 'Transactions', value: filteredTransactions.length.toString() },
                    ],
                    settings,
                    currency,
                    dateRange
                  );
                  downloadHtmlFile(`CashBank_Statement_${dateRange.startDate}_${dateRange.endDate}.html`, html);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                title="Download statement as .HTML"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .HTML</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Custom Date Pickers if selected */}
          {period === 'Custom' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700">Custom Date Range:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
            </div>
          )}

          {/* Summary metrics for current period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Period Inflows</span>
              <span className="text-sm font-bold text-emerald-600">{formatCurrency(periodInflows, currency)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Period Outflows</span>
              <span className="text-sm font-bold text-rose-600">{formatCurrency(periodOutflows, currency)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Period Movement</span>
              <span className={`text-sm font-black ${periodNetFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(periodNetFlow, currency)}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Records</span>
              <span className="text-sm font-bold text-slate-800">{filteredTransactions.length} Transactions</span>
            </div>
          </div>

          {/* Search and Account filter row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search voucher, party, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-semibold">Filter Account:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg font-medium bg-white"
              >
                <option value="All">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Date &amp; Voucher #</th>
                <th className="px-4 py-3.5">Transaction Type</th>
                <th className="px-4 py-3.5">Primary Account</th>
                <th className="px-4 py-3.5">Party / Target Account</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 text-right">Inflow (+)</th>
                <th className="px-4 py-3.5 text-right">Outflow (−)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isInflow =
                  tx.transactionType.includes('Receipt') || tx.transactionType === 'Opening Balance';
                const isOutflow =
                  tx.transactionType.includes('Payment') || tx.transactionType.includes('Advance');

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{tx.voucherNumber}</div>
                      <div className="text-[10px] text-slate-400">{tx.date}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isInflow
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOutflow
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{tx.accountName}</td>
                    <td className="px-4 py-3.5">
                      {tx.targetAccountName ? (
                        <div className="font-semibold text-indigo-700">➔ {tx.targetAccountName}</div>
                      ) : (
                        <div className="font-semibold text-slate-900">{tx.partyName || '-'}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{tx.description}</td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-600">
                      {isInflow ? formatCurrency(tx.amount, currency) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-rose-600">
                      {isOutflow ? formatCurrency(tx.amount, currency) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Funds Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                <span>Inter-Account Fund Transfer</span>
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-[11px]">
              Transfer cash to bank, withdraw bank to cash, or wire between bank accounts without affecting P&amp;L or net liquidity.
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Source Account (Debit/Deduct) *</label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} ({formatCurrency(a.currentBalance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Destination Account (Credit/Add) *</label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} ({formatCurrency(a.currentBalance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transfer Amount *</label>
                <input
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-black text-indigo-700 text-base"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cheque / Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. SELF-CHQ-10842"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transfer Description</label>
                <input
                  type="text"
                  placeholder="e.g. Cash withdrawal to replenish yard safe"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Post Cash / Bank Entry</span>
              </h3>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteGeneralEntry} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Entry Transaction Type *</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Cash Receipt">Cash Receipt</option>
                  <option value="Bank Receipt">Bank Receipt</option>
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Bank Payment">Bank Payment</option>
                  <option value="Customer Receipt">Customer Receipt</option>
                  <option value="Driver Advance">Driver Advance</option>
                  <option value="Salary Payment">Salary Payment</option>
                  <option value="Bank Charges">Bank Charges</option>
                  <option value="Adjustment Voucher">Adjustment Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account *</label>
                <select
                  value={entryAccountId}
                  onChange={(e) => setEntryAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} ({formatCurrency(a.currentBalance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Party / Payee / Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Driver Aslam, Fuel Station, Bank"
                  value={entryPartyName}
                  onChange={(e) => setEntryPartyName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount *</label>
                <input
                  type="number"
                  min="1"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-black text-slate-900 text-base"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reference / Cheque #</label>
                <input
                  type="text"
                  value={entryRef}
                  onChange={(e) => setEntryRef(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
