/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService, ERPDatabaseState } from './services/db';
import {
  DateFilterPeriod,
  DateRange,
  getDateRangeFromPeriod,
  computeDashboardKPIs,
} from './services/accountingEngine';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { TripManagement } from './components/TripManagement';
import { NewTripModal } from './components/NewTripModal';
import { VehicleManagement } from './components/VehicleManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { CustomerLedgerView } from './components/CustomerLedgerView';
import { DriverManagement } from './components/DriverManagement';
import { ExpenseManagement } from './components/ExpenseManagement';
import { NewExpenseModal } from './components/NewExpenseModal';
import { InvoiceManagement } from './components/InvoiceManagement';
import { CustomerReceiptManagement } from './components/CustomerReceiptManagement';
import { NewInvoiceModal } from './components/NewInvoiceModal';
import { PODManagement } from './components/PODManagement';
import { CashBankManagement } from './components/CashBankManagement';
import { DayBookRegister } from './components/DayBookRegister';
import { ProfitLossView } from './components/ProfitLossView';
import { SupplierManagement } from './components/SupplierManagement';
import { ReportsCenter } from './components/ReportsCenter';
import { SettingsModal } from './components/SettingsModal';
import { PrintDocumentsModal } from './components/PrintDocuments';
import { FleetMarketDashboard } from './components/FleetMarketDashboard';
import { TripSheetModal } from './components/TripSheetModal';
import { TripExpenseSettlementModal } from './components/TripExpenseSettlementModal';
import { PurchaseManagement } from './components/PurchaseManagement';
import { LoginSwitchModal } from './components/LoginSwitchModal';
import { Trip, Customer, Invoice, POD, UserProfile } from './types';
import {
  AlertTriangle,
  Building,
  RotateCcw,
  Shield,
  Key,
  Download,
  Upload,
  UserCheck,
  Lock,
  CheckCircle,
  Database,
  Settings,
} from 'lucide-react';

export default function App() {
  // Database reactive state
  const [dbState, setDbState] = useState<ERPDatabaseState>(dbService.getState());

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Active User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(dbService.getActiveUser());

  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      setDbState({ ...dbService.getState() });
      setCurrentUser(dbService.getActiveUser());
    });
    return unsubscribe;
  }, []);

  // Global Date Filtering
  const [period, setPeriod] = useState<DateFilterPeriod>('This Month');
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  });

  const activeDateRange = getDateRangeFromPeriod(period, customRange.startDate, customRange.endDate);

  // Modals
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTripSheetsModalOpen, setIsTripSheetsModalOpen] = useState(false);
  const [isExpenseSettlementModalOpen, setIsExpenseSettlementModalOpen] = useState(false);
  const [isLoginSwitchModalOpen, setIsLoginSwitchModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'logins' | 'profile' | 'prefixes' | 'backup' | 'audit'>('logins');

  const handleOpenSettingsTab = (tab: 'logins' | 'profile' | 'prefixes' | 'backup' | 'audit') => {
    setSettingsModalTab(tab);
    setIsSettingsModalOpen(true);
  };

  // Selected item states
  const [selectedTripForDetails, setSelectedTripForDetails] = useState<Trip | null>(null);
  const [activeVerifyPodId, setActiveVerifyPodId] = useState<string | null>(null);
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState<string>('');

  // Print Document preview
  const [printDoc, setPrintDoc] = useState<{
    type: 'bilty' | 'invoice' | 'pod' | 'statement' | 'receipt' | 'voucher' | 'supplier-statement' | null;
    data: any;
  }>({ type: null, data: null });

  // Calculate KPIs
  const kpis = computeDashboardKPIs(activeDateRange);
  const pendingPODs = dbState.pods.filter((p) => p.status === 'Generated' || p.status === 'Pending');
  const pendingExpenseTrips = dbState.trips.filter((t) => t.expensesPending === true);

  const currency = dbState.settings.currencySymbol || 'PKR';

  // Navigation helpers
  const handleViewCustomerLedger = (customerId: string) => {
    setSelectedCustomerIdForLedger(customerId);
    setActiveTab('customer-ledger');
  };

  const handleQuickVerifyPOD = (podId: string) => {
    setActiveVerifyPodId(podId);
    setActiveTab('pod');
  };

  const handleSelectTripToPrint = (trip: Trip) => {
    setPrintDoc({ type: 'bilty', data: trip });
  };

  const handleSelectInvoiceToPrint = (invoice: Invoice) => {
    setPrintDoc({ type: 'invoice', data: invoice });
  };

  const handleSelectPODToPrint = (pod: POD) => {
    setPrintDoc({ type: 'pod', data: pod });
  };

  const handleSelectCustomerToPrintStatement = (customer: Customer, ledger?: any) => {
    setPrintDoc({ type: 'statement', data: { customer, ledger } });
  };

  const handleSelectReceiptToPrint = (receiptData: any) => {
    setPrintDoc({ type: 'receipt', data: receiptData });
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pendingPODCount={pendingPODs.length}
        pendingExpenseCount={pendingExpenseTrips.length}
        logoUrl={dbState.settings.logoUrl}
        companyName={dbState.settings.companyName}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          settings={dbState.settings}
          period={period}
          setPeriod={setPeriod}
          customRange={customRange}
          setCustomRange={setCustomRange}
          currentUser={currentUser}
          pendingExpensesCount={pendingExpenseTrips.length}
          onOpenLoginSwitchModal={() => setIsLoginSwitchModalOpen(true)}
          onOpenExpenseSettlementModal={() => setIsExpenseSettlementModalOpen(true)}
          onOpenTripSheetsModal={() => setIsTripSheetsModalOpen(true)}
          onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
          onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)}
          onOpenNewInvoiceModal={() => setIsNewInvoiceModalOpen(true)}
          onOpenCashBankModal={() => setActiveTab('cash-bank')}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onResetDemo={() => dbService.resetToDemo()}
        />

        {/* Vehicle Return Expense Alert Banner */}
        {pendingExpenseTrips.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-amber-800 z-10 transition-all">
            <div className="flex items-center space-x-2.5 text-xs font-semibold">
              <span className="p-1 bg-amber-900/40 rounded-full animate-bounce">
                <AlertTriangle className="w-4 h-4 text-amber-200" />
              </span>
              <span>
                <strong className="text-amber-100 font-black">VEHICLE RETURN NOTICE:</strong> {pendingExpenseTrips.length} trip{pendingExpenseTrips.length > 1 ? 's' : ''} completed route and vehicle arrived back — awaiting route expenses entry from driver receipts!
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpenseSettlementModalOpen(true)}
                className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-md shadow-xs cursor-pointer flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                <span>Add &amp; Settle Route Expenses ({pendingExpenseTrips.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              currency={currency}
              trips={dbState.trips}
              pendingPODs={pendingPODs}
              accounts={dbState.accounts}
              vehicles={dbState.vehicles}
              dateRange={activeDateRange}
              settings={dbState.settings}
              onSelectTrip={(t) => {
                setSelectedTripForDetails(t);
                setActiveTab('trips');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onQuickVerifyPOD={handleQuickVerifyPOD}
            />
          )}

          {activeTab === 'fleet-dashboard' && (
            <FleetMarketDashboard
              settings={dbState.settings}
              currencySymbol={currency}
              onNavigateToPurchases={() => setActiveTab('purchases')}
              onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
            />
          )}

          {activeTab === 'trip-sheets' && (
            <TripSheetModal
              isOpen={true}
              onClose={() => setActiveTab('trips')}
              settings={dbState.settings}
              currencySymbol={currency}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchaseManagement
              settings={dbState.settings}
              currencySymbol={currency}
            />
          )}

          {activeTab === 'trips' && (
            <TripManagement
              trips={dbState.trips}
              customers={dbState.customers}
              vehicles={dbState.vehicles}
              drivers={dbState.drivers}
              currency={currency}
              settings={dbState.settings}
              onSelectTripToPrint={handleSelectTripToPrint}
              onSelectInvoiceToPrint={handleSelectInvoiceToPrint}
              onSelectReceiptToPrint={handleSelectReceiptToPrint}
              onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
              selectedTripForDetails={selectedTripForDetails}
              setSelectedTripForDetails={setSelectedTripForDetails}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagement
              vehicles={dbState.vehicles}
              trips={dbState.trips}
              drivers={dbState.drivers}
              currency={currency}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              customers={dbState.customers}
              trips={dbState.trips}
              invoices={dbState.invoices}
              currency={currency}
              onViewCustomerLedger={handleViewCustomerLedger}
              onSelectCustomerToPrintStatement={(c) => {
                handleSelectCustomerToPrintStatement(c);
              }}
              onViewCustomerReceipts={(_cId) => {
                setActiveTab('customer-receipts');
              }}
            />
          )}

          {activeTab === 'drivers' && (
            <DriverManagement
              drivers={dbState.drivers}
              trips={dbState.trips}
              vehicles={dbState.vehicles}
              currency={currency}
            />
          )}

          {activeTab === 'pod' && (
            <PODManagement
              pods={dbState.pods}
              trips={dbState.trips}
              settings={dbState.settings}
              onSelectPODToPrint={handleSelectPODToPrint}
              activeVerifyPodId={activeVerifyPodId}
              setActiveVerifyPodId={setActiveVerifyPodId}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceManagement
              invoices={dbState.invoices}
              trips={dbState.trips}
              customers={dbState.customers}
              accounts={dbState.accounts}
              currency={currency}
              settings={dbState.settings}
              onSelectInvoiceToPrint={handleSelectInvoiceToPrint}
              onOpenNewInvoiceModal={() => setIsNewInvoiceModalOpen(true)}
            />
          )}

          {activeTab === 'customer-receipts' && (
            <CustomerReceiptManagement
              customers={dbState.customers}
              invoices={dbState.invoices}
              trips={dbState.trips}
              accounts={dbState.accounts}
              transactions={dbState.transactions}
              currency={currency}
              settings={dbState.settings}
              onPrintReceipt={handleSelectReceiptToPrint}
              onViewCustomerLedger={handleViewCustomerLedger}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManagement
              vouchers={dbState.expenseVouchers}
              categories={dbState.expenseCategories}
              trips={dbState.trips}
              vehicles={dbState.vehicles}
              drivers={dbState.drivers}
              accounts={dbState.accounts}
              currency={currency}
              onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'customer-ledger' && (
            <CustomerLedgerView
              customers={dbState.customers}
              selectedCustomerId={selectedCustomerIdForLedger || dbState.customers[0]?.id}
              setSelectedCustomerId={setSelectedCustomerIdForLedger}
              dateRange={activeDateRange}
              setDateRange={setCustomRange}
              currency={currency}
              settings={dbState.settings}
              onPrintStatement={(cust, ledger) => {
                setPrintDoc({ type: 'statement', data: { customer: cust, ledger } });
              }}
            />
          )}

          {activeTab === 'bank-accounts' && (
            <CashBankManagement
              accounts={dbState.accounts}
              transactions={dbState.transactions}
              currency={currency}
              accountsMode
            />
          )}

          {activeTab === 'cash-bank' && (
            <CashBankManagement
              accounts={dbState.accounts}
              transactions={dbState.transactions}
              currency={currency}
            />
          )}

          {activeTab === 'day-book' && (
            <DayBookRegister
              dateRange={activeDateRange}
              setDateRange={setCustomRange}
              currency={currency}
              settings={dbState.settings}
            />
          )}

          {activeTab === 'profit-loss' && (
            <ProfitLossView
              dateRange={activeDateRange}
              setDateRange={setCustomRange}
              currency={currency}
              settings={dbState.settings}
            />
          )}

          {activeTab === 'suppliers' && (
            <SupplierManagement
              suppliers={dbState.suppliers}
              accounts={dbState.accounts}
              vouchers={dbState.expenseVouchers}
              currency={currency}
              settings={dbState.settings}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsCenter
              trips={dbState.trips}
              customers={dbState.customers}
              vehicles={dbState.vehicles}
              drivers={dbState.drivers}
              invoices={dbState.invoices}
              pods={dbState.pods}
              vouchers={dbState.expenseVouchers}
              accounts={dbState.accounts}
              transactions={dbState.transactions}
              suppliers={dbState.suppliers}
              currency={currency}
              dateRange={activeDateRange}
              settings={dbState.settings}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Settings &amp; Database Backup</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      System Administration, User Logins &amp; Security (Admin Only), Offline JSON Backups &amp; Enterprise Prefixes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenSettingsTab('logins')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Shield className="w-4 h-4" />
                    <span>User Logins &amp; Access (Admin Only)</span>
                  </button>
                  <button
                    onClick={() => handleOpenSettingsTab('backup')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Database className="w-4 h-4" />
                    <span>JSON Backup &amp; Restore</span>
                  </button>
                </div>
              </div>

              {/* Current Active User Status Card */}
              <div
                className={`p-5 rounded-2xl border shadow-xs transition-all ${
                  currentUser.role === 'Admin'
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300'
                    : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-md shrink-0 ${
                        currentUser.avatarBg || 'bg-slate-800'
                      }`}
                    >
                      {currentUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">{currentUser.fullName}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            currentUser.role === 'Admin'
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                        {currentUser.role === 'Admin' ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Authorized Admin
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-amber-600" /> Login Switching Restricted
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        {currentUser.title} • {currentUser.department}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {currentUser.role === 'Admin'
                          ? 'You have full administrative privileges to manage user accounts, change logins, and configure database backups.'
                          : 'You are in staff mode. Only the Administrator (Malik Bangash) can change or switch logins. Enter Admin PIN to unlock.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenSettingsTab('logins')}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>
                        {currentUser.role === 'Admin' ? 'Change / Switch Active Login' : 'Unlock & Change Login (Admin)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Card 1: User Logins */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">4 System User Logins</h3>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded">
                        ADMIN ONLY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Manage 4 system accounts: Malik Bangash (Admin), Tariq Khan (Operations), Rashid Mehmood (Accounts), and Umer Afridi (Workshop). Change credentials and active profile.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenSettingsTab('logins')}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Manage Logins &amp; Access ➔</span>
                  </button>
                </div>

                {/* Card 2: JSON Backup */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">JSON Database Backup</h3>
                    <p className="text-xs text-slate-500">
                      Instantly download complete offline backup of all trips, bilties, customer ledgers, invoices, vouchers, and vehicle master in standard JSON format.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const jsonStr = dbService.exportDatabaseJSON();
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Bangash_Transport_Backup_${new Date().toISOString().substring(0, 10)}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup File ➔</span>
                  </button>
                </div>

                {/* Card 3: Restore Database */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">Database Restore</h3>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Restore previous backup JSON database. Overwrites current records with verified snapshot. Protected by Administrator authorization.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenSettingsTab('backup')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore Backup ➔</span>
                  </button>
                </div>

                {/* Card 4: Company Profile & Prefixes */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Company Legal Profile</h3>
                    <p className="text-xs text-slate-500">
                      Configure legal company name, logo, NTN / Sales Tax registration, Mauripur terminal address, official dispatch phone, and bank remittance info.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenSettingsTab('profile')}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Edit Profile &amp; Prefixes ➔</span>
                  </button>
                </div>

                {/* Card 5: System Audit Trail */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">System Audit Trail</h3>
                    <p className="text-xs text-slate-500">
                      View real-time event logs of all trips created, freight invoices issued, expenses posted, driver allotments, and logins switched.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenSettingsTab('audit')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>View Audit Trail ({dbState.auditLogs.length}) ➔</span>
                  </button>
                </div>

                {/* Card 6: Reset Demo Data */}
                <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-rose-950 text-sm">Reset Database</h3>
                    <p className="text-xs text-rose-700">
                      Reverts all modifications and resets database to the default realistic demo dataset with 4 user accounts, vehicles, and trips.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (currentUser.role !== 'Admin') {
                        alert('Only Administrator can reset the database. Please switch to Admin first.');
                        handleOpenSettingsTab('logins');
                        return;
                      }
                      if (window.confirm('Reset database to realistic default demo dataset?')) {
                        dbService.resetToDemo();
                      }
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default Demo ➔</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating & Action Modals */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        customers={dbState.customers}
        vehicles={dbState.vehicles}
        drivers={dbState.drivers}
        currency={currency}
        onTripSaved={(trip, print) => {
          if (print) setPrintDoc({ type: 'bilty', data: trip });
        }}
      />

      <NewExpenseModal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
        categories={dbState.expenseCategories}
        trips={dbState.trips}
        vehicles={dbState.vehicles}
        drivers={dbState.drivers}
        accounts={dbState.accounts}
        currency={currency}
      />

      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        trips={dbState.trips}
        customers={dbState.customers}
        currency={currency}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={dbState.settings}
        auditLogs={dbState.auditLogs}
        currentUser={currentUser}
        onUserSwitched={(u) => setCurrentUser(u)}
        initialTab={settingsModalTab}
        onResetDemo={() => dbService.resetToDemo()}
      />

      <PrintDocumentsModal
        type={printDoc.type}
        data={printDoc.data}
        settings={dbState.settings}
        currency={currency}
        onClose={() => setPrintDoc({ type: null, data: null })}
      />

      <TripSheetModal
        isOpen={isTripSheetsModalOpen}
        onClose={() => setIsTripSheetsModalOpen(false)}
        settings={dbState.settings}
        currencySymbol={currency}
      />

      <TripExpenseSettlementModal
        isOpen={isExpenseSettlementModalOpen}
        onClose={() => setIsExpenseSettlementModalOpen(false)}
        currencySymbol={currency}
      />

      <LoginSwitchModal
        isOpen={isLoginSwitchModalOpen}
        onClose={() => setIsLoginSwitchModalOpen(false)}
        currentUser={currentUser}
        onUserSwitched={(u) => setCurrentUser(u)}
        onOpenSettingsModal={() => handleOpenSettingsTab('logins')}
      />
    </div>
  );
}
