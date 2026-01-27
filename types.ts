
export enum ItemCondition {
  GOOD = 'Good',
  USED = 'Used but OK',
  DAMAGED = 'Damage Noted',
  IN_REPAIR = 'In Repair',
  LOST = 'Lost',
  RETIRED = 'Retired',
}

export enum ItemStatus {
  AVAILABLE = 'Available',
  CHECKED_OUT = 'Checked Out',
  IN_MAINTENANCE = 'In Maintenance',
  UNAVAILABLE = 'Unavailable',
}

export enum JobStatus {
  UPCOMING = 'Upcoming',
  IN_PROGRESS = 'In Progress',
  WRAPPED = 'Wrapped',
  CANCELED = 'Canceled',
}

export enum TransactionType {
  CHECKOUT = 'Check-out',
  CHECKIN = 'Check-in',
}

// Expense Categories for Receipt Tracking (matching production spreadsheet)
export enum ExpenseCategory {
  SUPPLIES = 'Supplies',
  TAXI_TRAIN_BUS = 'Taxi/Train/Bus',
  GAS = 'Gas',
  TOLLS = 'Tolls',
  PARKING = 'Parking',
  MEALS_TRAVEL = 'Meals Travel',
  CRAFTY = 'Crafty',
  CLIENT_MEALS = 'Client Meals',
  HOTEL = 'Hotel',
  CAR_RENTAL = 'Car Rental',
  TIPS_GRATUITIES = 'Tips & Gratuities',
  AIR_TRAVEL = 'Air Travel',
  EQUIPMENT_RENTAL = 'Equipment Rental',
  MILEAGE = 'Mileage',
  OTHER = 'Other',
}

// Payment Methods for Receipt Tracking
export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  COMPANY_CARD = 'Company Card',
  PERSONAL_CARD = 'Personal Card',
  VENMO = 'Venmo',
  PAYPAL = 'PayPal',
  CHECK = 'Check',
  WIRE_TRANSFER = 'Wire Transfer',
  OTHER = 'Other',
}

export type UserRole = 'Admin' | 'Producer' | 'Director' | 'DP' | 'Gaffer' | 'Grip' | 'AC' | 'PA' | 'Crew';

export type SubscriptionTier = 'free' | 'founder' | 'pro' | 'team' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Vertical type for multi-use-case support
export type Vertical = 'film' | 'music' | 'photo' | 'general';

export interface Organization {
  id: string; // UUID
  name: string;
  vertical: Vertical; // Use case: film, music, photo, general
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  owner_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  invited_by?: string;
  joined_at: string;
  // Expanded fields when joined with other tables
  organization?: Organization;
  user?: User;
}

export interface Invitation {
  id: string;
  email: string;
  organization_id: string;
  invited_by?: string;
  role: OrganizationRole;
  token: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  // Expanded fields when joined
  organization?: Organization;
  inviter?: User;
}

export interface User {
  id: string; // Changed to string (UUID)
  name: string;
  role: UserRole;
  email: string;
  organization_id: string; // UUID - links to Organization (legacy - for migration)
  active_organization_id?: string; // Currently active organization
  theme?: Theme; // User's preferred theme (light/dark)
  verificationCode?: string; // Added for verification mock
  // Password and verification are handled by Supabase Auth internally
}

// Custom fields for instrument-specific data (stored in JSONB)
export interface InstrumentCustomFields {
  make?: string;           // Brand (Fender, Gibson, etc.)
  model?: string;          // Model name (Stratocaster, Les Paul)
  year?: number;           // Year manufactured
  serial_number?: string;  // Serial number for insurance/provenance
  finish?: string;         // Color/finish (Sunburst, Natural)
  insurance_value?: number; // Insurance value (may differ from purchase price)
  provenance?: string;     // History/previous owners
  lens_mount?: string;     // For cameras (Canon RF, Sony E, etc.)
  sensor_size?: string;    // For cameras (Full Frame, APS-C, etc.)
  firmware_version?: string;
  acquisition_date?: string;
  acquisition_source?: string;
  [key: string]: string | number | undefined; // Allow any additional fields
}

export interface InventoryItem {
  id: number;
  name: string;
  qrCode: string;
  category: string;
  status: ItemStatus;
  condition: ItemCondition;
  notes?: string;
  purchaseDate?: string;
  value?: number;
  weight?: number; // Weight in lbs
  storageCase?: string; // Case or Bin location
  history: TransactionLog[];
  imageUrl: string;
  organization_id: string; // UUID - links to Organization
  custom_fields?: InstrumentCustomFields; // Vertical-specific fields (instruments, cameras, etc.)
}

export interface Kit {
  id: number;
  name: string;
  itemIds: number[];
  organization_id: string; // UUID - links to Organization
}

export interface Job {
  id: number;
  name: string;
  producerId: string; // Changed to string (UUID)
  startDate: string;
  endDate: string;
  startTime?: string; // e.g. "19:00" for 7 PM
  soundCheckTime?: string; // e.g. "17:00" for 5 PM sound check
  status: JobStatus;
  gearList: { itemId: number }[];
  organization_id: string; // UUID - links to Organization
}

export interface TransactionItem {
  itemId: number;
  startCondition: ItemCondition;
  endCondition?: ItemCondition;
  notes?: string;
  photos?: string[]; // URLs to images
  isMissing?: boolean;
}

export interface Transaction {
  id: number;
  jobId: number | null;
  type: TransactionType;
  userId: string; // Changed to string (UUID)
  assignedToId?: string; // Changed to string (UUID) - for registered users
  assignedToName?: string; // Free-text name for anyone (including non-registered people)
  timestamp: string;
  items: TransactionItem[];
  signature?: string; // Data URL of signature
  organization_id: string; // UUID - links to Organization
}

export interface TransactionLog {
    transactionId: number;
    jobId: number | null;
    userId: string;
    assignedToId?: string;
    assignedToName?: string; // Free-text name for who has the item
    type: TransactionType;
    date: string;
    condition: ItemCondition;
    notes?: string;
}

// Receipt Interface for Expense Tracking
export interface Receipt {
  id: number;
  organization_id: string;
  job_id: number | null;
  user_id: string;           // The crew member the expense is for
  submitted_by_id: string;   // Who entered the receipt (may differ if admin adds)

  amount: number;
  description: string;
  expense_date: string;      // ISO date string YYYY-MM-DD
  category: ExpenseCategory;
  vendor_name?: string;
  payment_method: PaymentMethod;
  receipt_image_url?: string;
  notes?: string;
  mileage_miles?: number;    // Number of miles (for Mileage category, auto-calculates amount)

  created_at: string;
  updated_at?: string;

  // Expanded fields from joins (optional)
  user?: User;
  submitted_by?: User;
  job?: Job;
}

export interface ViewState {
  view: 'LANDING' | 'LOGIN' | 'SIGNUP' | 'VERIFY_EMAIL' | 'EMAIL_CONFIRMED' | 'RESET_PASSWORD' | 'DASHBOARD' | 'JOB_LIST' | 'JOB_DETAIL' | 'INVENTORY' | 'ITEM_DETAIL' | 'CHECKOUT' | 'CHECKIN' | 'ADD_ITEM' | 'IMPORT_INVENTORY' | 'ADD_JOB' | 'EDIT_JOB' | 'PACKAGES' | 'PACKAGE_FORM' | 'TEAM' | 'TEAM_MANAGEMENT' | 'ACCEPT_INVITATION' | 'CALENDAR' | 'FEATURES' | 'PRICING' | 'HELP' | 'ABOUT' | 'CONTACT' | 'PRIVACY' | 'TERMS' | 'RECEIPTS' | 'ADD_RECEIPT' | 'LOANS' | 'ADD_LOAN' | 'GALLERY_SETTINGS' | 'PUBLIC_GALLERY' | 'CHECKOUT_SUCCESS';
  params?: any;
}

export type Theme = 'light' | 'dark';

// Standard Industry Categories (Film - default)
// Note: For vertical-specific categories, use getCategoriesForVertical() from lib/verticalConfig
export const PREDEFINED_CATEGORIES = [
  'Cameras',
  'Lenses',
  'Lighting',
  'G&E', // Added specific request
  'Grip',
  'Electric',
  'Audio',
  'Monitors',
  'Support', // Tripods, Gimbals, etc
  'Batteries & Power',
  'Media', // Cards, Drives
  'Cables',
  'Drones',
  'Cases',
  'Computers',
  'Production Supplies',
  'Vehicles',
  'Expendables'
];

// ============================================
// MULTI-VERTICAL SUPPORT TYPES
// ============================================

// Simple Loan for Music/General verticals (no signatures required)
export type LoanStatus = 'active' | 'returned' | 'overdue';

export interface Loan {
  id: number;
  organization_id: string;
  item_id: number;
  borrower_name: string;
  borrower_contact?: string;
  notes?: string;
  loan_date: string;          // ISO date string YYYY-MM-DD
  expected_return_date?: string;
  actual_return_date?: string;
  status: LoanStatus;
  created_by?: string;        // User ID who created the loan
  created_at: string;
  updated_at?: string;
  // Expanded fields from joins
  item?: InventoryItem;
}

// Public Gallery for shareable collection views
export type GalleryVisibilityMode = 'all' | 'selected';

export interface PublicGallery {
  id: string;                 // UUID
  organization_id: string;
  token: string;              // Unique shareable token
  name: string;
  description?: string;
  is_enabled: boolean;
  visibility_mode: GalleryVisibilityMode;
  visible_item_ids: number[]; // Only used when visibility_mode is 'selected'
  theme: Theme;
  show_values: boolean;       // Whether to display item values
  show_condition: boolean;    // Whether to display item condition
  created_at: string;
  updated_at?: string;
}