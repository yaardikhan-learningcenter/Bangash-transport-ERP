/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DEFAULT_LOGO from '../logo';
import { api } from './api';
import {
  Trip,
  Vehicle,
  Customer,
  Driver,
  ExpenseCategory,
  ExpenseVoucher,
  Invoice,
  POD,
  BankAccount,
  CashBankTransaction,
  Supplier,
  CompanySettings,
  AuditLog,
  PurchaseItem,
  UserProfile,
  Location,
} from '../types';


export interface ERPDatabaseState {
  trips: Trip[];
  vehicles: Vehicle[];
  customers: Customer[];
  drivers: Driver[];
  expenseCategories: ExpenseCategory[];
  expenseVouchers: ExpenseVoucher[];
  invoices: Invoice[];
  pods: POD[];
  accounts: BankAccount[];
  transactions: CashBankTransaction[];
  suppliers: Supplier[];
  purchases: PurchaseItem[];
  locations: Location[];
  users: UserProfile[];
  activeUserId: string;
  settings: CompanySettings;
  auditLogs: AuditLog[];
}

const defaultSettings: CompanySettings = {
  companyName: 'Bangash Transport Co.',
  tagline: 'Goods Forwarding & Nationwide Heavy Freight Logistics',
  logoUrl: DEFAULT_LOGO,
  address: 'Plot 42-B, Industrial Freight Terminal, Port Road',
  cityCountry: 'Karachi, Pakistan',
  phone: '+92 21 3456 7890 / +92 300 1234567',
  email: 'operations@bangashtransport.com',
  taxRegistrationNumber: 'NTN-8934521-7 / GST-17-00-8934-521',
  website: 'www.bangashtransport.com',
  currencySymbol: 'PKR',
  financialYear: '2025-2026',
  invoicePrefix: 'INV-2026-',
  tripPrefix: 'TRP-2026-',
  podPrefix: 'POD-2026-',
  voucherPrefix: 'VCH-2026-',
  receiptPrefix: 'CRV-2026-',
  accountingBasis: 'Accrual',
  bankDetailsForInvoice: 'Standard Chartered Bank - A/C # 01-8934211-01 (Bangash Transport Co.) | IBAN: PK36SCBL0000001893421101',
  authorizedSignatoryName: 'Malik Bangash (Managing Director)',
  authorizedSignatoryTitle: 'Managing Director & Chief Executive',
  showOfficialStamp: true,
  printNotesFooter: 'This is an authentic commercial transport document issued by Bangash Transport Co. Subject to national freight forwarding carriage terms.',
  adminPin: '1234',
};

const defaultExpenseCategories: ExpenseCategory[] = [
  { id: 'cat-fuel', name: 'Fuel / Diesel', type: 'Direct Trip', description: 'Fuel filled for trip route', active: true },
  { id: 'cat-toll', name: 'Toll & Road Tax', type: 'Direct Trip', description: 'Motorway and highway toll plazas', active: true },
  { id: 'cat-loading', name: 'Loading Charges', type: 'Direct Trip', description: 'Labor and loading crane costs at pickup', active: true },
  { id: 'cat-unloading', name: 'Unloading Charges', type: 'Direct Trip', description: 'Labor and offloading costs at delivery', active: true },
  { id: 'cat-allowance', name: 'Driver Trip Allowance', type: 'Direct Trip', description: 'Per diem food and travel allowance paid to driver', active: true },
  { id: 'cat-maint', name: 'Vehicle Repair & Maintenance', type: 'Direct Trip', description: 'Emergency repairs, tyre punctures during trip', active: true },
  { id: 'cat-parking', name: 'Parking & Weighbridge', type: 'Direct Trip', description: 'Terminal parking, weigh scale weight slips', active: true },
  { id: 'cat-food', name: 'Food & Accommodation', type: 'Direct Trip', description: 'Driver night stay or rest stop expenses', active: true },
  { id: 'cat-police', name: 'Route & Municipality Taxes', type: 'Direct Trip', description: 'Local border permits and municipal entries', active: true },
  { id: 'cat-office-rent', name: 'Office & Warehouse Rent', type: 'Operating Overhead', description: 'Headquarters and yard facility rental', active: true },
  { id: 'cat-salaries', name: 'Staff Salaries & Admin Payroll', type: 'Operating Overhead', description: 'Dispatchers, accountants, management salaries', active: true },
  { id: 'cat-utilities', name: 'Electricity, Water & Internet', type: 'Operating Overhead', description: 'Monthly utility bills and internet bandwidth', active: true },
  { id: 'cat-bank', name: 'Bank Charges & Commission', type: 'Operating Overhead', description: 'Wire transfer fees and account maintenance', active: true },
  { id: 'cat-tyres', name: 'Tyres & Major Fleet Overhaul', type: 'Operating Overhead', description: 'Bulk tyre purchases and annual mechanical overhaul', active: true },
  { id: 'cat-misc', name: 'Miscellaneous Expenses', type: 'Operating Overhead', description: 'Stationery, refreshments, unforeseen office expenses', active: true },
];

const defaultAccounts: BankAccount[] = [
  {
    id: 'acc-cash-1',
    accountName: 'Cash in Hand (Main Terminal Safe)',
    accountType: 'Cash in Hand',
    openingBalance: 250000,
    currentBalance: 312500,
    active: true,
  },
  {
    id: 'acc-bank-1',
    accountName: 'Standard Chartered - Fleet Corporate A/C',
    accountType: 'Bank Account',
    bankName: 'Standard Chartered Bank',
    accountNumber: '01-8934211-01',
    branchName: 'Main Boulevard Commercial Branch',
    swiftIban: 'PK36SCBL0000001893421101',
    openingBalance: 1250000,
    currentBalance: 1685000,
    active: true,
  },
  {
    id: 'acc-bank-2',
    accountName: 'Habib Bank Ltd (HBL) Operations A/C',
    accountType: 'Bank Account',
    bankName: 'HBL Bank Limited',
    accountNumber: '2289-79011422-03',
    branchName: 'Port Qasim Logistics Wing',
    swiftIban: 'PK12HABB0022897901142203',
    openingBalance: 850000,
    currentBalance: 980000,
    active: true,
  },
  {
    id: 'acc-petty',
    accountName: 'Petty Cash - Dispatch Desk',
    accountType: 'Petty Cash',
    openingBalance: 50000,
    currentBalance: 42000,
    active: true,
  },
];

const defaultSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'National Petroleum Fuel Station #42',
    contactPerson: 'Malik Zulfiqar',
    mobileNumber: '+92 300 5551234',
    address: 'National Highway N-5, Mile Post 84',
    openingBalance: 65000,
    currentBalance: 85000,
    paymentTerms: 'Weekly Credit',
    notes: 'Primary diesel vendor for Northbound convoy',
    active: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'sup-2',
    name: 'Al-Madina Heavy Tyres & Workshop',
    contactPerson: 'Ustad Farooq',
    mobileNumber: '+92 321 7778899',
    address: 'Truck Stand Plot 12, Hawke\'s Bay Road',
    openingBalance: 40000,
    currentBalance: 40000,
    paymentTerms: '15 Days Credit',
    notes: 'Tyre retreading, alignment, suspension repair',
    active: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'sup-3',
    name: 'Pak Truck Spare Parts Depot',
    contactPerson: 'Haji Nisar',
    mobileNumber: '+92 345 1122334',
    address: 'Auto Market Road, Shershah, Karachi',
    openingBalance: 30000,
    currentBalance: 55000,
    paymentTerms: '30 Days Credit',
    notes: 'Engine spare parts, brake shoes, filters & suspension kits',
    active: true,
    createdAt: '2026-01-20',
  },
  {
    id: 'sup-4',
    name: 'Exide & AGS Heavy Batteries Hub',
    contactPerson: 'Sohail Butt',
    mobileNumber: '+92 312 9988776',
    address: 'Battery Market, Badami Bagh, Lahore',
    openingBalance: 25000,
    currentBalance: 35000,
    paymentTerms: '15 Days Credit',
    notes: 'Heavy commercial vehicle 12V / 24V batteries with warranty',
    active: true,
    createdAt: '2026-02-01',
  },
];

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    companyName: 'Blue Star Industrial Goods Ltd',
    customerType: 'Manufacturer',
    authorizedPerson: 'Engr. Imran Hafeez (Supply Chain Head)',
    contactPerson: 'Kamran Ali (Logistics Officer)',
    mobile: '+92 300 8219401',
    whatsapp: '+92 300 8219401',
    email: 'logistics@bluestarindustries.com',
    billingAddress: 'Plot 18, Phase 2, Industrial Estate, Hub',
    pickupAddress: 'Hub Factory Warehouse Gate 3',
    deliveryAddress: 'Lahore Multan Road Distribution Center',
    city: 'Hub / Karachi',
    provinceState: 'Balochistan / Sindh',
    country: 'Pakistan',
    taxRegistrationNumber: 'NTN-1428591-2',
    creditLimit: 2500000,
    paymentTerms: 'Net 30 Days',
    openingBalance: 350000,
    openingBalanceType: 'Receivable',
    bankDetails: 'Meezan Bank - A/C 0201010049281',
    remarks: 'Long term corporate client. 15-20 bulk container shipments monthly.',
    active: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'cust-2',
    companyName: 'Apex FMCG Distributors',
    customerType: 'Distributor',
    authorizedPerson: 'Bilal Siddiqui',
    contactPerson: 'Sajid Mehmood',
    mobile: '+92 322 4591023',
    whatsapp: '+92 322 4591023',
    email: 'accounts@apexfmcg.com.pk',
    billingAddress: 'Sector 15, Korangi Industrial Zone',
    pickupAddress: 'Korangi Cold Storage & Warehouse',
    deliveryAddress: 'Islamabad I-9 Dry Port Depot',
    city: 'Karachi',
    provinceState: 'Sindh',
    country: 'Pakistan',
    taxRegistrationNumber: 'NTN-2901412-8',
    creditLimit: 1500000,
    paymentTerms: 'Net 15 Days',
    openingBalance: 180000,
    openingBalanceType: 'Receivable',
    remarks: 'High value packaged food products. Strict delivery schedules.',
    active: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cust-3',
    companyName: 'Falcon Cement & Building Materials',
    customerType: 'Corporate',
    authorizedPerson: 'Sheikh Arshad',
    contactPerson: 'Waqas Bhatti',
    mobile: '+92 333 9918231',
    email: 'dispatch@falconcement.com',
    billingAddress: 'Floor 4, Business Avenue, Shahrah-e-Faisal',
    pickupAddress: 'Nooriabad Plant Gate 1',
    deliveryAddress: 'Sukkur Bulk Terminal',
    city: 'Karachi',
    provinceState: 'Sindh',
    country: 'Pakistan',
    taxRegistrationNumber: 'NTN-0891244-6',
    creditLimit: 3000000,
    paymentTerms: 'Net 30 Days',
    openingBalance: 0,
    openingBalanceType: 'Receivable',
    remarks: 'Bulk flatbed trailers required for cement bags.',
    active: true,
    createdAt: '2026-01-12',
  },
  {
    id: 'cust-4',
    companyName: 'Orient Textiles Mills Ltd',
    customerType: 'Manufacturer',
    authorizedPerson: 'Khurram Shehzad',
    contactPerson: 'Rashid Khan',
    mobile: '+92 312 6023910',
    email: 'shipping@orienttextiles.pk',
    billingAddress: 'Kot Lakhpat Industrial Area, Lahore',
    pickupAddress: 'Orient Spinning Unit 3, Ferozepur Road',
    deliveryAddress: 'Karachi QICT Port Qasim Container Terminal',
    city: 'Lahore',
    provinceState: 'Punjab',
    country: 'Pakistan',
    taxRegistrationNumber: 'NTN-3129841-5',
    creditLimit: 2000000,
    paymentTerms: 'Net 15 Days',
    openingBalance: 120000,
    openingBalanceType: 'Receivable',
    remarks: 'Export cotton bales and finished fabric containers to seaport.',
    active: true,
    createdAt: '2026-01-18',
  },
  {
    id: 'cust-kohat',
    companyName: 'Kohat Logistics & Forwarding Co.',
    customerType: 'Corporate',
    authorizedPerson: 'Malik Jahangir Bangash',
    contactPerson: 'Gulzar Ahmed',
    mobile: '+92 333 5192840',
    email: 'dispatch@kohatlogistics.com',
    billingAddress: 'Main Rawalpindi-Kohat Road Terminal, Kohat',
    pickupAddress: 'Kohat Goods Station',
    deliveryAddress: 'Parachinar / Kurram Terminal / Topaki Depot',
    city: 'Kohat / Parachinar',
    provinceState: 'KPK',
    country: 'Pakistan',
    taxRegistrationNumber: 'NTN-7719204-1',
    creditLimit: 5000000,
    paymentTerms: 'Weekly Settlement',
    openingBalance: 0,
    openingBalanceType: 'Receivable',
    remarks: 'Cross-border and Northern KPK freight route. Regular cement & essential supply consignments.',
    active: true,
    createdAt: '2026-06-01',
  },
];

const defaultDrivers: Driver[] = [
  {
    id: 'drv-1',
    name: 'Muhammad Aslam',
    fatherName: 'Abdul Ghafoor',
    nationalIdNumber: '42201-1982736-1',
    drivingLicenceNumber: 'HTV-KHI-89210',
    licenceExpiryDate: '2027-08-15',
    dateOfJoining: '2022-03-01',
    mobileNumber: '+92 301 2348910',
    address: 'House 14, St 5, Baldia Town, Karachi',
    basicSalary: 45000,
    allowances: 12000,
    overtime: 6000,
    bonuses: 2000,
    deductions: 0,
    salaryAdvance: 10000,
    netSalary: 55000,
    assignedVehicleId: 'veh-1',
    assignedVehicleNumber: 'TLA-7842',
    employmentStatus: 'Active',
    remarks: 'Senior long-haul driver with 14 years accident-free record.',
    createdAt: '2026-01-01',
  },
  {
    id: 'drv-2',
    name: 'Sher Bahadur Khan',
    fatherName: 'Gulzar Khan',
    nationalIdNumber: '17301-4491028-3',
    drivingLicenceNumber: 'HTV-PESH-39102',
    licenceExpiryDate: '2027-03-20',
    dateOfJoining: '2023-05-15',
    mobileNumber: '+92 334 9102938',
    address: 'Qasba Colony, Manghopir, Karachi',
    basicSalary: 42000,
    allowances: 10000,
    overtime: 4000,
    bonuses: 0,
    deductions: 0,
    salaryAdvance: 5000,
    netSalary: 51000,
    assignedVehicleId: 'veh-2',
    assignedVehicleNumber: 'KBL-9018',
    employmentStatus: 'Active',
    remarks: 'Specialist in 40ft high-cube container haulage.',
    createdAt: '2026-01-01',
  },
  {
    id: 'drv-3',
    name: 'Ghulam Mustafa',
    fatherName: 'Bashir Ahmed',
    nationalIdNumber: '35202-8819204-7',
    drivingLicenceNumber: 'HTV-LHR-51209',
    licenceExpiryDate: '2026-11-30',
    dateOfJoining: '2024-01-10',
    mobileNumber: '+92 315 7820192',
    address: 'Babu Sabu Truck Stand Quarters, Lahore',
    basicSalary: 40000,
    allowances: 8000,
    overtime: 3000,
    bonuses: 1000,
    deductions: 0,
    salaryAdvance: 0,
    netSalary: 52000,
    assignedVehicleId: 'veh-3',
    assignedVehicleNumber: 'LXZ-3310',
    employmentStatus: 'Active',
    remarks: 'Punctual driver, runs Punjab - Sindh corridor.',
    createdAt: '2026-01-01',
  },
  {
    id: 'drv-4',
    name: 'Nazar Hussain',
    fatherName: 'Khuda Bakhsh',
    nationalIdNumber: '31304-2098411-5',
    drivingLicenceNumber: 'HTV-RYK-10294',
    licenceExpiryDate: '2028-01-15',
    dateOfJoining: '2024-08-01',
    mobileNumber: '+92 306 9182301',
    address: 'Sadiqabad Bypass Colony, Rahim Yar Khan',
    basicSalary: 38000,
    allowances: 8000,
    overtime: 2000,
    bonuses: 0,
    deductions: 0,
    salaryAdvance: 0,
    netSalary: 48000,
    assignedVehicleId: 'veh-4',
    assignedVehicleNumber: 'GL-5521',
    employmentStatus: 'Active',
    remarks: 'Flatbed heavy equipment and cement carrier driver.',
    createdAt: '2026-01-01',
  },
  {
    id: 'drv-5',
    name: 'Bashir Khan',
    fatherName: 'Gul Khan',
    nationalIdNumber: '14301-2918204-1',
    drivingLicenceNumber: 'HTV-KHT-44910',
    licenceExpiryDate: '2028-04-10',
    dateOfJoining: '2025-02-15',
    mobileNumber: '+92 300 4411990',
    address: 'Kohat Gate, Cantt Road, Kohat',
    basicSalary: 38000,
    allowances: 0,
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    salaryAdvance: 0,
    netSalary: 38000,
    employmentStatus: 'Active',
    remarks: 'Standby / Float Driver (Not allotted to any vehicle)',
    createdAt: '2026-02-15',
  },
  {
    id: 'drv-6',
    name: 'Dilawar Shah',
    fatherName: 'Syed Noor Shah',
    nationalIdNumber: '21302-8819203-9',
    drivingLicenceNumber: 'HTV-PRC-10291',
    licenceExpiryDate: '2027-09-25',
    dateOfJoining: '2025-05-01',
    mobileNumber: '+92 333 8877112',
    address: 'Main Bazaar, Parachinar',
    basicSalary: 36000,
    allowances: 0,
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    salaryAdvance: 0,
    netSalary: 36000,
    employmentStatus: 'Active',
    remarks: 'Standby / Float Driver (Not allotted to any vehicle) - Kurram route',
    createdAt: '2026-05-01',
  },
  {
    id: 'drv-7',
    name: 'Arifullah Bangash',
    fatherName: 'Sher Afzal Bangash',
    nationalIdNumber: '14201-9921024-5',
    drivingLicenceNumber: 'HTV-KHT-77291',
    licenceExpiryDate: '2027-11-15',
    dateOfJoining: '2023-01-10',
    mobileNumber: '+92 332 9918273',
    address: 'Bangash House, Hangu Road, Kohat',
    basicSalary: 44000,
    allowances: 10000,
    overtime: 4000,
    bonuses: 1000,
    deductions: 0,
    salaryAdvance: 0,
    netSalary: 59000,
    assignedVehicleId: 'veh-6',
    assignedVehicleNumber: 'GLTA8991',
    employmentStatus: 'Active',
    remarks: 'Prime Mover Trailer Master Driver',
    createdAt: '2026-01-01',
  },
];

const defaultVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    vehicleNumber: 'TLA-7842',
    registrationNumber: 'REG-TRK-7842-SD',
    name: 'Volvo FH460 6x4 Heavy Prime Mover',
    vehicleType: '40ft Container Trailer',
    sizeCapacity: '40 Metric Tons (40ft HQ)',
    makeModel: 'Volvo FH460 2021',
    manufacturingYear: 2021,
    chassisNumber: 'YV2RT40A8MB198421',
    engineNumber: 'D13K460-EU6-891024',
    registrationExpiryDate: '2027-04-10',
    insuranceExpiryDate: '2027-02-15',
    fitnessCertificateExpiryDate: '2026-11-20',
    assignedDriverId: 'drv-1',
    assignedDriverName: 'Muhammad Aslam',
    ownership: 'Owned',
    status: 'On Trip',
    notes: 'Equipped with GPS tracker #TK-1082 and dual fuel tanks (800L).',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-2',
    vehicleNumber: 'KBL-9018',
    registrationNumber: 'REG-TRK-9018-SD',
    name: 'Hino 700 Series Heavy Cargo Hauler',
    vehicleType: '20ft/40ft Multi-Axle Trailer',
    sizeCapacity: '35 Metric Tons',
    makeModel: 'Hino Profia 700 2020',
    manufacturingYear: 2020,
    chassisNumber: 'JHDFS1EP7LA209182',
    engineNumber: 'E13C-TL-449102',
    registrationExpiryDate: '2027-01-30',
    insuranceExpiryDate: '2026-12-31',
    fitnessCertificateExpiryDate: '2026-12-15',
    assignedDriverId: 'drv-2',
    assignedDriverName: 'Sher Bahadur Khan',
    ownership: 'Owned',
    status: 'Available',
    notes: 'Recently serviced engine oil and new Michelin drive axle tyres.',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-3',
    vehicleNumber: 'LXZ-3310',
    registrationNumber: 'REG-TRK-3310-PB',
    name: 'Isuzu Giga 10-Wheeler Box Truck',
    vehicleType: 'Covered Box Body',
    sizeCapacity: '22 Metric Tons / 55 CBM',
    makeModel: 'Isuzu Giga CXZ 2019',
    manufacturingYear: 2019,
    chassisNumber: 'JALCYZ52V6700192',
    engineNumber: '6WG1-TCN-781902',
    registrationExpiryDate: '2026-12-30',
    insuranceExpiryDate: '2026-11-15',
    fitnessCertificateExpiryDate: '2026-10-25', // Expiring soon (< 30 days)
    assignedDriverId: 'drv-3',
    assignedDriverName: 'Ghulam Mustafa',
    ownership: 'Owned',
    status: 'On Trip',
    notes: 'Waterproof high security lock box body. Ideal for FMCG and textiles.',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-4',
    vehicleNumber: 'GL-5521',
    registrationNumber: 'REG-TRK-5521-ICT',
    name: 'FAW J5P Heavy Flatbed Trailer',
    vehicleType: 'Tri-Axle Flatbed Trailer',
    sizeCapacity: '45 Metric Tons',
    makeModel: 'FAW J5P 420HP 2022',
    manufacturingYear: 2022,
    chassisNumber: 'LFW7XACF4NA019482',
    engineNumber: 'CA6DM2-42E4-901824',
    registrationExpiryDate: '2027-06-15',
    insuranceExpiryDate: '2027-05-20',
    fitnessCertificateExpiryDate: '2027-03-10',
    assignedDriverId: 'drv-4',
    assignedDriverName: 'Nazar Hussain',
    ownership: 'Owned',
    status: 'Available',
    notes: 'Heavy duty twist-locks and side stanchions for structural cargo.',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-5',
    vehicleNumber: 'MN-4409',
    registrationNumber: 'REG-TRK-4409-PB',
    name: 'Master Foton Auman 25-Ton Truck',
    vehicleType: 'Open High-Side Cargo Truck',
    sizeCapacity: '25 Metric Tons',
    makeModel: 'Foton Auman GTL 2021',
    manufacturingYear: 2021,
    chassisNumber: 'LFV3BCAC8MA889102',
    engineNumber: 'ISGe4-380-601924',
    registrationExpiryDate: '2027-02-18',
    insuranceExpiryDate: '2027-01-10',
    fitnessCertificateExpiryDate: '2027-01-05',
    ownership: 'Attached',
    status: 'Under Maintenance',
    notes: 'Contractor attached vehicle. Currently replacing brake boosters.',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-6',
    vehicleNumber: 'GLTA8991',
    registrationNumber: 'REG-TRK-8991-KPK',
    name: 'Dongfeng KL 420 Prime Mover',
    vehicleType: 'Tri-Axle 50-Ton Trailer',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'Dongfeng KL 2022',
    manufacturingYear: 2022,
    chassisNumber: 'LGD6K42018899120',
    engineNumber: 'dCi420-51-99124',
    registrationExpiryDate: '2027-08-20',
    insuranceExpiryDate: '2027-04-15',
    fitnessCertificateExpiryDate: '2027-03-30',
    assignedDriverId: 'drv-7',
    assignedDriverName: 'Arifullah Bangash',
    ownership: 'Owned',
    status: 'Available',
    notes: 'Primary heavy trailer for Kohat - Parachinar corridor.',
    createdAt: '2026-01-01',
  },
  {
    id: 'veh-7',
    vehicleNumber: 'TMF-622',
    registrationNumber: 'REG-TRK-0622-MKT',
    name: 'Bedford TM Market Heavy Carrier',
    vehicleType: 'High-Side Cargo Trailer',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'Bedford Heavy 2018',
    manufacturingYear: 2018,
    chassisNumber: 'BDF990214820622',
    engineNumber: 'ISB6-280-99014',
    registrationExpiryDate: '2026-12-31',
    insuranceExpiryDate: '2026-11-30',
    fitnessCertificateExpiryDate: '2026-11-15',
    ownership: 'Market',
    status: 'Available',
    notes: 'Attached market contractor vehicle from Kohat Truck Stand.',
    createdAt: '2026-02-01',
  },
  {
    id: 'veh-8',
    vehicleNumber: 'TMK-129',
    registrationNumber: 'REG-TRK-0129-MKT',
    name: 'Hino Super Dolphin Market Truck',
    vehicleType: 'Multi-Axle Cargo Carrier',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'Hino Super Dolphin 2019',
    manufacturingYear: 2019,
    chassisNumber: 'HIN77019280129',
    engineNumber: 'P11C-881920',
    registrationExpiryDate: '2027-03-15',
    insuranceExpiryDate: '2027-02-28',
    fitnessCertificateExpiryDate: '2027-01-20',
    ownership: 'Market',
    status: 'Available',
    notes: 'Market vehicle attached on freight split terms.',
    createdAt: '2026-02-10',
  },
  {
    id: 'veh-9',
    vehicleNumber: 'GLTD-2757',
    registrationNumber: 'REG-TRK-2757-KPK',
    name: 'FAW J6P 460HP Heavy Hauler',
    vehicleType: 'Tri-Axle Lowbed Trailer',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'FAW J6P 2023',
    manufacturingYear: 2023,
    chassisNumber: 'LFW6XACF4PA275701',
    engineNumber: 'CA6DM3-50E5-27571',
    registrationExpiryDate: '2028-01-10',
    insuranceExpiryDate: '2027-10-15',
    fitnessCertificateExpiryDate: '2027-09-01',
    ownership: 'Owned',
    status: 'Available',
    notes: 'Company-owned prime mover. Driver unallotted (standby).',
    createdAt: '2026-03-01',
  },
  {
    id: 'veh-10',
    vehicleNumber: 'AA-625',
    registrationNumber: 'REG-TRK-0625-MKT',
    name: 'Nissan Diesel UD Market Rig',
    vehicleType: 'Flatbed Heavy Carrier',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'UD Quon 2020',
    manufacturingYear: 2020,
    chassisNumber: 'NC89102830625',
    engineNumber: 'GH11-420-0625',
    registrationExpiryDate: '2027-05-10',
    insuranceExpiryDate: '2027-04-20',
    fitnessCertificateExpiryDate: '2027-03-15',
    ownership: 'Market',
    status: 'Available',
    notes: 'Third party market truck on spot charter.',
    createdAt: '2026-03-15',
  },
  {
    id: 'veh-11',
    vehicleNumber: 'AA-525',
    registrationNumber: 'REG-TRK-0525-MKT',
    name: 'Isuzu Giga Heavy Forwarder',
    vehicleType: 'Multi-Axle Flatbed Carrier',
    sizeCapacity: '50 Metric Tons',
    makeModel: 'Isuzu Giga 2021',
    manufacturingYear: 2021,
    chassisNumber: 'ISZ88192040525',
    engineNumber: '6WG1-525-8819',
    registrationExpiryDate: '2027-06-25',
    insuranceExpiryDate: '2027-05-30',
    fitnessCertificateExpiryDate: '2027-04-10',
    ownership: 'Market',
    status: 'Available',
    notes: 'Market attached vehicle.',
    createdAt: '2026-03-20',
  },
];

const defaultTrips: Trip[] = [
  {
    id: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    tripDate: '2026-10-14',
    customerId: 'cust-1',
    customerCompanyName: 'Blue Star Industrial Goods Ltd',
    customerInvoiceNumber: 'BS-PO-9921',
    vehicleId: 'veh-1',
    vehicleNumber: 'TLA-7842',
    vehicleType: '40ft Container Trailer',
    vehicleSize: '40 Metric Tons (40ft HQ)',
    driverId: 'drv-1',
    driverName: 'Muhammad Aslam',
    driverIdNumber: '42201-1982736-1',
    driverContactNumber: '+92 301 2348910',
    bdNumber: 'BL-889102-SD',
    startingLocation: 'Port Qasim Terminal, Karachi',
    destinationLocation: 'Sundar Industrial Estate, Lahore',
    additionalLocations: 'Hyderabad Toll, Sukkur Bypass',
    startingDateTime: '2026-10-14 09:00',
    expectedDeliveryDateTime: '2026-10-17 14:00',
    actualCompletionDateTime: '2026-10-17 12:30',
    goodsDescription: 'Industrial Heavy Machinery Spare Parts (Containerized)',
    goodsQuantity: 32,
    quantityUnit: 'Metric Tons',
    freightRate: 7500,
    rateType: 'Per Unit',
    totalFreightAmount: 240000,
    advanceReceived: 100000,
    outstandingFreightAmount: 140000,
    status: 'Invoiced',
    financials: {
      grossFreightRevenue: 240000,
      loadingCharges: 8000,
      unloadingCharges: 6000,
      fuelExpenses: 78000,
      driverAllowance: 12000,
      tollTaxes: 14500,
      roadTaxes: 2500,
      vehicleRepairMaintenance: 4000,
      parkingCharges: 1500,
      foodAccommodation: 3000,
      routeOtherExpenses: 2000,
      advancePaidToDriver: 15000,
      otherDirectCosts: 1000,
      totalTripExpenses: 130000,
      netTripProfit: 110000,
      profitMarginPercentage: 45.83,
    },
    remarks: 'Delivered in pristine condition. Customer invoice issued.',
    createdAt: '2026-10-14 08:30:00',
    updatedAt: '2026-10-17 18:00:00',
  },
  {
    id: 'trip-2',
    tripNumber: 'TRP-2026-0002',
    tripDate: '2026-10-16',
    customerId: 'cust-2',
    customerCompanyName: 'Apex FMCG Distributors',
    customerInvoiceNumber: 'AF-DISP-4102',
    vehicleId: 'veh-3',
    vehicleNumber: 'LXZ-3310',
    vehicleType: 'Covered Box Body',
    vehicleSize: '22 Metric Tons / 55 CBM',
    driverId: 'drv-3',
    driverName: 'Ghulam Mustafa',
    driverIdNumber: '35202-8819204-7',
    driverContactNumber: '+92 315 7820192',
    bdNumber: 'BL-889103-SD',
    startingLocation: 'Korangi Warehouse, Karachi',
    destinationLocation: 'I-9 Industrial Dry Port, Islamabad',
    additionalLocations: 'Faisalabad transit check',
    startingDateTime: '2026-10-16 11:00',
    expectedDeliveryDateTime: '2026-10-19 18:00',
    actualCompletionDateTime: '2026-10-19 16:45',
    goodsDescription: 'High Value Confectionery & Packaged Edibles',
    goodsQuantity: 18,
    quantityUnit: 'Metric Tons',
    freightRate: 9800,
    rateType: 'Per Unit',
    totalFreightAmount: 176400,
    advanceReceived: 80000,
    outstandingFreightAmount: 96400,
    status: 'Delivered', // Automatically triggers POD record!
    financials: {
      grossFreightRevenue: 176400,
      loadingCharges: 5000,
      unloadingCharges: 4000,
      fuelExpenses: 56000,
      driverAllowance: 9000,
      tollTaxes: 11000,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 2000,
      parkingCharges: 1000,
      foodAccommodation: 2500,
      routeOtherExpenses: 1200,
      advancePaidToDriver: 10000,
      otherDirectCosts: 800,
      totalTripExpenses: 94000,
      netTripProfit: 82400,
      profitMarginPercentage: 46.71,
    },
    remarks: 'Delivered on Oct 19. Awaiting POD verification from receiving manager.',
    createdAt: '2026-10-16 10:00:00',
    updatedAt: '2026-10-19 17:00:00',
  },
  {
    id: 'trip-3',
    tripNumber: 'TRP-2026-0003',
    tripDate: '2026-10-18',
    customerId: 'cust-4',
    customerCompanyName: 'Orient Textiles Mills Ltd',
    customerInvoiceNumber: 'OTM-EXP-889',
    vehicleId: 'veh-1',
    vehicleNumber: 'TLA-7842',
    vehicleType: '40ft Container Trailer',
    vehicleSize: '40 Metric Tons (40ft HQ)',
    driverId: 'drv-1',
    driverName: 'Muhammad Aslam',
    driverIdNumber: '42201-1982736-1',
    driverContactNumber: '+92 301 2348910',
    bdNumber: 'BL-889104-PB',
    startingLocation: 'Kot Lakhpat Mill Gate, Lahore',
    destinationLocation: 'QICT Port Qasim, Karachi',
    additionalLocations: 'Multan bypass fuel stop',
    startingDateTime: '2026-10-18 16:00',
    expectedDeliveryDateTime: '2026-10-21 20:00',
    goodsDescription: 'Export Grade Cotton Yarn & Grey Fabric Cartons',
    goodsQuantity: 26,
    quantityUnit: 'Metric Tons',
    freightRate: 8200,
    rateType: 'Per Unit',
    totalFreightAmount: 213200,
    advanceReceived: 100000,
    outstandingFreightAmount: 113200,
    status: 'In Transit',
    financials: {
      grossFreightRevenue: 213200,
      loadingCharges: 7000,
      unloadingCharges: 5000,
      fuelExpenses: 65000,
      driverAllowance: 10000,
      tollTaxes: 13000,
      roadTaxes: 2000,
      vehicleRepairMaintenance: 1500,
      parkingCharges: 1000,
      foodAccommodation: 2000,
      routeOtherExpenses: 1000,
      advancePaidToDriver: 12000,
      otherDirectCosts: 500,
      totalTripExpenses: 108000,
      netTripProfit: 105200,
      profitMarginPercentage: 49.34,
    },
    remarks: 'En route south on M-5 Motorway near Rahim Yar Khan.',
    createdAt: '2026-10-18 14:00:00',
    updatedAt: '2026-10-20 18:00:00',
  },
  {
    id: 'trip-4',
    tripNumber: 'TRP-2026-0004',
    tripDate: '2026-10-20',
    customerId: 'cust-3',
    customerCompanyName: 'Falcon Cement & Building Materials',
    customerInvoiceNumber: 'FC-CHAL-1029',
    vehicleId: 'veh-4',
    vehicleNumber: 'GL-5521',
    vehicleType: 'Tri-Axle Flatbed Trailer',
    vehicleSize: '45 Metric Tons',
    driverId: 'drv-4',
    driverName: 'Nazar Hussain',
    driverIdNumber: '31304-2098411-5',
    driverContactNumber: '+92 306 9182301',
    bdNumber: 'BL-889105-SD',
    startingLocation: 'Nooriabad Cement Factory, Sindh',
    destinationLocation: 'Sukkur Wholesale Terminal, Sukkur',
    additionalLocations: 'Hyderabad bypass',
    startingDateTime: '2026-10-20 08:00',
    expectedDeliveryDateTime: '2026-10-22 10:00',
    goodsDescription: 'Portland Cement Bags (800 Bags x 50kg)',
    goodsQuantity: 40,
    quantityUnit: 'Metric Tons',
    freightRate: 4200,
    rateType: 'Per Unit',
    totalFreightAmount: 168000,
    advanceReceived: 50000,
    outstandingFreightAmount: 118000,
    status: 'Dispatched',
    financials: {
      grossFreightRevenue: 168000,
      loadingCharges: 4000,
      unloadingCharges: 4000,
      fuelExpenses: 48000,
      driverAllowance: 8000,
      tollTaxes: 8500,
      roadTaxes: 1000,
      vehicleRepairMaintenance: 1000,
      parkingCharges: 500,
      foodAccommodation: 1500,
      routeOtherExpenses: 500,
      advancePaidToDriver: 8000,
      otherDirectCosts: 500,
      totalTripExpenses: 77000,
      netTripProfit: 91000,
      profitMarginPercentage: 54.17,
    },
    remarks: 'Dispatched from factory weighbridge. Loaded within permissible gross axle limits.',
    createdAt: '2026-10-20 07:30:00',
    updatedAt: '2026-10-20 08:30:00',
  },
  {
    id: 'trip-5',
    tripNumber: 'TRP-2026-0005',
    tripDate: '2026-10-21',
    customerId: 'cust-1',
    customerCompanyName: 'Blue Star Industrial Goods Ltd',
    vehicleId: 'veh-2',
    vehicleNumber: 'KBL-9018',
    vehicleType: '20ft/40ft Multi-Axle Trailer',
    vehicleSize: '35 Metric Tons',
    driverId: 'drv-2',
    driverName: 'Sher Bahadur Khan',
    driverIdNumber: '17301-4491028-3',
    driverContactNumber: '+92 334 9102938',
    bdNumber: 'BL-889106-SD',
    startingLocation: 'Hub Industrial Area, Balochistan',
    destinationLocation: 'Peshawar Industrial Estate, Hayatabad',
    startingDateTime: '2026-10-22 08:00',
    expectedDeliveryDateTime: '2026-10-25 18:00',
    goodsDescription: 'Industrial Chemicals & Raw Polymers (Drummed)',
    goodsQuantity: 30,
    quantityUnit: 'Metric Tons',
    freightRate: 9200,
    rateType: 'Per Unit',
    totalFreightAmount: 276000,
    advanceReceived: 0,
    outstandingFreightAmount: 276000,
    status: 'Planned',
    financials: {
      grossFreightRevenue: 276000,
      loadingCharges: 6000,
      unloadingCharges: 5000,
      fuelExpenses: 85000,
      driverAllowance: 14000,
      tollTaxes: 16000,
      roadTaxes: 3000,
      vehicleRepairMaintenance: 2000,
      parkingCharges: 1500,
      foodAccommodation: 3500,
      routeOtherExpenses: 1500,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 137500,
      netTripProfit: 138500,
      profitMarginPercentage: 50.18,
    },
    remarks: 'Scheduled for loading tomorrow morning at Hub Gate 2.',
    createdAt: '2026-10-21 00:15:00',
    updatedAt: '2026-10-21 00:15:00',
  },
  {
    id: 'trip-6',
    tripNumber: 'TRP-2026-0006',
    tripDate: '2026-06-01',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-6',
    vehicleNumber: 'GLTA8991',
    vehicleType: 'Tri-Axle 50-Ton Trailer',
    vehicleSize: '50 Ton',
    driverId: 'drv-7',
    driverName: 'Arifullah Bangash',
    driverIdNumber: '14201-9921024-5',
    driverContactNumber: '+92 332 9918273',
    bdNumber: '1',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-01 07:00',
    expectedDeliveryDateTime: '2026-06-02 18:00',
    actualCompletionDateTime: '2026-06-02 16:30',
    goodsDescription: 'Commercial Freight & Essential Commodities',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Completed',
    expensesPending: false,
    expensesSettledAt: '2026-06-02 18:00:00',
    tripExpenseItems: [
      { id: 'te-1', name: 'Diesel / Fuel', category: 'Fuel / Diesel', amount: 52000, paymentMethod: 'Cash', note: 'Topaki run fuel' },
      { id: 'te-2', name: 'Toll Tax', category: 'Toll & Road Tax', amount: 4500, paymentMethod: 'Cash', note: 'Kohat Pass & N-55 Toll' },
      { id: 'te-3', name: 'Gate Passes', category: 'Operating Overhead', amount: 2000, paymentMethod: 'Cash', note: 'Terminal clearance' },
      { id: 'te-4', name: 'Fooding Expenses', category: 'Food & Accommodation', amount: 3500, paymentMethod: 'Cash', note: 'Driver food' },
    ],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 52000,
      driverAllowance: 5000,
      tollTaxes: 4500,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 0,
      parkingCharges: 1000,
      foodAccommodation: 3500,
      routeOtherExpenses: 2000,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 70500,
      netTripProfit: 107000,
      profitMarginPercentage: 60.28,
    },
    remarks: 'Trip 1 - Kohat to Topaki consignment. Expenses settled.',
    createdAt: '2026-06-01 06:30:00',
    updatedAt: '2026-06-02 18:00:00',
  },
  {
    id: 'trip-7',
    tripNumber: 'TRP-2026-0007',
    tripDate: '2026-06-02',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-7',
    vehicleNumber: 'TMF-622',
    vehicleType: 'High-Side Cargo Trailer',
    vehicleSize: '50 Ton',
    driverId: 'drv-5',
    driverName: 'Bashir Khan',
    driverIdNumber: '14301-2918204-1',
    driverContactNumber: '+92 300 4411990',
    bdNumber: '10822',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-02 08:00',
    expectedDeliveryDateTime: '2026-06-03 19:00',
    actualCompletionDateTime: '2026-06-03 17:30',
    goodsDescription: 'Commercial Heavy Freight',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Completed',
    expensesPending: false,
    expensesSettledAt: '2026-06-03 19:00:00',
    tripExpenseItems: [
      { id: 'te-5', name: 'Diesel / Fuel', category: 'Fuel / Diesel', amount: 50000, paymentMethod: 'Cash' },
      { id: 'te-6', name: 'Toll Tax', category: 'Toll & Road Tax', amount: 4500, paymentMethod: 'Cash' },
      { id: 'te-7', name: 'Police Expenses', category: 'Operating Overhead', amount: 1500, paymentMethod: 'Cash' },
    ],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 50000,
      driverAllowance: 5000,
      tollTaxes: 4500,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 0,
      parkingCharges: 1000,
      foodAccommodation: 3000,
      routeOtherExpenses: 1500,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 67500,
      netTripProfit: 110000,
      profitMarginPercentage: 61.97,
    },
    remarks: 'Trip 10822 - Delivered and expenses settled.',
    createdAt: '2026-06-02 07:30:00',
    updatedAt: '2026-06-03 19:00:00',
  },
  {
    id: 'trip-8',
    tripNumber: 'TRP-2026-0008',
    tripDate: '2026-06-03',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-8',
    vehicleNumber: 'TMK-129',
    vehicleType: 'Multi-Axle Cargo Carrier',
    vehicleSize: '50 Ton',
    driverId: 'drv-6',
    driverName: 'Dilawar Shah',
    driverIdNumber: '21302-8819203-9',
    driverContactNumber: '+92 333 8877112',
    bdNumber: '10833',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-03 09:00',
    expectedDeliveryDateTime: '2026-06-04 18:00',
    actualCompletionDateTime: '2026-06-04 17:00',
    goodsDescription: 'Consolidated Cargo',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Completed',
    expensesPending: false,
    expensesSettledAt: '2026-06-04 18:00:00',
    tripExpenseItems: [
      { id: 'te-8', name: 'Diesel / Fuel', category: 'Fuel / Diesel', amount: 53000, paymentMethod: 'Cash' },
      { id: 'te-9', name: 'Toll Tax', category: 'Toll & Road Tax', amount: 4500, paymentMethod: 'Cash' },
    ],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 53000,
      driverAllowance: 5000,
      tollTaxes: 4500,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 0,
      parkingCharges: 1000,
      foodAccommodation: 3000,
      routeOtherExpenses: 1000,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 70000,
      netTripProfit: 107500,
      profitMarginPercentage: 60.56,
    },
    remarks: 'Trip 10833 - Consignment delivered successfully.',
    createdAt: '2026-06-03 08:00:00',
    updatedAt: '2026-06-04 18:00:00',
  },
  {
    id: 'trip-9',
    tripNumber: 'TRP-2026-0009',
    tripDate: '2026-06-04',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-9',
    vehicleNumber: 'GLTD-2757',
    vehicleType: 'Tri-Axle Lowbed Trailer',
    vehicleSize: '50 Ton',
    driverId: 'drv-7',
    driverName: 'Arifullah Bangash',
    driverIdNumber: '14201-9921024-5',
    driverContactNumber: '+92 332 9918273',
    bdNumber: '10845',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-04 08:30',
    expectedDeliveryDateTime: '2026-06-05 17:00',
    actualCompletionDateTime: '2026-06-05 16:00',
    goodsDescription: 'Heavy Cargo Consignment',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Delivered',
    expensesPending: true, // VEHICLE CAME BACK -> PENDING TO ADD EXPENSES!
    tripExpenseItems: [],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 0,
      driverAllowance: 0,
      tollTaxes: 0,
      roadTaxes: 0,
      vehicleRepairMaintenance: 0,
      parkingCharges: 0,
      foodAccommodation: 0,
      routeOtherExpenses: 0,
      advancePaidToDriver: 0,
      otherDirectCosts: 0,
      totalTripExpenses: 0,
      netTripProfit: 177500,
      profitMarginPercentage: 100,
    },
    remarks: 'Vehicle returned from Topaki. Pending to add route expenses.',
    createdAt: '2026-06-04 08:00:00',
    updatedAt: '2026-06-05 16:30:00',
  },
  {
    id: 'trip-10',
    tripNumber: 'TRP-2026-0010',
    tripDate: '2026-06-05',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-10',
    vehicleNumber: 'AA-625',
    vehicleType: 'Flatbed Heavy Carrier',
    vehicleSize: '50 Ton',
    driverId: 'drv-5',
    driverName: 'Bashir Khan',
    driverIdNumber: '14301-2918204-1',
    driverContactNumber: '+92 300 4411990',
    bdNumber: '10847',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-05 09:00',
    expectedDeliveryDateTime: '2026-06-06 18:00',
    actualCompletionDateTime: '2026-06-06 16:30',
    goodsDescription: 'General Goods Delivery',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Delivered',
    expensesPending: true, // PENDING TO ADD EXPENSES!
    tripExpenseItems: [],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 0,
      driverAllowance: 0,
      tollTaxes: 0,
      roadTaxes: 0,
      vehicleRepairMaintenance: 0,
      parkingCharges: 0,
      foodAccommodation: 0,
      routeOtherExpenses: 0,
      advancePaidToDriver: 0,
      otherDirectCosts: 0,
      totalTripExpenses: 0,
      netTripProfit: 177500,
      profitMarginPercentage: 100,
    },
    remarks: 'Vehicle returned to depot. Pending to add route expenses.',
    createdAt: '2026-06-05 08:30:00',
    updatedAt: '2026-06-06 17:00:00',
  },
  {
    id: 'trip-11',
    tripNumber: 'TRP-2026-0011',
    tripDate: '2026-06-06',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-11',
    vehicleNumber: 'AA-525',
    vehicleType: 'Multi-Axle Flatbed Carrier',
    vehicleSize: '50 Ton',
    driverId: 'drv-6',
    driverName: 'Dilawar Shah',
    driverIdNumber: '21302-8819203-9',
    driverContactNumber: '+92 333 8877112',
    bdNumber: '10849',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-06 08:00',
    expectedDeliveryDateTime: '2026-06-07 17:00',
    actualCompletionDateTime: '2026-06-07 16:00',
    goodsDescription: 'Consolidated Bulk Load',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Delivered',
    expensesPending: true, // PENDING TO ADD EXPENSES!
    tripExpenseItems: [],
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 0,
      driverAllowance: 0,
      tollTaxes: 0,
      roadTaxes: 0,
      vehicleRepairMaintenance: 0,
      parkingCharges: 0,
      foodAccommodation: 0,
      routeOtherExpenses: 0,
      advancePaidToDriver: 0,
      otherDirectCosts: 0,
      totalTripExpenses: 0,
      netTripProfit: 177500,
      profitMarginPercentage: 100,
    },
    remarks: 'Delivered at Topaki. Vehicle arrived back at base.',
    createdAt: '2026-06-06 07:30:00',
    updatedAt: '2026-06-07 16:30:00',
  },
  {
    id: 'trip-12',
    tripNumber: 'TRP-2026-0012',
    tripDate: '2026-06-07',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-9',
    vehicleNumber: 'GLTD-2757',
    vehicleType: 'Tri-Axle Lowbed Trailer',
    vehicleSize: '50 Ton',
    driverId: 'drv-7',
    driverName: 'Arifullah Bangash',
    driverIdNumber: '14201-9921024-5',
    driverContactNumber: '+92 332 9918273',
    bdNumber: '10850',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-07 09:30',
    expectedDeliveryDateTime: '2026-06-08 19:00',
    goodsDescription: 'Industrial Supplies',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'In Transit',
    expensesPending: false,
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 52000,
      driverAllowance: 5000,
      tollTaxes: 4500,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 0,
      parkingCharges: 1000,
      foodAccommodation: 3000,
      routeOtherExpenses: 1000,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 69000,
      netTripProfit: 108500,
      profitMarginPercentage: 61.12,
    },
    remarks: 'Trip 10850 - En route to Topaki on Kohat Bypass.',
    createdAt: '2026-06-07 09:00:00',
    updatedAt: '2026-06-07 09:30:00',
  },
  {
    id: 'trip-13',
    tripNumber: 'TRP-2026-0013',
    tripDate: '2026-06-08',
    customerId: 'cust-kohat',
    customerCompanyName: 'Kohat Logistics & Forwarding Co.',
    vehicleId: 'veh-7',
    vehicleNumber: 'TMF-622',
    vehicleType: 'High-Side Cargo Trailer',
    vehicleSize: '50 Ton',
    driverId: 'drv-5',
    driverName: 'Bashir Khan',
    driverIdNumber: '14301-2918204-1',
    driverContactNumber: '+92 300 4411990',
    bdNumber: '010854',
    startingLocation: 'KOHAT',
    destinationLocation: 'TOPAKI',
    startingDateTime: '2026-06-08 07:00',
    expectedDeliveryDateTime: '2026-06-09 16:00',
    goodsDescription: 'Consolidated Consignment',
    goodsQuantity: 50,
    quantityUnit: 'Ton',
    freightRate: 3550,
    rateType: 'Per Ton',
    totalFreightAmount: 177500,
    advanceReceived: 0,
    outstandingFreightAmount: 177500,
    status: 'Dispatched',
    expensesPending: false,
    financials: {
      grossFreightRevenue: 177500,
      loadingCharges: 0,
      unloadingCharges: 0,
      fuelExpenses: 50000,
      driverAllowance: 5000,
      tollTaxes: 4500,
      roadTaxes: 1500,
      vehicleRepairMaintenance: 0,
      parkingCharges: 1000,
      foodAccommodation: 3000,
      routeOtherExpenses: 1000,
      advancePaidToDriver: 0,
      otherDirectCosts: 1000,
      totalTripExpenses: 67000,
      netTripProfit: 110500,
      profitMarginPercentage: 62.25,
    },
    remarks: 'Trip 010854 - Dispatched from Kohat terminal.',
    createdAt: '2026-06-08 06:30:00',
    updatedAt: '2026-06-08 07:00:00',
  },
];

const defaultPODs: POD[] = [
  {
    id: 'pod-1',
    podNumber: 'POD-2026-0001',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    customerId: 'cust-1',
    customerName: 'Blue Star Industrial Goods Ltd',
    customerInvoiceNumber: 'BS-PO-9921',
    vehicleNumber: 'TLA-7842',
    driverName: 'Muhammad Aslam',
    goodsDescription: 'Industrial Heavy Machinery Spare Parts (Containerized)',
    quantityDispatched: 32,
    quantityDelivered: 32,
    quantityUnit: 'Metric Tons',
    deliveryLocation: 'Sundar Industrial Estate, Lahore',
    deliveryDateTime: '2026-10-17 12:30',
    receivedBy: 'Tariq Javed',
    receiverDesignation: 'Receiving In-charge / Warehouse Manager',
    receiverContactNumber: '+92 321 4455667',
    deliveryRemarks: 'Seal intact (Seal #SL-88419). No damages observed during crane offloading.',
    shortageDamageDetails: 'Nil / Zero Shortage',
    deliveryConfirmation: true,
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50"><path d="M10 35 Q 40 10, 70 30 T 130 20 T 150 40" fill="none" stroke="%231e3a8a" stroke-width="2.5"/></svg>',
    status: 'Verified',
    verificationDate: '2026-10-17 15:00',
    verifiedBy: 'Suleman Baig (Operations Head)',
    createdAt: '2026-10-17 12:30:00',
    updatedAt: '2026-10-17 15:00:00',
  },
  {
    id: 'pod-2',
    podNumber: 'POD-2026-0002',
    tripId: 'trip-2',
    tripNumber: 'TRP-2026-0002',
    customerId: 'cust-2',
    customerName: 'Apex FMCG Distributors',
    customerInvoiceNumber: 'AF-DISP-4102',
    vehicleNumber: 'LXZ-3310',
    driverName: 'Ghulam Mustafa',
    goodsDescription: 'High Value Confectionery & Packaged Edibles',
    quantityDispatched: 18,
    quantityDelivered: 18,
    quantityUnit: 'Metric Tons',
    deliveryLocation: 'I-9 Industrial Dry Port, Islamabad',
    deliveryDateTime: '2026-10-19 16:45',
    receivedBy: 'Danish Qureshi',
    receiverDesignation: 'Depot Supervisor',
    receiverContactNumber: '+92 333 1122334',
    deliveryRemarks: 'Arrived on schedule. Physical count matched consignment note.',
    shortageDamageDetails: 'Nil',
    deliveryConfirmation: true,
    status: 'Generated', // Auto generated, awaiting physical signed document upload or verification
    createdAt: '2026-10-19 16:45:00',
    updatedAt: '2026-10-19 16:45:00',
  },
];

const defaultInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0001',
    invoiceDate: '2026-10-17',
    dueDate: '2026-11-16',
    customerId: 'cust-1',
    customerName: 'Blue Star Industrial Goods Ltd',
    customerTaxNumber: 'NTN-1428591-2',
    billingAddress: 'Plot 18, Phase 2, Industrial Estate, Hub',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    vehicleNumber: 'TLA-7842',
    goodsDescription: 'Industrial Heavy Machinery Spare Parts (Containerized)',
    quantity: 32,
    quantityUnit: 'Metric Tons',
    freightRate: 7500,
    freightAmount: 240000,
    loadingUnloadingCharges: 14000,
    additionalCharges: 0,
    discount: 0,
    taxRatePercent: 0,
    taxAmount: 0,
    totalInvoiceAmount: 254000,
    previousOutstandingBalance: 350000,
    amountReceived: 100000, // advance
    remainingBalance: 154000,
    paymentStatus: 'Partially Paid',
    notes: 'Advance of PKR 100,000 adjusted at dispatch. Balance payable within 30 days.',
    createdAt: '2026-10-17 16:00:00',
  },
];

const defaultExpenseVouchers: ExpenseVoucher[] = [
  {
    id: 'exp-1',
    voucherNumber: 'VCH-2026-0001',
    date: '2026-10-14',
    expenseName: 'Diesel Top-up (280L) - Sukkur Bypass Station',
    categoryId: 'cat-fuel',
    categoryName: 'Fuel / Diesel',
    type: 'Direct Trip',
    description: 'Diesel filling 280 Liters for Trip TRP-2026-0001',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    vehicleId: 'veh-1',
    vehicleNumber: 'TLA-7842',
    driverId: 'drv-1',
    driverName: 'Muhammad Aslam',
    payee: 'National Petroleum Fuel Station #42',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    amount: 78000,
    referenceNumber: 'PETRO-44910',
    remarks: 'Approved for M-5 corridor route',
    status: 'Posted',
    createdAt: '2026-10-14 10:00:00',
  },
  {
    id: 'exp-2',
    voucherNumber: 'VCH-2026-0002',
    date: '2026-10-14',
    expenseName: 'Motorway M-9 & M-5 e-Tag & Plaza Toll Taxes',
    categoryId: 'cat-toll',
    categoryName: 'Toll & Road Tax',
    type: 'Direct Trip',
    description: 'Motorway M-9 & M-5 e-tag reload and toll slips',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    vehicleId: 'veh-1',
    vehicleNumber: 'TLA-7842',
    driverId: 'drv-1',
    driverName: 'Muhammad Aslam',
    payee: 'NHA One-Network Toll',
    paymentMethod: 'Cash',
    accountId: 'acc-cash-1',
    amount: 14500,
    referenceNumber: 'TOLL-9921',
    status: 'Posted',
    createdAt: '2026-10-14 11:30:00',
  },
  {
    id: 'exp-3',
    voucherNumber: 'VCH-2026-0003',
    date: '2026-10-16',
    expenseName: 'Diesel Fuel (200L) - Shell Port Station',
    categoryId: 'cat-fuel',
    categoryName: 'Fuel / Diesel',
    type: 'Direct Trip',
    description: 'Diesel fuel 200L for Trip TRP-2026-0002',
    tripId: 'trip-2',
    tripNumber: 'TRP-2026-0002',
    vehicleId: 'veh-3',
    vehicleNumber: 'LXZ-3310',
    driverId: 'drv-3',
    driverName: 'Ghulam Mustafa',
    payee: 'Shell Port Logistics Station',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    amount: 56000,
    referenceNumber: 'SH-89102',
    status: 'Posted',
    createdAt: '2026-10-16 11:15:00',
  },
  {
    id: 'exp-4',
    voucherNumber: 'VCH-2026-0004',
    date: '2026-10-15',
    expenseName: 'Main Terminal & Freight Yard Monthly Rental',
    categoryId: 'cat-office-rent',
    categoryName: 'Office & Warehouse Rent',
    type: 'Operating Overhead',
    description: 'Monthly warehouse yard rental advance (Port Road Yard)',
    payee: 'Al-Haram Real Estate Management',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    amount: 120000,
    referenceNumber: 'RENT-OCT-2026',
    remarks: 'Monthly recurring overhead',
    status: 'Posted',
    createdAt: '2026-10-15 14:00:00',
  },
  {
    id: 'exp-5',
    voucherNumber: 'VCH-2026-0005',
    date: '2026-10-18',
    expenseName: 'Office Dedicated Fiber Broadband & Utilities',
    categoryId: 'cat-utilities',
    categoryName: 'Electricity, Water & Internet',
    type: 'Operating Overhead',
    description: 'High-speed Fiber Internet & Office Utilities',
    payee: 'PTCL Broadband / K-Electric',
    paymentMethod: 'Cash',
    accountId: 'acc-cash-1',
    amount: 18500,
    referenceNumber: 'UTIL-8819',
    status: 'Posted',
    createdAt: '2026-10-18 10:00:00',
  },
];

const defaultTransactions: CashBankTransaction[] = [
  {
    id: 'tx-1',
    voucherNumber: 'TX-2026-0001',
    date: '2026-10-14',
    transactionType: 'Customer Receipt',
    accountId: 'acc-bank-1',
    accountName: 'Standard Chartered - Fleet Corporate A/C',
    amount: 100000,
    partyType: 'Customer',
    partyId: 'cust-1',
    partyName: 'Blue Star Industrial Goods Ltd',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    referenceNumber: 'CHQ-882194',
    description: 'Trip advance received via online bank transfer for TRP-2026-0001',
    postedBy: 'Finance Dept',
    status: 'Posted',
    createdAt: '2026-10-14 09:30:00',
  },
  {
    id: 'tx-2',
    voucherNumber: 'TX-2026-0002',
    date: '2026-10-14',
    transactionType: 'Expense Payment',
    accountId: 'acc-bank-1',
    accountName: 'Standard Chartered - Fleet Corporate A/C',
    amount: 78000,
    partyType: 'Supplier',
    partyId: 'sup-1',
    partyName: 'National Petroleum Fuel Station #42',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    referenceNumber: 'PETRO-44910',
    description: 'Diesel fuel payment for Trip TRP-2026-0001',
    postedBy: 'Fleet Dispatcher',
    status: 'Posted',
    createdAt: '2026-10-14 10:00:00',
  },
  {
    id: 'tx-3',
    voucherNumber: 'TX-2026-0003',
    date: '2026-10-14',
    transactionType: 'Driver Advance',
    accountId: 'acc-cash-1',
    accountName: 'Cash in Hand (Main Terminal Safe)',
    amount: 15000,
    partyType: 'Driver',
    partyId: 'drv-1',
    partyName: 'Muhammad Aslam',
    tripId: 'trip-1',
    tripNumber: 'TRP-2026-0001',
    referenceNumber: 'DRV-ADV-01',
    description: 'Trip pocket expense advance paid to driver Muhammad Aslam',
    postedBy: 'Cashier',
    status: 'Posted',
    createdAt: '2026-10-14 10:15:00',
  },
  {
    id: 'tx-4',
    voucherNumber: 'TX-2026-0004',
    date: '2026-10-16',
    transactionType: 'Customer Receipt',
    accountId: 'acc-bank-2',
    accountName: 'Habib Bank Ltd (HBL) Operations A/C',
    amount: 80000,
    partyType: 'Customer',
    partyId: 'cust-2',
    partyName: 'Apex FMCG Distributors',
    tripId: 'trip-2',
    tripNumber: 'TRP-2026-0002',
    referenceNumber: 'HBL-FT-99182',
    description: 'Freight advance received for trip TRP-2026-0002',
    postedBy: 'Finance Dept',
    status: 'Posted',
    createdAt: '2026-10-16 10:30:00',
  },
  {
    id: 'tx-5',
    voucherNumber: 'TX-2026-0005',
    date: '2026-10-17',
    transactionType: 'Bank-to-Cash Transfer',
    accountId: 'acc-bank-1',
    accountName: 'Standard Chartered - Fleet Corporate A/C',
    targetAccountId: 'acc-cash-1',
    targetAccountName: 'Cash in Hand (Main Terminal Safe)',
    amount: 50000,
    referenceNumber: 'CHQ-SELF-1092',
    description: 'Cash withdrawal from bank to replenish terminal safe cash in hand',
    postedBy: 'Chief Accountant',
    status: 'Posted',
    createdAt: '2026-10-17 11:00:00',
  },
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-14 08:30:00',
    entityType: 'Trip',
    entityId: 'TRP-2026-0001',
    action: 'CREATE',
    details: 'Initial trip planned for Blue Star Industrial Goods Ltd (Vehicle TLA-7842)',
    user: 'System Admin',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-17 12:30:00',
    entityType: 'POD',
    entityId: 'POD-2026-0001',
    action: 'CREATE',
    details: 'Automatic POD generated upon trip delivery at Sundar Industrial Estate, Lahore',
    user: 'Automated Dispatch Trigger',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-17 15:00:00',
    entityType: 'POD',
    entityId: 'POD-2026-0001',
    action: 'VERIFY',
    details: 'POD verified by Suleman Baig with customer receiver confirmation',
    user: 'Suleman Baig',
  },
  {
    id: 'log-4',
    timestamp: '2026-10-17 16:00:00',
    entityType: 'Invoice',
    entityId: 'INV-2026-0001',
    action: 'POST',
    details: 'Freight Invoice INV-2026-0001 issued for PKR 254,000 (PKR 100,000 advance deducted)',
    user: 'Billing Executive',
  },
];

const defaultUsers: UserProfile[] = [
  {
    id: 'user-1',
    username: 'malik.bangash',
    fullName: 'Malik Bangash',
    role: 'Admin',
    title: 'Managing Director & Fleet Owner',
    email: 'md@bangashtransport.com',
    department: 'Executive Board',
    avatarBg: 'bg-amber-600',
    permissions: ['all', 'admin', 'billing', 'fleet', 'workshop', 'expenses', 'reports'],
    pin: '1234',
    status: 'Active',
  },
  {
    id: 'user-2',
    username: 'tariq.khan',
    fullName: 'Tariq Khan',
    role: 'Operations',
    title: 'Senior Operations & Dispatch Lead',
    email: 'tariq.ops@bangashtransport.com',
    department: 'Transport Operations',
    avatarBg: 'bg-blue-600',
    permissions: ['trips_read', 'trips_write', 'fleet_allotment', 'expenses_settle', 'pods'],
    pin: '2222',
    status: 'Active',
  },
  {
    id: 'user-3',
    username: 'rashid.mehmood',
    fullName: 'Rashid Mehmood',
    role: 'Accounts',
    title: 'Senior Billing & Accounts Executive',
    email: 'rashid.accounts@bangashtransport.com',
    department: 'Finance & Audit',
    avatarBg: 'bg-emerald-600',
    permissions: ['invoicing', 'vouchers', 'cash_bank', 'ledgers', 'receivables', 'payables'],
    pin: '3333',
    status: 'Active',
  },
  {
    id: 'user-4',
    username: 'umer.afridi',
    fullName: 'Umer Afridi',
    role: 'Workshop',
    title: 'Fleet & Workshop Technical Supervisor',
    email: 'umer.workshop@bangashtransport.com',
    department: 'Maintenance & Depot',
    avatarBg: 'bg-purple-600',
    permissions: ['vehicles', 'drivers', 'purchases_tyres', 'purchases_parts', 'purchases_diesel', 'purchases_battery'],
    pin: '4444',
    status: 'Active',
  },
  {
    id: 'user-5',
    username: 'suleman.baig',
    fullName: 'Suleman Baig',
    role: 'Operations',
    title: 'POD Verification & Customer Service Officer',
    email: 'suleman.pod@bangashtransport.com',
    department: 'Logistics Operations',
    avatarBg: 'bg-indigo-600',
    permissions: ['pods', 'trips_read', 'customers_read', 'reports'],
    pin: '5555',
    status: 'Active',
  },
  {
    id: 'user-6',
    username: 'farhan.ali',
    fullName: 'Farhan Ali',
    role: 'Operations',
    title: 'Gate Pass & Daily Entries Clerk',
    email: 'farhan.entry@bangashtransport.com',
    department: 'Data Entry & Terminal Dispatch',
    avatarBg: 'bg-cyan-600',
    permissions: ['trips_write', 'trips_read', 'expenses_settle', 'purchases_parts'],
    pin: '6666',
    status: 'Active',
  },
];

const defaultLocations: Location[] = [
  ['Port Qasim Terminal, Karachi', 'Karachi', 'Port / Terminal'],
  ['QICT Port Qasim, Karachi', 'Karachi', 'Port / Terminal'],
  ['Korangi Warehouse, Karachi', 'Karachi', 'Warehouse'],
  ['Nooriabad Cement Factory, Sindh', 'Nooriabad', 'Factory / Plant'],
  ['Hub Industrial Area, Balochistan', 'Hub', 'Factory / Plant'],
  ['Sukkur Wholesale Terminal, Sukkur', 'Sukkur', 'Depot / Yard'],
  ['Sundar Industrial Estate, Lahore', 'Lahore', 'Factory / Plant'],
  ['Kot Lakhpat Mill Gate, Lahore', 'Lahore', 'Factory / Plant'],
  ['I-9 Industrial Dry Port, Islamabad', 'Islamabad', 'Port / Terminal'],
  ['Peshawar Industrial Estate, Hayatabad', 'Peshawar', 'Factory / Plant'],
  ['KOHAT', 'Kohat', 'City'],
  ['TOPAKI', 'Parachinar', 'Depot / Yard'],
].map(([name, city, type], i) => ({
  id: `loc-seed-${i + 1}`,
  name,
  city,
  type: type as Location['type'],
  active: true,
  createdAt: '2026-01-01',
}));

const defaultPurchases: PurchaseItem[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'PUR-2026-0001',
    date: '2026-05-20',
    supplierId: 'sup-2',
    supplierName: 'Al-Madina Heavy Tyres & Workshop',
    category: 'Tyres',
    itemName: 'Bridgestone 315/80R22.5 Heavy Duty Tubeless Radial Tyres (6 Pcs)',
    quantity: 6,
    unit: 'Nos',
    unitPrice: 72000,
    totalAmount: 432000,
    vehicleId: 'veh-6',
    vehicleNumber: 'GLTA8991',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    paidAmount: 432000,
    remainingBalance: 0,
    invoiceBillNumber: 'TYR-99201',
    remarks: 'Drive axle replacement set for Kohat Prime Mover',
    createdAt: '2026-05-20 11:30:00',
  },
  {
    id: 'pur-2',
    purchaseNumber: 'PUR-2026-0002',
    date: '2026-05-25',
    supplierId: 'sup-3',
    supplierName: 'Pak Truck Spare Parts Depot',
    category: 'Parts',
    itemName: 'Wabco Dual Circuit Air Brake Booster & Drum Shoe Kit',
    quantity: 2,
    unit: 'Sets',
    unitPrice: 48000,
    totalAmount: 96000,
    vehicleId: 'veh-9',
    vehicleNumber: 'GLTD-2757',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    accountId: 'acc-cash-1',
    paidAmount: 96000,
    remainingBalance: 0,
    invoiceBillNumber: 'PRT-88214',
    remarks: 'Routine pre-trip brake service parts',
    createdAt: '2026-05-25 15:45:00',
  },
  {
    id: 'pur-3',
    purchaseNumber: 'PUR-2026-0003',
    date: '2026-05-28',
    supplierId: 'sup-1',
    supplierName: 'National Petroleum Fuel Station #42',
    category: 'Diesel',
    itemName: 'Euro-5 Bulk Diesel High Speed (Fuel Bowser 2,500L)',
    quantity: 2500,
    unit: 'Liters',
    unitPrice: 275,
    totalAmount: 687500,
    paymentStatus: 'Partial',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    paidAmount: 400000,
    remainingBalance: 287500,
    invoiceBillNumber: 'PETRO-BULK-410',
    remarks: 'Bulk replenishment for Kohat terminal underground storage',
    createdAt: '2026-05-28 09:15:00',
  },
  {
    id: 'pur-4',
    purchaseNumber: 'PUR-2026-0004',
    date: '2026-06-02',
    supplierId: 'sup-4',
    supplierName: 'Exide & AGS Heavy Batteries Hub',
    category: 'Battery',
    itemName: 'AGS 24V / 200Ah Commercial Heavy Haul Heavy Duty Battery Set',
    quantity: 2,
    unit: 'Sets',
    unitPrice: 38000,
    totalAmount: 76000,
    vehicleId: 'veh-1',
    vehicleNumber: 'TLA-7842',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    accountId: 'acc-cash-1',
    paidAmount: 76000,
    remainingBalance: 0,
    invoiceBillNumber: 'BAT-11029',
    remarks: 'Under 1-year replacement warranty card #AGS-88910',
    createdAt: '2026-06-02 14:00:00',
  },
  {
    id: 'pur-5',
    purchaseNumber: 'PUR-2026-0005',
    date: '2026-06-05',
    supplierId: 'sup-1',
    supplierName: 'National Petroleum Fuel Station #42',
    category: 'Diesel',
    itemName: 'Euro-5 High Speed Diesel (1,200 Liters)',
    quantity: 1200,
    unit: 'Liters',
    unitPrice: 275,
    totalAmount: 330000,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Payable',
    paidAmount: 0,
    remainingBalance: 330000,
    invoiceBillNumber: 'PETRO-67891',
    remarks: 'Weekly credit fill for northern route departures',
    createdAt: '2026-06-05 10:20:00',
  },
  {
    id: 'pur-6',
    purchaseNumber: 'PUR-2026-0006',
    date: '2026-06-07',
    supplierId: 'sup-2',
    supplierName: 'Al-Madina Heavy Tyres & Workshop',
    category: 'Tyres',
    itemName: 'General Tyre 11.00R20 Super Grip Fleet Radial (4 Pcs)',
    quantity: 4,
    unit: 'Nos',
    unitPrice: 58000,
    totalAmount: 232000,
    vehicleId: 'veh-4',
    vehicleNumber: 'GL-5521',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank',
    accountId: 'acc-bank-1',
    paidAmount: 232000,
    remainingBalance: 0,
    invoiceBillNumber: 'TYR-99288',
    remarks: 'Trailer rear axles replacement',
    createdAt: '2026-06-07 16:30:00',
  },
];

class ERPDatabaseService {
  private state: ERPDatabaseState;
  private listeners: Set<() => void> = new Set();
  private onCommitHook?: () => void;

  constructor() {
    this.state = this.emptyState();
  }

  /** Empty database shown before the server data has been loaded after sign-in. */
  private emptyState(): ERPDatabaseState {
    return {
      trips: [], vehicles: [], customers: [], drivers: [], expenseCategories: [], expenseVouchers: [],
      invoices: [], pods: [], accounts: [], transactions: [], suppliers: [], purchases: [], locations: [], users: [],
      activeUserId: '', settings: { ...defaultSettings }, auditLogs: [],
    };
  }

  /** Replace local data with the latest copy from the server (keeps the signed-in user). */
  public hydrate(serverState: any, activeUserId?: string): void {
    const keep = activeUserId ?? this.state.activeUserId;
    const base = this.emptyState();
    const next: any = { ...base };
    for (const k of Object.keys(base)) {
      if (k === 'settings' || k === 'activeUserId') continue;
      next[k] = Array.isArray(serverState?.[k]) ? serverState[k] : [];
    }
    next.settings = { ...defaultSettings, ...(serverState?.settings || {}) };
    if (!next.settings.logoUrl) next.settings.logoUrl = DEFAULT_LOGO;
    next.activeUserId = keep;
    this.state = next as ERPDatabaseState;
    this.notify();
  }

  public setActiveUser(userId: string): void {
    this.state.activeUserId = userId;
    this.notify();
  }

  /** Reload everything from the server (used after a restore / reset). */
  public async reloadFromServer(): Promise<void> {
    const { state } = await api.getState();
    this.hydrate(state);
  }

  public setOnCommitHook(hook: () => void): void {
    this.onCommitHook = hook;
  }


  private commit(auditAction?: { entityType: AuditLog['entityType']; entityId: string; action: AuditLog['action']; details: string }): void {
    if (auditAction) {
      const log: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        entityType: auditAction.entityType,
        entityId: auditAction.entityId,
        action: auditAction.action,
        details: auditAction.details,
        user: this.getActiveUser().fullName || 'Current Operator',
      };
      this.state.auditLogs.unshift(log);
      if (this.state.auditLogs.length > 300) {
        this.state.auditLogs.pop();
      }
    }
    this.notify();
    if (this.onCommitHook) {
      try {
        this.onCommitHook();
      } catch (err) {
        console.error('onCommitHook error:', err);
      }
    }
  }

  public addUser(user: Omit<UserProfile, 'id'>): UserProfile {
    const newUser: UserProfile = {
      ...user,
      id: `user-${Date.now()}`,
      status: user.status || 'Active',
      pin: user.pin,
    };
    this.state.users = this.state.users || [];
    this.state.users.push(newUser);
    this.commit({
      entityType: 'Trip',
      entityId: newUser.username,
      action: 'CREATE',
      details: `Added new user login profile for ${newUser.fullName} (${newUser.role})`,
    });
    return newUser;
  }

  public deleteUser(userId: string): boolean {
    if (this.state.users.length <= 1) return false;
    const index = this.state.users.findIndex((u) => u.id === userId);
    if (index === -1) return false;
    const deleted = this.state.users[index];
    this.state.users.splice(index, 1);
    if (this.state.activeUserId === userId) {
      this.state.activeUserId = this.state.users[0].id;
    }
    this.commit({
      entityType: 'Trip',
      entityId: deleted.username,
      action: 'DELETE',
      details: `Deleted user profile ${deleted.fullName}`,
    });
    return true;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  // --- GETTERS ---
  public getState(): ERPDatabaseState {
    return this.state;
  }

  public getTrips(): Trip[] {
    return [...this.state.trips];
  }

  public getTripById(id: string): Trip | undefined {
    return this.state.trips.find((t) => t.id === id);
  }

  public getVehicles(): Vehicle[] {
    return [...this.state.vehicles];
  }

  public getCustomers(): Customer[] {
    return [...this.state.customers];
  }

  public getDrivers(): Driver[] {
    return [...this.state.drivers];
  }

  public getLocations(): Location[] {
    return [...(this.state.locations || [])];
  }

  public getExpenseCategories(): ExpenseCategory[] {
    return [...this.state.expenseCategories];
  }

  public getExpenseVouchers(): ExpenseVoucher[] {
    return [...this.state.expenseVouchers];
  }

  public getInvoices(): Invoice[] {
    return [...this.state.invoices];
  }

  public getPODs(): POD[] {
    return [...this.state.pods];
  }

  public getAccounts(): BankAccount[] {
    return [...this.state.accounts];
  }

  public getTransactions(): CashBankTransaction[] {
    return [...this.state.transactions];
  }

  public getSuppliers(): Supplier[] {
    return [...this.state.suppliers];
  }

  public getPurchases(): PurchaseItem[] {
    return [...(this.state.purchases || [])];
  }

  public getUsers(): UserProfile[] {
    return [...(this.state.users || [])];
  }

  public getActiveUser(): UserProfile {
    const found = (this.state.users || []).find((u) => u.id === this.state.activeUserId);
    return found || this.state.users[0] || defaultUsers[0];
  }

  public switchUser(userId: string): UserProfile {
    const user = (this.state.users || []).find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    this.state.activeUserId = userId;
    this.notify();
    return user;
  }

  public updateUser(userId: string, updates: Partial<UserProfile>): UserProfile {
    const index = (this.state.users || []).findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    this.state.users[index] = { ...this.state.users[index], ...updates };
    this.commit({
      entityType: 'Trip',
      entityId: this.state.users[index].username,
      action: 'UPDATE',
      details: `Updated user profile for ${this.state.users[index].fullName} (${this.state.users[index].role})`,
    });
    return this.state.users[index];
  }

  public isActiveUserAdmin(): boolean {
    return this.getActiveUser().role === 'Admin';
  }

  public getTripsPendingExpenses(): Trip[] {
    return this.state.trips.filter((t) => t.expensesPending === true);
  }

  public getUninvoicedTrips(customerId?: string): Trip[] {
    return this.state.trips.filter((t) => {
      const notInvoiced = !t.invoiceId && t.status !== 'Invoiced' && t.status !== 'Cancelled';
      if (!notInvoiced) return false;
      if (customerId && t.customerId !== customerId) return false;
      return true;
    });
  }

  public getSettings(): CompanySettings {
    return { ...this.state.settings };
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }

  // --- NUMBER GENERATORS ---
  public generateNextPurchaseNumber(): string {
    const prefix = 'PUR-2026-';
    const existing = (this.state.purchases || []).map((p) => p.purchaseNumber);
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public generateNextTripNumber(): string {
    const prefix = this.state.settings.tripPrefix || 'TRP-2026-';
    const existing = this.state.trips.map((t) => t.tripNumber);
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public generateNextInvoiceNumber(): string {
    const prefix = this.state.settings.invoicePrefix || 'INV-2026-';
    const existing = this.state.invoices.map((i) => i.invoiceNumber);
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public generateNextPODNumber(): string {
    const prefix = this.state.settings.podPrefix || 'POD-2026-';
    const existing = this.state.pods.map((p) => p.podNumber);
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public generateNextReceiptNumber(): string {
    const prefix = this.state.settings.receiptPrefix || 'CRV-2026-';
    const existing = this.state.transactions.map((t) => t.voucherNumber);
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public generateNextVoucherNumber(prefixStr?: string): string {
    const prefix = prefixStr || this.state.settings.voucherPrefix || 'VCH-2026-';
    const existing = [
      ...this.state.expenseVouchers.map((v) => v.voucherNumber),
      ...this.state.transactions.map((t) => t.voucherNumber),
    ];
    let max = 0;
    existing.forEach((num) => {
      if (num.startsWith(prefix)) {
        const parsed = parseInt(num.replace(prefix, ''), 10);
        if (!isNaN(parsed) && parsed > max) max = parsed;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  // --- TRIP OPERATIONS ---
  public addTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip {
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Update vehicle status to 'On Trip' if trip is Dispatched or In Transit
    if (['Dispatched', 'In Transit'].includes(newTrip.status)) {
      const veh = this.state.vehicles.find((v) => v.id === newTrip.vehicleId);
      if (veh) veh.status = 'On Trip';
    }

    // If advance is received, record cash/bank transaction automatically
    if (newTrip.advanceReceived > 0) {
      const defaultAcc = this.state.accounts[0]; // Cash in hand
      const tx: CashBankTransaction = {
        id: `tx-adv-${Date.now()}`,
        voucherNumber: this.generateNextVoucherNumber('TX-2026-'),
        date: newTrip.tripDate,
        transactionType: 'Customer Receipt',
        accountId: defaultAcc.id,
        accountName: defaultAcc.accountName,
        amount: newTrip.advanceReceived,
        partyType: 'Customer',
        partyId: newTrip.customerId,
        partyName: newTrip.customerCompanyName,
        tripId: newTrip.id,
        tripNumber: newTrip.tripNumber,
        referenceNumber: newTrip.bdNumber,
        description: `Advance received against Trip ${newTrip.tripNumber} (${newTrip.goodsDescription})`,
        postedBy: 'System Auto-Post',
        status: 'Posted',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      this.state.transactions.unshift(tx);
      defaultAcc.currentBalance += newTrip.advanceReceived;
    }

    this.state.trips.unshift(newTrip);

    // Rule: Automatic POD creation if marked Delivered immediately
    if (newTrip.status === 'Delivered') {
      this.checkAndGeneratePODForTrip(newTrip);
    }

    this.commit({
      entityType: 'Trip',
      entityId: newTrip.tripNumber,
      action: 'CREATE',
      details: `Created trip ${newTrip.tripNumber} for customer ${newTrip.customerCompanyName}`,
    });

    return newTrip;
  }

  public updateTrip(id: string, updates: Partial<Trip>): Trip {
    const index = this.state.trips.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Trip not found');

    const oldTrip = this.state.trips[index];
    const previousStatus = oldTrip.status;

    const updatedTrip: Trip = {
      ...oldTrip,
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Safe financial recalculation
    updatedTrip.financials = this.recalculateTripFinancials(updatedTrip);
    updatedTrip.outstandingFreightAmount = Math.max(
      0,
      updatedTrip.totalFreightAmount - updatedTrip.advanceReceived
    );

    // Vehicle status coordination
    if (['Dispatched', 'In Transit'].includes(updatedTrip.status)) {
      const veh = this.state.vehicles.find((v) => v.id === updatedTrip.vehicleId);
      if (veh) veh.status = 'On Trip';
    } else if (['Delivered', 'Completed', 'Cancelled'].includes(updatedTrip.status)) {
      const veh = this.state.vehicles.find((v) => v.id === updatedTrip.vehicleId);
      if (veh && veh.status === 'On Trip') veh.status = 'Available';
    }

    this.state.trips[index] = updatedTrip;

    // Automatic POD generation when status transitions to 'Delivered'
    if (previousStatus !== 'Delivered' && updatedTrip.status === 'Delivered') {
      this.checkAndGeneratePODForTrip(updatedTrip);
    }

    this.commit({
      entityType: 'Trip',
      entityId: updatedTrip.tripNumber,
      action: 'UPDATE',
      details: `Updated trip ${updatedTrip.tripNumber} (Status: ${updatedTrip.status})`,
    });

    return updatedTrip;
  }

  public cancelTrip(id: string, reason: string): void {
    const trip = this.state.trips.find((t) => t.id === id);
    if (!trip) throw new Error('Trip not found');

    trip.status = 'Cancelled';
    trip.cancellationReason = reason;
    trip.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Free vehicle
    const veh = this.state.vehicles.find((v) => v.id === trip.vehicleId);
    if (veh && veh.status === 'On Trip') veh.status = 'Available';

    this.commit({
      entityType: 'Trip',
      entityId: trip.tripNumber,
      action: 'CANCEL',
      details: `Trip ${trip.tripNumber} cancelled. Reason: ${reason}`,
    });
  }

  public deleteTrip(id: string): boolean {
    const index = this.state.trips.findIndex((t) => t.id === id);
    if (index === -1) return false;
    const trip = this.state.trips[index];

    // Free assigned vehicle if On Trip
    const veh = this.state.vehicles.find((v) => v.id === trip.vehicleId);
    if (veh && veh.status === 'On Trip') {
      veh.status = 'Available';
    }

    // Remove linked invoices
    this.state.invoices = this.state.invoices.filter((inv) => inv.tripId !== trip.id);

    // Remove linked PODs
    this.state.pods = this.state.pods.filter((pod) => pod.tripId !== trip.id);

    // Remove linked expense vouchers
    this.state.expenseVouchers = this.state.expenseVouchers.filter((exp) => exp.tripId !== trip.id);

    // Remove linked transactions
    this.state.transactions = this.state.transactions.filter((tx) => tx.tripId !== trip.id);

    // Remove trip from state
    this.state.trips.splice(index, 1);

    this.commit({
      entityType: 'Trip',
      entityId: trip.tripNumber,
      action: 'DELETE',
      details: `Deleted trip ${trip.tripNumber} (${trip.customerCompanyName}) and removed linked invoices/vouchers`,
    });

    return true;
  }

  // Safe Financial Calculation for a Trip
  public recalculateTripFinancials(trip: Trip): Trip['financials'] {
    // Sum all direct expenses logged for this trip in expense vouchers
    const tripExpenses = this.state.expenseVouchers.filter(
      (v) => v.tripId === trip.id && v.status === 'Posted' && v.type === 'Direct Trip'
    );

    let fuel = 0;
    let toll = 0;
    let loading = 0;
    let unloading = 0;
    let driverAllowance = 0;
    let repair = 0;
    let parking = 0;
    let food = 0;
    let roadTax = 0;
    let otherDirect = 0;

    tripExpenses.forEach((exp) => {
      const cat = exp.categoryName.toLowerCase();
      if (cat.includes('fuel') || cat.includes('diesel')) fuel += exp.amount;
      else if (cat.includes('toll')) toll += exp.amount;
      else if (cat.includes('loading') && !cat.includes('unloading')) loading += exp.amount;
      else if (cat.includes('unloading')) unloading += exp.amount;
      else if (cat.includes('allowance')) driverAllowance += exp.amount;
      else if (cat.includes('repair') || cat.includes('maintenance')) repair += exp.amount;
      else if (cat.includes('parking') || cat.includes('weigh')) parking += exp.amount;
      else if (cat.includes('food') || cat.includes('stay')) food += exp.amount;
      else if (cat.includes('road') || cat.includes('permit')) roadTax += exp.amount;
      else otherDirect += exp.amount;
    });

    // Check itemized expenses array on trip
    if (trip.tripExpenseItems && trip.tripExpenseItems.length > 0) {
      let itemFuel = 0, itemToll = 0, itemLoading = 0, itemUnloading = 0, itemAllowance = 0, itemRepair = 0, itemParking = 0, itemFood = 0, itemRoadTax = 0, itemOther = 0;
      trip.tripExpenseItems.forEach((item) => {
        const c = `${item.category} ${item.name}`.toLowerCase();
        const amt = Number(item.amount) || 0;
        if (c.includes('fuel') || c.includes('diesel')) itemFuel += amt;
        else if (c.includes('toll')) itemToll += amt;
        else if (c.includes('loading') && !c.includes('unloading')) itemLoading += amt;
        else if (c.includes('unloading') || c.includes('offload')) itemUnloading += amt;
        else if (c.includes('allowance') || c.includes('kharcha')) itemAllowance += amt;
        else if (c.includes('repair') || c.includes('maint')) itemRepair += amt;
        else if (c.includes('parking') || c.includes('weigh')) itemParking += amt;
        else if (c.includes('food') || c.includes('stay')) itemFood += amt;
        else if (c.includes('road') || c.includes('police') || c.includes('permit') || c.includes('tax')) itemRoadTax += amt;
        else itemOther += amt;
      });
      fuel = Math.max(fuel, itemFuel);
      toll = Math.max(toll, itemToll);
      loading = Math.max(loading, itemLoading);
      unloading = Math.max(unloading, itemUnloading);
      driverAllowance = Math.max(driverAllowance, itemAllowance);
      repair = Math.max(repair, itemRepair);
      parking = Math.max(parking, itemParking);
      food = Math.max(food, itemFood);
      roadTax = Math.max(roadTax, itemRoadTax);
      otherDirect = Math.max(otherDirect, itemOther);
    }

    // If trip was initialized with form direct inputs, merge or use highest of voucher vs pre-estimated
    const f = trip.financials || ({} as any);
    const finalFuel = Math.max(fuel, f.fuelExpenses || 0);
    const finalToll = Math.max(toll, f.tollTaxes || 0);
    const finalLoading = Math.max(loading, f.loadingCharges || 0);
    const finalUnloading = Math.max(unloading, f.unloadingCharges || 0);
    const finalAllowance = Math.max(driverAllowance, f.driverAllowance || 0);
    const finalRepair = Math.max(repair, f.vehicleRepairMaintenance || 0);
    const finalParking = Math.max(parking, f.parkingCharges || 0);
    const finalFood = Math.max(food, f.foodAccommodation || 0);
    const finalRoadTax = Math.max(roadTax, f.roadTaxes || 0);
    const finalOther = Math.max(otherDirect, f.otherDirectCosts || 0);

    const totalTripExpenses =
      finalFuel +
      finalToll +
      finalLoading +
      finalUnloading +
      finalAllowance +
      finalRepair +
      finalParking +
      finalFood +
      finalRoadTax +
      finalOther;

    const grossRevenue = trip.totalFreightAmount || 0;
    const netTripProfit = grossRevenue - totalTripExpenses;
    const profitMarginPercentage =
      grossRevenue > 0 ? Number(((netTripProfit / grossRevenue) * 100).toFixed(2)) : 0;

    return {
      grossFreightRevenue: grossRevenue,
      loadingCharges: finalLoading,
      unloadingCharges: finalUnloading,
      fuelExpenses: finalFuel,
      driverAllowance: finalAllowance,
      tollTaxes: finalToll,
      roadTaxes: finalRoadTax,
      vehicleRepairMaintenance: finalRepair,
      parkingCharges: finalParking,
      foodAccommodation: finalFood,
      routeOtherExpenses: f.routeOtherExpenses || 0,
      advancePaidToDriver: f.advancePaidToDriver || 0,
      otherDirectCosts: finalOther,
      totalTripExpenses,
      netTripProfit,
      profitMarginPercentage,
    };
  }

  // --- AUTOMATIC POD RULE IMPLEMENTATION ---
  public checkAndGeneratePODForTrip(trip: Trip): POD {
    let existing = this.state.pods.find((p) => p.tripId === trip.id);
    if (existing) {
      return existing;
    }

    const podNumber = this.generateNextPODNumber();
    const newPOD: POD = {
      id: `pod-${Date.now()}`,
      podNumber,
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      customerId: trip.customerId,
      customerName: trip.customerCompanyName,
      customerInvoiceNumber: trip.customerInvoiceNumber,
      vehicleNumber: trip.vehicleNumber,
      driverName: trip.driverName,
      goodsDescription: trip.goodsDescription,
      quantityDispatched: trip.goodsQuantity,
      quantityDelivered: trip.goodsQuantity,
      quantityUnit: trip.quantityUnit,
      deliveryLocation: trip.destinationLocation,
      deliveryDateTime: trip.actualCompletionDateTime || new Date().toISOString().replace('T', ' ').substring(0, 16),
      receivedBy: '',
      receiverDesignation: '',
      receiverContactNumber: '',
      deliveryRemarks: 'Automatically generated upon delivery status change',
      deliveryConfirmation: false,
      status: 'Generated', // Status is Generated (distinguished from physically received)
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.state.pods.unshift(newPOD);
    this.commit({
      entityType: 'POD',
      entityId: podNumber,
      action: 'CREATE',
      details: `Automatic POD ${podNumber} created for delivered trip ${trip.tripNumber}`,
    });

    return newPOD;
  }

  public updatePOD(id: string, updates: Partial<POD>): POD {
    const index = this.state.pods.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('POD not found');

    const old = this.state.pods[index];
    const updated: POD = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // If verified, update linked trip's status to 'POD Received' if it was Delivered
    if (updated.status === 'Verified' || updated.status === 'Received') {
      const trip = this.state.trips.find((t) => t.id === updated.tripId);
      if (trip && trip.status === 'Delivered') {
        trip.status = 'POD Received';
      }
    }

    this.state.pods[index] = updated;

    this.commit({
      entityType: 'POD',
      entityId: updated.podNumber,
      action: updated.status === 'Verified' ? 'VERIFY' : updated.status === 'Rejected' ? 'REJECT' : 'UPDATE',
      details: `POD ${updated.podNumber} updated to status: ${updated.status}`,
    });

    return updated;
  }

  // --- INVOICE OPERATIONS ---
  public addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Prevent unintended duplicate billing of same trip without flag
    const existingActive = this.state.invoices.find(
      (i) => i.tripId === newInvoice.tripId && i.paymentStatus !== 'Cancelled'
    );
    if (existingActive) {
      console.warn(`Note: Trip ${newInvoice.tripNumber} already has active Invoice ${existingActive.invoiceNumber}`);
    }

    // Link trip to 'Invoiced' if completed or pod received
    const trip = this.state.trips.find((t) => t.id === newInvoice.tripId);
    if (trip && ['POD Received', 'Delivered'].includes(trip.status)) {
      trip.status = 'Invoiced';
    }

    this.state.invoices.unshift(newInvoice);

    this.commit({
      entityType: 'Invoice',
      entityId: newInvoice.invoiceNumber,
      action: 'POST',
      details: `Generated Freight Invoice ${newInvoice.invoiceNumber} for ${newInvoice.customerName} (Amount: ${newInvoice.totalInvoiceAmount})`,
    });

    return newInvoice;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice {
    const index = this.state.invoices.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Invoice not found');

    const old = this.state.invoices[index];
    const updated: Invoice = {
      ...old,
      ...updates,
    };

    // Calculate balance
    updated.remainingBalance = Math.max(0, updated.totalInvoiceAmount - updated.amountReceived);
    if (updated.remainingBalance === 0) {
      updated.paymentStatus = 'Paid';
    } else if (updated.amountReceived > 0) {
      updated.paymentStatus = 'Partially Paid';
    }

    this.state.invoices[index] = updated;

    this.commit({
      entityType: 'Invoice',
      entityId: updated.invoiceNumber,
      action: 'UPDATE',
      details: `Updated Invoice ${updated.invoiceNumber}. Paid: ${updated.amountReceived}, Balance: ${updated.remainingBalance}`,
    });

    return updated;
  }

  public recordInvoiceReceipt(
    invoiceId: string,
    amount: number,
    accountId: string,
    referenceNo: string,
    remarks: string
  ): void {
    const invoice = this.state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    const account = this.state.accounts.find((a) => a.id === accountId);
    if (!account) throw new Error('Account not found');

    invoice.amountReceived += amount;
    invoice.remainingBalance = Math.max(0, invoice.totalInvoiceAmount - invoice.amountReceived);
    invoice.paymentStatus = invoice.remainingBalance === 0 ? 'Paid' : 'Partially Paid';

    // Account transaction
    const tx: CashBankTransaction = {
      id: `tx-rcpt-${Date.now()}`,
      voucherNumber: this.generateNextVoucherNumber('TX-2026-'),
      date: new Date().toISOString().substring(0, 10),
      transactionType: 'Customer Receipt',
      accountId: account.id,
      accountName: account.accountName,
      amount,
      partyType: 'Customer',
      partyId: invoice.customerId,
      partyName: invoice.customerName,
      tripId: invoice.tripId,
      tripNumber: invoice.tripNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      referenceNumber: referenceNo,
      description: `Payment received against Invoice ${invoice.invoiceNumber}. ${remarks}`,
      postedBy: 'Billing Officer',
      status: 'Posted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    account.currentBalance += amount;
    this.state.transactions.unshift(tx);

    this.commit({
      entityType: 'Invoice',
      entityId: invoice.invoiceNumber,
      action: 'UPDATE',
      details: `Recorded receipt of ${amount} for Invoice ${invoice.invoiceNumber} in ${account.accountName}`,
    });
  }

  public addCustomerReceipt(receiptData: {
    customerId: string;
    customerName: string;
    accountId: string;
    amount: number;
    receiptDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    invoiceId?: string;
    invoiceNumber?: string;
    tripId?: string;
    tripNumber?: string;
    biltyNumber?: string;
    remarks?: string;
    postedBy?: string;
  }): CashBankTransaction {
    const account = this.state.accounts.find((a) => a.id === receiptData.accountId);
    if (!account) throw new Error('Receiving account not found');

    const customer = this.state.customers.find((c) => c.id === receiptData.customerId);
    if (!customer) throw new Error('Customer not found');

    if (receiptData.amount <= 0) {
      throw new Error('Receipt amount must be greater than zero');
    }

    // If linked to an invoice, apply payment
    if (receiptData.invoiceId) {
      const invoice = this.state.invoices.find((i) => i.id === receiptData.invoiceId);
      if (invoice) {
        invoice.amountReceived += receiptData.amount;
        invoice.remainingBalance = Math.max(0, invoice.totalInvoiceAmount - invoice.amountReceived);
        invoice.paymentStatus = invoice.remainingBalance <= 0 ? 'Paid' : 'Partially Paid';
      }
    }

    const nextVoucher = this.generateNextReceiptNumber();
    const tx: CashBankTransaction = {
      id: `tx-crv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      voucherNumber: nextVoucher,
      date: receiptData.receiptDate || new Date().toISOString().substring(0, 10),
      transactionType: 'Customer Receipt',
      accountId: account.id,
      accountName: account.accountName,
      amount: receiptData.amount,
      partyType: 'Customer',
      partyId: customer.id,
      partyName: customer.companyName,
      tripId: receiptData.tripId,
      tripNumber: receiptData.tripNumber,
      invoiceId: receiptData.invoiceId,
      invoiceNumber: receiptData.invoiceNumber,
      referenceNumber: receiptData.referenceNumber || '',
      description:
        receiptData.remarks ||
        `Customer money receipt from ${customer.companyName} (${receiptData.paymentMethod})`,
      postedBy: receiptData.postedBy || this.getActiveUser().fullName || this.getActiveUser().username,
      status: 'Posted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    account.currentBalance += receiptData.amount;
    this.state.transactions.unshift(tx);

    this.commit({
      entityType: 'Transaction',
      entityId: tx.voucherNumber,
      action: 'CREATE',
      details: `Customer Receipt of ${receiptData.amount} from ${customer.companyName} credited to ${account.accountName}`,
    });

    return tx;
  }

  // --- EXPENSE VOUCHER OPERATIONS ---
  public addExpenseVoucher(voucher: Omit<ExpenseVoucher, 'id' | 'createdAt'>): ExpenseVoucher {
    const newVoucher: ExpenseVoucher = {
      ...voucher,
      expenseName: voucher.expenseName || voucher.description || voucher.categoryName,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Deduct from selected account
    const account = this.state.accounts.find((a) => a.id === newVoucher.accountId);
    if (account) {
      account.currentBalance -= newVoucher.amount;
    }

    // Record CashBankTransaction
    const txType: CashBankTransaction['transactionType'] =
      account?.accountType === 'Cash in Hand' || account?.accountType === 'Petty Cash'
        ? 'Cash Payment'
        : 'Bank Payment';

    const tx: CashBankTransaction = {
      id: `tx-exp-${Date.now()}`,
      voucherNumber: newVoucher.voucherNumber,
      date: newVoucher.date,
      transactionType: 'Expense Payment',
      accountId: newVoucher.accountId,
      accountName: account ? account.accountName : 'Cash/Bank',
      amount: newVoucher.amount,
      partyType: 'Supplier',
      partyName: newVoucher.payee,
      tripId: newVoucher.tripId,
      tripNumber: newVoucher.tripNumber,
      referenceNumber: newVoucher.referenceNumber,
      description: `${newVoucher.expenseName} (${newVoucher.categoryName}) - ${newVoucher.description}`,
      postedBy: 'Accounts Payable',
      status: 'Posted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.state.transactions.unshift(tx);

    this.state.expenseVouchers.unshift(newVoucher);

    // If attached to a trip, automatically update trip's financial calculations!
    if (newVoucher.tripId) {
      const trip = this.state.trips.find((t) => t.id === newVoucher.tripId);
      if (trip) {
        trip.financials = this.recalculateTripFinancials(trip);
      }
    }

    this.commit({
      entityType: 'Expense',
      entityId: newVoucher.voucherNumber,
      action: 'POST',
      details: `Posted expense voucher ${newVoucher.voucherNumber} (${newVoucher.categoryName}) for amount ${newVoucher.amount}`,
    });

    return newVoucher;
  }

  // --- BANK / CASH ACCOUNT MANAGEMENT ---
  public addAccount(acc: Omit<BankAccount, 'id' | 'currentBalance'>): BankAccount {
    const opening = Number(acc.openingBalance) || 0;
    const newAcc: BankAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
      openingBalance: opening,
      currentBalance: opening,
    };
    this.state.accounts.push(newAcc);
    this.commit({
      entityType: 'Transaction',
      entityId: newAcc.accountName,
      action: 'CREATE',
      details: `Added ${newAcc.accountType} "${newAcc.accountName}" with opening balance ${opening}`,
    });
    return newAcc;
  }

  /** Edit an account. Changing the opening balance moves the current balance by the same difference. */
  public updateAccount(id: string, updates: Partial<BankAccount>): BankAccount {
    const index = this.state.accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Account not found');
    const old = this.state.accounts[index];
    const next: BankAccount = { ...old, ...updates, id: old.id, currentBalance: old.currentBalance };
    if (updates.openingBalance !== undefined) {
      next.openingBalance = Number(updates.openingBalance) || 0;
      next.currentBalance = old.currentBalance + (next.openingBalance - old.openingBalance);
    }
    this.state.accounts[index] = next;
    this.commit({
      entityType: 'Transaction',
      entityId: next.accountName,
      action: 'UPDATE',
      details: `Updated account "${next.accountName}" (opening balance ${next.openingBalance})`,
    });
    return next;
  }

  /** An account can only be deleted when nothing has been posted to it; otherwise deactivate it. */
  public deleteAccount(id: string): boolean {
    const used =
      this.state.transactions.some((t) => t.accountId === id || t.targetAccountId === id) ||
      this.state.expenseVouchers.some((v) => v.accountId === id);
    if (used) return false;
    const index = this.state.accounts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    const [removed] = this.state.accounts.splice(index, 1);
    this.commit({
      entityType: 'Transaction',
      entityId: removed.accountName,
      action: 'DELETE',
      details: `Deleted account "${removed.accountName}"`,
    });
    return true;
  }

  // --- CASH & BANK TRANSACTIONS ---
  public addCashBankTransaction(tx: Omit<CashBankTransaction, 'id' | 'createdAt'>): CashBankTransaction {
    const newTx: CashBankTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const sourceAcc = this.state.accounts.find((a) => a.id === newTx.accountId);
    const targetAcc = newTx.targetAccountId
      ? this.state.accounts.find((a) => a.id === newTx.targetAccountId)
      : undefined;

    // Handle transfer
    if (newTx.transactionType.includes('Transfer') && sourceAcc && targetAcc) {
      sourceAcc.currentBalance -= newTx.amount;
      targetAcc.currentBalance += newTx.amount;
    } else if (
      newTx.transactionType.includes('Receipt') ||
      newTx.transactionType === 'Opening Balance'
    ) {
      if (sourceAcc) sourceAcc.currentBalance += newTx.amount;
    } else if (newTx.transactionType.includes('Payment') || newTx.transactionType.includes('Advance')) {
      if (sourceAcc) sourceAcc.currentBalance -= newTx.amount;
    }

    this.state.transactions.unshift(newTx);

    this.commit({
      entityType: 'Transaction',
      entityId: newTx.voucherNumber,
      action: 'POST',
      details: `${newTx.transactionType} of ${newTx.amount} on account ${newTx.accountName}`,
    });

    return newTx;
  }

  // --- VEHICLE OPERATIONS ---
  public addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle {
    const newVeh: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    this.state.vehicles.unshift(newVeh);
    this.commit({
      entityType: 'Vehicle',
      entityId: newVeh.vehicleNumber,
      action: 'CREATE',
      details: `Added new vehicle ${newVeh.vehicleNumber} (${newVeh.name})`,
    });
    return newVeh;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    const index = this.state.vehicles.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    this.state.vehicles[index] = { ...this.state.vehicles[index], ...updates };
    this.commit({
      entityType: 'Vehicle',
      entityId: this.state.vehicles[index].vehicleNumber,
      action: 'UPDATE',
      details: `Updated vehicle ${this.state.vehicles[index].vehicleNumber}`,
    });
    return this.state.vehicles[index];
  }

  // --- LOCATION OPERATIONS ---
  public addLocation(loc: Omit<Location, 'id' | 'createdAt'>): Location {
    this.state.locations = this.state.locations || [];
    const name = loc.name.trim();
    if (!name) throw new Error('Location name is required');
    if (this.state.locations.some((l) => l.name.trim().toLowerCase() === name.toLowerCase())) {
      throw new Error(`Location "${name}" already exists`);
    }
    const newLoc: Location = {
      ...loc,
      name,
      id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    this.state.locations.unshift(newLoc);
    this.commit({ entityType: 'Location', entityId: newLoc.name, action: 'CREATE', details: `Added location ${newLoc.name}` });
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<Location>): Location {
    const list = this.state.locations || [];
    const index = list.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Location not found');
    const name = (updates.name ?? list[index].name).trim();
    if (list.some((l) => l.id !== id && l.name.trim().toLowerCase() === name.toLowerCase())) {
      throw new Error(`Location "${name}" already exists`);
    }
    list[index] = { ...list[index], ...updates, name };
    this.commit({ entityType: 'Location', entityId: name, action: 'UPDATE', details: `Updated location ${name}` });
    return list[index];
  }

  public deleteLocation(id: string): void {
    const list = this.state.locations || [];
    const index = list.findIndex((l) => l.id === id);
    if (index === -1) return;
    const [removed] = list.splice(index, 1);
    this.commit({ entityType: 'Location', entityId: removed.name, action: 'DELETE', details: `Deleted location ${removed.name}` });
  }

  // --- CUSTOMER OPERATIONS ---
  public addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    this.state.customers.unshift(newCust);
    this.commit({
      entityType: 'Customer',
      entityId: newCust.companyName,
      action: 'CREATE',
      details: `Added new customer ${newCust.companyName}`,
    });
    return newCust;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const index = this.state.customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    this.state.customers[index] = { ...this.state.customers[index], ...updates };
    this.commit({
      entityType: 'Customer',
      entityId: this.state.customers[index].companyName,
      action: 'UPDATE',
      details: `Updated customer ${this.state.customers[index].companyName}`,
    });
    return this.state.customers[index];
  }

  // --- DRIVER OPERATIONS ---
  public addDriver(driver: Omit<Driver, 'id' | 'createdAt'>): Driver {
    const newDrv: Driver = {
      ...driver,
      id: `drv-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    newDrv.netSalary =
      newDrv.basicSalary +
      newDrv.allowances +
      newDrv.overtime +
      newDrv.bonuses -
      newDrv.deductions;

    this.state.drivers.unshift(newDrv);
    this.commit({
      entityType: 'Driver',
      entityId: newDrv.name,
      action: 'CREATE',
      details: `Registered driver ${newDrv.name}`,
    });
    return newDrv;
  }

  public updateDriver(id: string, updates: Partial<Driver>): Driver {
    const index = this.state.drivers.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Driver not found');
    const old = this.state.drivers[index];
    const updated = { ...old, ...updates };
    updated.netSalary =
      updated.basicSalary +
      updated.allowances +
      updated.overtime +
      updated.bonuses -
      updated.deductions;
    this.state.drivers[index] = updated;
    this.commit({
      entityType: 'Driver',
      entityId: updated.name,
      action: 'UPDATE',
      details: `Updated driver details for ${updated.name}`,
    });
    return updated;
  }

  // --- SUPPLIER OPERATIONS ---
  public addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'currentBalance'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      currentBalance: supplier.openingBalance,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    this.state.suppliers.unshift(newSup);
    this.commit({
      entityType: 'Supplier',
      entityId: newSup.name,
      action: 'CREATE',
      details: `Created supplier ${newSup.name}`,
    });
    return newSup;
  }

  // --- EXPENSE CATEGORY OPERATIONS ---
  public addExpenseCategory(cat: Omit<ExpenseCategory, 'id'>): ExpenseCategory {
    const newCat: ExpenseCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    this.state.expenseCategories.push(newCat);
    this.commit({
      entityType: 'Expense',
      entityId: newCat.name,
      action: 'CREATE',
      details: `Added new expense category ${newCat.name}`,
    });
    return newCat;
  }

  // --- DRIVER ALLOCATION & DEALLOCATION ---
  public allocateDriverToVehicle(vehicleId: string, driverId: string): { vehicle: Vehicle; driver: Driver } {
    const vehicle = this.state.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    const driver = this.state.drivers.find((d) => d.id === driverId);
    if (!driver) throw new Error('Driver not found');

    // If driver was previously assigned to another vehicle, detach from it
    this.state.vehicles.forEach((v) => {
      if (v.assignedDriverId === driver.id && v.id !== vehicle.id) {
        v.assignedDriverId = undefined;
        v.assignedDriverName = undefined;
      }
    });

    // If vehicle had a previous driver, detach vehicle from that driver
    if (vehicle.assignedDriverId) {
      const prevDriver = this.state.drivers.find((d) => d.id === vehicle.assignedDriverId);
      if (prevDriver) {
        prevDriver.assignedVehicleId = undefined;
        prevDriver.assignedVehicleNumber = undefined;
      }
    }

    vehicle.assignedDriverId = driver.id;
    vehicle.assignedDriverName = driver.name;

    driver.assignedVehicleId = vehicle.id;
    driver.assignedVehicleNumber = vehicle.vehicleNumber;

    this.commit({
      entityType: 'Vehicle',
      entityId: vehicle.vehicleNumber,
      action: 'UPDATE',
      details: `Allocated driver ${driver.name} to vehicle ${vehicle.vehicleNumber}`,
    });

    return { vehicle, driver };
  }

  public deallocateDriverFromVehicle(vehicleId: string): Vehicle {
    const vehicle = this.state.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    if (vehicle.assignedDriverId) {
      const driver = this.state.drivers.find((d) => d.id === vehicle.assignedDriverId);
      if (driver) {
        driver.assignedVehicleId = undefined;
        driver.assignedVehicleNumber = undefined;
      }
    }

    const prevDriverName = vehicle.assignedDriverName || 'Driver';
    vehicle.assignedDriverId = undefined;
    vehicle.assignedDriverName = undefined;

    this.commit({
      entityType: 'Vehicle',
      entityId: vehicle.vehicleNumber,
      action: 'UPDATE',
      details: `Deallocated ${prevDriverName} from vehicle ${vehicle.vehicleNumber}`,
    });

    return vehicle;
  }

  // --- TRIP RETURN EXPENSES SETTLEMENT ---
  public settleTripExpenses(
    tripId: string,
    items: Array<{
      name: string;
      amount: number;
      note?: string;
      paymentMethod?: 'Cash' | 'Bank' | 'Payable' | 'Driver Advance';
      payee?: string;
      accountId?: string;
      liters?: number;
    }>
  ): Trip {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const formattedItems = items
      .filter((i) => Number(i.amount) > 0)
      .map((item, idx) => ({
        id: `te-${Date.now()}-${idx}`,
        name: item.name,
        expenseName: item.name,
        category: 'Direct Trip',
        amount: Number(item.amount),
        liters: Number(item.liters) > 0 ? Number(item.liters) : undefined,
        paymentMethod: item.paymentMethod || 'Cash',
        payee: item.payee || trip.driverName || 'Driver / Route Vendor',
        note: item.note || '',
        notes: item.note || '',
      }));

    trip.tripExpenseItems = formattedItems;
    trip.expensesPending = false;
    trip.expensesSettledAt = new Date().toISOString();
    if (trip.status === 'Delivered') {
      trip.status = 'Completed';
    }

    // Post expense vouchers for settled items if account was selected
    formattedItems.forEach((exp) => {
      const account = this.state.accounts.find((a) => a.accountType === 'Cash in Hand') || this.state.accounts[0];
      if (exp.paymentMethod === 'Cash' || exp.paymentMethod === 'Bank') {
        const vch: ExpenseVoucher = {
          id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          voucherNumber: this.generateNextVoucherNumber('VCH-2026-'),
          date: new Date().toISOString().substring(0, 10),
          expenseName: `${exp.name} - ${trip.tripNumber}`,
          categoryId: 'cat-misc',
          categoryName: exp.name,
          type: 'Direct Trip',
          description: `Trip Return Settlement: ${exp.name}. Note: ${exp.note || 'None'}`,
          tripId: trip.id,
          tripNumber: trip.tripNumber,
          vehicleId: trip.vehicleId,
          vehicleNumber: trip.vehicleNumber,
          driverId: trip.driverId,
          driverName: trip.driverName,
          payee: exp.payee || trip.driverName,
          paymentMethod: exp.paymentMethod,
          accountId: account ? account.id : 'acc-cash-1',
          amount: exp.amount,
          remarks: `Return Settlement for Trip ${trip.tripNumber}`,
          status: 'Posted',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        if (account) {
          account.currentBalance -= exp.amount;
        }
        this.state.expenseVouchers.unshift(vch);
      }
    });

    // Recalculate financials
    trip.financials = this.recalculateTripFinancials(trip);

    this.commit({
      entityType: 'Trip',
      entityId: trip.tripNumber,
      action: 'UPDATE',
      details: `Settled ${formattedItems.length} return route expenses for trip ${trip.tripNumber} (Total: ${trip.financials.totalTripExpenses}, Net Profit: ${trip.financials.netTripProfit})`,
    });

    return trip;
  }

  // --- MULTI-TRIP INVOICE CREATION ---
  public createInvoiceFromTrips(data: {
    customerId: string;
    tripIds: string[];
    invoiceDate: string;
    dueDate: string;
    notes?: string;
    taxRatePercent?: number;
  }): Invoice {
    const customer = this.state.customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const tripsToInvoice = this.state.trips.filter(
      (t) => data.tripIds.includes(t.id) && !t.invoiceId
    );

    if (tripsToInvoice.length === 0) {
      throw new Error('No valid uninvoiced trips selected');
    }

    const totalFreight = tripsToInvoice.reduce((sum, t) => sum + (t.totalFreightAmount || 0), 0);
    const totalLoadingUnloading = tripsToInvoice.reduce(
      (sum, t) => sum + ((t.financials?.loadingCharges || 0) + (t.financials?.unloadingCharges || 0)),
      0
    );
    const totalAdvance = tripsToInvoice.reduce((sum, t) => sum + (t.advanceReceived || 0), 0);

    const taxPercent = data.taxRatePercent || 0;
    const taxAmount = (totalFreight * taxPercent) / 100;
    const totalInvoiceAmount = totalFreight + totalLoadingUnloading + taxAmount;
    const remainingBalance = Math.max(0, totalInvoiceAmount - totalAdvance);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: this.generateNextInvoiceNumber(),
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      customerId: customer.id,
      customerName: customer.companyName,
      customerTaxNumber: customer.taxRegistrationNumber,
      billingAddress: customer.billingAddress,
      tripId: tripsToInvoice[0].id,
      tripNumber: tripsToInvoice.map((t) => t.tripNumber).join(', '),
      vehicleNumber: Array.from(new Set(tripsToInvoice.map((t) => t.vehicleNumber))).join(', '),
      goodsDescription: tripsToInvoice.map((t) => `${t.bdNumber ? 'GR#' + t.bdNumber + ': ' : ''}${t.goodsDescription}`).join('; '),
      quantity: tripsToInvoice.reduce((sum, t) => sum + (t.goodsQuantity || 0), 0),
      quantityUnit: tripsToInvoice[0].quantityUnit || 'Ton',
      freightRate: tripsToInvoice[0].freightRate || 0,
      freightAmount: totalFreight,
      loadingUnloadingCharges: totalLoadingUnloading,
      additionalCharges: 0,
      discount: 0,
      taxRatePercent: taxPercent,
      taxAmount,
      totalInvoiceAmount,
      previousOutstandingBalance: customer.openingBalance || 0,
      amountReceived: totalAdvance,
      remainingBalance,
      paymentStatus: remainingBalance === 0 ? 'Paid' : totalAdvance > 0 ? 'Partially Paid' : 'Unpaid',
      notes: data.notes || `Bundled invoice for ${tripsToInvoice.length} consignments (${tripsToInvoice.map(t => 'GR#' + t.bdNumber).join(', ')})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Mark each selected trip as Invoiced and link to invoice ID
    const nowIso = new Date().toISOString();
    tripsToInvoice.forEach((trip) => {
      trip.invoiceId = newInvoice.id;
      trip.invoicedAt = nowIso;
      trip.status = 'Invoiced';
    });

    this.state.invoices.unshift(newInvoice);

    this.commit({
      entityType: 'Invoice',
      entityId: newInvoice.invoiceNumber,
      action: 'CREATE',
      details: `Generated Freight Tax Invoice ${newInvoice.invoiceNumber} for ${customer.companyName} bundling ${tripsToInvoice.length} trips`,
    });

    return newInvoice;
  }

  // --- PURCHASES (TYRES, PARTS, DIESEL, BATTERY) ---
  public addPurchase(purchase: Omit<PurchaseItem, 'id' | 'createdAt'>): PurchaseItem {
    const newPurchase: PurchaseItem = {
      ...purchase,
      id: `pur-${Date.now()}`,
      purchaseNumber: purchase.purchaseNumber || this.generateNextPurchaseNumber(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // If paid or partial, deduct from account and record transaction
    if (newPurchase.paidAmount > 0 && newPurchase.accountId) {
      const account = this.state.accounts.find((a) => a.id === newPurchase.accountId);
      if (account) {
        account.currentBalance -= newPurchase.paidAmount;
      }
      const tx: CashBankTransaction = {
        id: `tx-pur-${Date.now()}`,
        voucherNumber: this.generateNextVoucherNumber('TX-2026-'),
        date: newPurchase.date,
        transactionType: 'Supplier Payment',
        accountId: newPurchase.accountId,
        accountName: account?.accountName || 'Cash/Bank Account',
        amount: newPurchase.paidAmount,
        partyType: 'Supplier',
        partyId: newPurchase.supplierId,
        partyName: newPurchase.supplierName,
        referenceNumber: newPurchase.invoiceBillNumber || newPurchase.purchaseNumber,
        description: `Purchase of ${newPurchase.category}: ${newPurchase.itemName} (${newPurchase.quantity} ${newPurchase.unit})`,
        postedBy: 'Workshop / Procurement',
        status: 'Posted',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      this.state.transactions.unshift(tx);
    }

    // Update supplier balance if there is a remaining unpaid amount
    if (newPurchase.remainingBalance > 0) {
      const supplier = this.state.suppliers.find((s) => s.id === newPurchase.supplierId);
      if (supplier) {
        supplier.currentBalance += newPurchase.remainingBalance;
      }
    }

    this.state.purchases.unshift(newPurchase);

    this.commit({
      entityType: 'Purchase',
      entityId: newPurchase.purchaseNumber,
      action: 'CREATE',
      details: `Recorded purchase of ${newPurchase.category} from ${newPurchase.supplierName} for amount PKR ${newPurchase.totalAmount}`,
    });

    return newPurchase;
  }

  public updatePurchase(id: string, updates: Partial<PurchaseItem>): PurchaseItem {
    const index = (this.state.purchases || []).findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Purchase item not found');
    this.state.purchases[index] = { ...this.state.purchases[index], ...updates };
    this.commit({
      entityType: 'Purchase',
      entityId: this.state.purchases[index].purchaseNumber,
      action: 'UPDATE',
      details: `Updated purchase ${this.state.purchases[index].purchaseNumber}`,
    });
    return this.state.purchases[index];
  }

  public deletePurchase(id: string): void {
    const index = (this.state.purchases || []).findIndex((p) => p.id === id);
    if (index === -1) return;
    const item = this.state.purchases[index];
    this.state.purchases.splice(index, 1);
    this.commit({
      entityType: 'Purchase',
      entityId: item.purchaseNumber,
      action: 'DELETE',
      details: `Deleted purchase record ${item.purchaseNumber}`,
    });
  }

  // --- SETTINGS ---
  public updateSettings(settings: Partial<CompanySettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.commit();
  }

  // --- BACKUP & RESTORE ---
  public exportDatabaseJSON(): string {
    const { activeUserId, ...rest } = this.state as any;
    return JSON.stringify(rest, null, 2);
  }

  /** Restore a backup file: validated here, then replaced on the server (admin only). */
  public importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.trips && parsed.customers && parsed.vehicles && parsed.accounts) {
        api
          .restore(parsed)
          .then(() => this.reloadFromServer())
          .catch((err) => window.alert(`Restore failed: ${err.message}`));
        return true;
      }
    } catch (err) {
      console.error('Import error:', err);
    }
    return false;
  }

  /** Replace business data with the built-in demo dataset (admin only; logins are kept). */
  public resetToDemo(): void {
    api
      .resetDemo()
      .then(() => this.reloadFromServer())
      .catch((err) => window.alert(`Reset failed: ${err.message}`));
  }
}

export const dbService = new ERPDatabaseService();

/** Built-in demo dataset. Not used by the app at runtime; scripts/dump-seed.ts exports it for the server seed. */
export function buildDemoState(): ERPDatabaseState {
  return {
    trips: defaultTrips,
    vehicles: defaultVehicles,
    customers: defaultCustomers,
    drivers: defaultDrivers,
    expenseCategories: defaultExpenseCategories,
    expenseVouchers: defaultExpenseVouchers,
    invoices: defaultInvoices,
    pods: defaultPODs,
    accounts: defaultAccounts,
    transactions: defaultTransactions,
    suppliers: defaultSuppliers,
    purchases: defaultPurchases,
    locations: defaultLocations,
    users: defaultUsers,
    activeUserId: 'user-1',
    settings: defaultSettings,
    auditLogs: defaultAuditLogs,
  };
}
