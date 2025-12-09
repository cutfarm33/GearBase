
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

export type UserRole = 'Admin' | 'Producer' | 'Director' | 'DP' | 'Gaffer' | 'Grip' | 'AC' | 'PA' | 'Crew';

export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Organization {
  id: string; // UUID
  name: string;
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
  assignedToId?: string; // Changed to string (UUID)
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
    type: TransactionType;
    date: string;
    condition: ItemCondition;
    notes?: string;
}

export interface ViewState {
  view: 'LANDING' | 'LOGIN' | 'SIGNUP' | 'VERIFY_EMAIL' | 'EMAIL_CONFIRMED' | 'DASHBOARD' | 'JOB_LIST' | 'JOB_DETAIL' | 'INVENTORY' | 'ITEM_DETAIL' | 'CHECKOUT' | 'CHECKIN' | 'ADD_ITEM' | 'IMPORT_INVENTORY' | 'ADD_JOB' | 'EDIT_JOB' | 'PACKAGES' | 'PACKAGE_FORM' | 'TEAM' | 'TEAM_MANAGEMENT' | 'ACCEPT_INVITATION' | 'CALENDAR' | 'FEATURES' | 'PRICING' | 'HELP' | 'ABOUT' | 'CONTACT';
  params?: any;
}

export type Theme = 'light' | 'dark';

// Standard Industry Categories
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