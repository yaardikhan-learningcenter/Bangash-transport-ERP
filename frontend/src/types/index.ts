/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TripStatus =
  | 'Planned'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'POD Received'
  | 'Invoiced'
  | 'Completed'
  | 'Cancelled';

export type VehicleOwnership = 'Owned' | 'Market' | 'Leased' | 'Attached';
export type VehicleStatus = 'Available' | 'On Trip' | 'Under Maintenance' | 'Inactive';

export interface Vehicle {
  id: string;
  vehicleNumber: string; // Registration Plate (e.g., KBL-8921)
  registrationNumber: string; // Official registration document #
  name: string; // e.g., "Volvo FH16 Heavy Hauler"
  vehicleType: string; // e.g., "40ft Container", "Flatbed Trailer", "Box Truck"
  sizeCapacity: string; // e.g., "32 Metric Tons"
  vehicleSize?: string; // Optional alias for vehicle capacity size
  makeModel: string; // e.g., "Volvo FH16 2022"
  manufacturingYear: number;
  chassisNumber: string;
  engineNumber: string;
  registrationExpiryDate: string; // YYYY-MM-DD
  insuranceExpiryDate: string;
  fitnessCertificateExpiryDate: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  ownership: VehicleOwnership;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  customerType: 'Corporate' | 'Distributor' | 'Manufacturer' | 'Trader' | 'Individual';
  authorizedPerson: string;
  contactPerson: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  billingAddress: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  city: string;
  provinceState: string;
  country: string;
  taxRegistrationNumber: string; // GST / VAT / NTN
  creditLimit: number;
  paymentTerms: string; // e.g. "Net 15 Days", "Net 30 Days", "Cash on Delivery"
  openingBalance: number;
  openingBalanceType: 'Receivable' | 'Payable';
  bankDetails?: string;
  remarks?: string;
  active: boolean;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  fatherName: string;
  nationalIdNumber: string; // CNIC / SSN / National ID
  drivingLicenceNumber: string;
  licenceExpiryDate: string;
  dateOfJoining: string;
  mobileNumber: string;
  address: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  salaryAdvance: number;
  netSalary: number; // Calculated: Basic + Allowances + Overtime + Bonuses - Deductions
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  employmentStatus: 'Active' | 'On Leave' | 'Resigned' | 'Suspended';
  remarks?: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'Direct Trip' | 'Operating Overhead';
  description?: string;
  active: boolean;
}

export type PaymentMethod = 'Cash' | 'Bank' | 'Credit' | 'Other';

export interface ExpenseVoucher {
  id: string;
  voucherNumber: string;
  date: string; // YYYY-MM-DD
  expenseName: string; // Explicit name/title of expense (e.g., "Diesel Top-up at Sukkur Station", "Driver Road Allowance", "Office Internet Bill")
  categoryId: string;
  categoryName: string;
  type: 'Direct Trip' | 'Operating Overhead';
  description: string;
  tripId?: string;
  tripNumber?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  payee: string; // Supplier, driver, toll plaza, fuel station
  paymentMethod: PaymentMethod;
  accountId: string; // ID of Cash or Bank account
  amount: number;
  referenceNumber?: string; // Bill / receipt number
  receiptReferenceNumber?: string; // Bill / receipt number alias
  paidFromAccountName?: string; // Source account name alias
  attachmentUrl?: string; // Data URL or receipt reference
  remarks?: string;
  status: 'Posted' | 'Cancelled';
  createdAt: string;
}

export interface TripExpenseItem {
  id: string;
  name: string; // Expense name / title (manual or selected, e.g. Diesel at Sukkur, Toll Plazas, Driver Kharcha)
  expenseName?: string; // Title / Name of expense
  category: string; // Category (Fuel, Toll, Driver Allowance, Loading, Unloading, Maintenance, etc.)
  amount: number;
  liters?: number; // Quantity in liters (diesel / fuel / oil purchases)
  paymentMethod: 'Cash' | 'Bank' | 'Payable' | 'Driver Advance';
  payee?: string;
  referenceNumber?: string;
  notes?: string;
  note?: string;
}

export const STANDARD_RETURN_EXPENSES = [
  'Police Expenses',
  'Oil Lubricant Expense',
  'Gate Passes',
  'Repair and Maintenance on Route',
  'Tyre Repair / Puncher Expenses',
  'Parking Charges',
  'Toll Tax',
  'Mobile Card Expenses Driver',
  'Unloading Charges',
  'Loading Expenses',
  'Fooding Expenses',
  'Custom Expenses',
  'Container Charges',
  'Commission Expenses',
  'Services Cleaning Expenses',
  'Challan Expenses',
  'Bilty Rebate',
  'Accident Expense',
] as const;

export type StandardReturnExpenseName = (typeof STANDARD_RETURN_EXPENSES)[number];

export interface TripFinancials {
  grossFreightRevenue: number;
  loadingCharges: number;
  unloadingCharges: number;
  fuelExpenses: number;
  driverAllowance: number;
  tollTaxes: number;
  roadTaxes: number;
  vehicleRepairMaintenance: number;
  parkingCharges: number;
  foodAccommodation: number;
  routeOtherExpenses: number;
  advancePaidToDriver: number;
  otherDirectCosts: number;
  totalTripExpenses: number;
  netTripProfit: number;
  profitMarginPercentage: number;
}

export type RateType = 'Per Unit' | 'Fixed Lump Sum' | 'Per Ton' | 'Fixed Per Trip';

export interface Trip {
  id: string;
  tripNumber: string; // Auto generated e.g. TRP-2026-0001
  tripDate: string; // YYYY-MM-DD
  customerId: string;
  customerCompanyName: string;
  customerInvoiceNumber?: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleSize: string;
  driverId: string;
  driverName: string;
  driverIdNumber: string;
  driverContactNumber: string;
  bdNumber: string; // Booking Document / Bilty Number (LR #)
  startingLocation: string;
  destinationLocation: string;
  additionalLocations?: string;
  startingDateTime: string;
  expectedDeliveryDateTime: string;
  actualCompletionDateTime?: string;
  goodsDescription: string;
  goodsQuantity: number;
  quantityUnit: string; // Metric Tons, Bags, Pallets, Packages, CBM, Liters, Kg
  freightRate: number; // Rate per unit or lump sum
  rateType: RateType;
  totalFreightAmount: number; // Gross freight recognized
  advanceReceived: number; // Received from customer
  outstandingFreightAmount: number; // totalFreightAmount - advanceReceived
  status: TripStatus;
  financials: TripFinancials;
  tripExpenseItems?: TripExpenseItem[]; // Itemized 5-10 expenses breakdown
  fuelLiters?: number; // Total diesel liters (used when there are no itemized expenses)
  expensesPending?: boolean; // True when vehicle came back and pending expense finalization
  expensesSettledAt?: string;
  invoiceId?: string;
  invoicedAt?: string;
  remarks?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type PODStatus =
  | 'Pending'
  | 'Generated'
  | 'Received'
  | 'Verified'
  | 'Rejected';

export interface POD {
  id: string;
  podNumber: string; // Auto generated e.g. POD-2026-0001
  tripId: string;
  tripNumber: string;
  customerId: string;
  customerName: string;
  customerInvoiceNumber?: string;
  vehicleNumber: string;
  driverName: string;
  goodsDescription: string;
  quantityDispatched: number;
  quantityDelivered: number;
  quantityUnit: string;
  deliveryLocation: string;
  deliveryDateTime: string;
  receivedBy: string;
  receiverDesignation: string;
  receiverContactNumber: string;
  deliveryRemarks?: string;
  shortageDamageDetails?: string;
  deliveryConfirmation: boolean;
  signatureDataUrl?: string; // Digital signature
  uploadedDocumentUrl?: string; // Uploaded photograph or scanned document
  status: PODStatus;
  verificationDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoicePaymentStatus =
  | 'Unpaid'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  billingAddress?: string;
  tripId: string;
  tripNumber: string;
  vehicleNumber: string;
  goodsDescription: string;
  quantity: number;
  quantityUnit: string;
  freightRate: number;
  freightAmount: number;
  loadingUnloadingCharges: number;
  additionalCharges: number;
  discount: number;
  taxRatePercent: number; // e.g. 5% or 0%
  taxRate?: number;
  taxAmount: number;
  totalInvoiceAmount: number;
  previousOutstandingBalance: number;
  amountReceived: number;
  remainingBalance: number;
  paymentStatus: InvoicePaymentStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountType: 'Cash in Hand' | 'Bank Account' | 'Petty Cash';
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  swiftIban?: string;
  openingBalance: number;
  currentBalance: number;
  active: boolean;
}

export type AccountTransactionType =
  | 'Cash Receipt'
  | 'Bank Receipt'
  | 'Cash Payment'
  | 'Bank Payment'
  | 'Cash-to-Bank Transfer'
  | 'Bank-to-Cash Transfer'
  | 'Bank-to-Bank Transfer'
  | 'Customer Receipt'
  | 'Expense Payment'
  | 'Supplier Payment'
  | 'Driver Advance'
  | 'Salary Payment'
  | 'Bank Charges'
  | 'Adjustment Voucher'
  | 'Opening Balance';

export interface CashBankTransaction {
  id: string;
  voucherNumber: string;
  date: string;
  transactionType: AccountTransactionType;
  accountId: string; // Source account (for payments/transfers) or Primary account
  accountName: string;
  targetAccountId?: string; // For transfers
  targetAccountName?: string;
  amount: number;
  partyType?: 'Customer' | 'Supplier' | 'Driver' | 'Other';
  partyId?: string;
  partyName?: string;
  tripId?: string;
  tripNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  description: string;
  postedBy: string;
  status: 'Posted' | 'Cancelled';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  address: string;
  openingBalance: number; // Payable
  currentBalance: number;
  paymentTerms: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface DayBookEntry {
  id: string;
  date: string;
  voucherNumber: string;
  tripNumber?: string;
  transactionType: string;
  partyName: string;
  vehicleNumber?: string;
  description: string;
  cashIn: number;
  cashOut: number;
  bankIn: number;
  bankOut: number;
  debit: number;
  credit: number;
  runningCashBalance: number;
  runningBankBalance: number;
  postedBy: string;
  status: string;
  isOperationalOnly?: boolean; // If purely operational trip entry with no cash impact yet
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  transactionType: 'Opening Balance' | 'Freight Invoice' | 'Customer Receipt' | 'Credit Note' | 'Debit Note' | 'Adjustment';
  voucherNumber: string;
  tripNumber?: string;
  invoiceNumber?: string;
  description: string;
  debit: number; // Billed to customer
  credit: number; // Received from customer
  runningBalance: number;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  cityCountry: string;
  phone: string;
  email: string;
  taxRegistrationNumber: string;
  website: string;
  currencySymbol: string;
  financialYear: string;
  invoicePrefix: string;
  tripPrefix: string;
  podPrefix: string;
  voucherPrefix: string;
  receiptPrefix?: string;
  accountingBasis: 'Accrual' | 'Cash';
  bankDetailsForInvoice: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle?: string;
  showOfficialStamp?: boolean;
  printNotesFooter?: string;
  adminPin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entityType: 'Trip' | 'Invoice' | 'POD' | 'Expense' | 'Customer' | 'Vehicle' | 'Driver' | 'Transaction' | 'Supplier' | 'Purchase' | 'Location';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'POST' | 'VERIFY' | 'REJECT';
  details: string;
  user: string;
}

// --- PURCHASES (TYRES, PARTS, DIESEL, BATTERY) ---
export type PurchaseCategory = 'Tyres' | 'Parts' | 'Diesel' | 'Battery';

export interface PurchaseItem {
  id: string;
  purchaseNumber: string; // PUR-2026-0001
  date: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  category: PurchaseCategory;
  itemName: string; // e.g. Bridgestone 315/80R22.5 Tyre, Euro-5 Diesel 500L, AGS 12V 175Ah Battery
  quantity: number;
  unit: string; // Nos, Liters, Pcs, Sets
  unitPrice: number;
  totalAmount: number;
  vehicleId?: string; // Optional: Truck fleet where item/fuel was allocated
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  paymentMethod: 'Cash' | 'Bank' | 'Payable' | 'Other';
  accountId?: string;
  paidAmount: number;
  remainingBalance: number;
  invoiceBillNumber?: string;
  remarks?: string;
  createdAt: string;
}

// --- USER LOGIN & ROLES (4 LOGINS) ---
export type UserRole = 'Admin' | 'Operations' | 'Accounts' | 'Workshop';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  title: string;
  email: string;
  department: string;
  avatarBg: string;
  permissions: string[];
  pin?: string;
  status?: 'Active' | 'Inactive';
}

/** Total fuel quantity (liters) for a trip: sum of itemized liters, else the trip-level value. */
export function getTripFuelLiters(trip: { tripExpenseItems?: TripExpenseItem[]; fuelLiters?: number }): number {
  const items = trip.tripExpenseItems || [];
  const fromItems = items.reduce((sum, i) => sum + (Number(i.liters) || 0), 0);
  return fromItems > 0 ? fromItems : Number(trip.fuelLiters) || 0;
}

export type LocationType = 'City' | 'Warehouse' | 'Port / Terminal' | 'Factory / Plant' | 'Depot / Yard' | 'Other';

/** Master list of places used as trip Starting Location / Destination. */
export interface Location {
  id: string;
  name: string; // e.g. "Port Qasim Terminal, Karachi"
  city?: string;
  type: LocationType;
  notes?: string;
  active: boolean;
  createdAt: string;
}
