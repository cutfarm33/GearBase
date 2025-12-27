/**
 * Vertical Configuration for Gearbase
 *
 * This file defines the configuration for each vertical (use case):
 * - Film/Video Production
 * - Music/Instruments
 * - Photography
 * - General Collection
 *
 * Each vertical has its own categories, roles, terminology, and feature flags.
 */

export type Vertical = 'film' | 'music' | 'photo' | 'general';

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: string[];  // For select type
  placeholder?: string;
}

export interface VerticalConfig {
  id: Vertical;
  name: string;
  description: string;
  icon: string;  // Lucide icon name

  // Terminology - how we refer to things in this vertical
  terminology: {
    job: string;        // Job | Session | Shoot | Project
    jobPlural: string;  // Jobs | Sessions | Shoots | Projects
    checkout: string;   // Check Out | Loan | Borrow
    checkin: string;    // Check In | Return
    producer: string;   // Producer | Bandleader | Lead Photographer | Owner
    gearList: string;   // Gear List | Equipment | Kit
  };

  // Categories available for this vertical
  defaultCategories: string[];

  // Roles available for team members
  defaultRoles: string[];

  // Feature toggles
  features: {
    jobs: boolean;              // Show Jobs/Sessions functionality
    signatures: boolean;        // Require signatures on checkout
    simpleLoans: boolean;       // Enable simple loan tracking
    customFields: boolean;      // Show vertical-specific custom fields
    publicGallery: boolean;     // Enable public gallery sharing
    receipts: boolean;          // Enable expense/receipt tracking
    calendar: boolean;          // Show calendar view
    packages: boolean;          // Enable kit/package grouping
    qrCodes: boolean;           // Show QR code features
  };

  // Custom field definitions for inventory items in this vertical
  customFieldDefinitions: CustomFieldDefinition[];
}

export const VERTICAL_CONFIGS: Record<Vertical, VerticalConfig> = {
  film: {
    id: 'film',
    name: 'Film & Video Production',
    description: 'Professional equipment tracking for film, video, and broadcast production',
    icon: 'Film',
    terminology: {
      job: 'Job',
      jobPlural: 'Jobs',
      checkout: 'Check Out',
      checkin: 'Check In',
      producer: 'Producer',
      gearList: 'Gear List',
    },
    defaultCategories: [
      'Cameras',
      'Lenses',
      'Lighting',
      'G&E',
      'Grip',
      'Electric',
      'Audio',
      'Monitors',
      'Support',
      'Batteries & Power',
      'Media',
      'Cables',
      'Drones',
      'Cases',
      'Computers',
      'Production Supplies',
      'Vehicles',
      'Expendables',
    ],
    defaultRoles: ['Admin', 'Producer', 'Director', 'DP', 'Gaffer', 'Grip', 'AC', 'PA', 'Crew'],
    features: {
      jobs: true,
      signatures: true,
      simpleLoans: false,
      customFields: false,
      publicGallery: true,
      receipts: true,
      calendar: true,
      packages: true,
      qrCodes: true,
    },
    customFieldDefinitions: [],
  },

  music: {
    id: 'music',
    name: 'Music & Instruments',
    description: 'Track your instrument collection, loans, and service history',
    icon: 'Music',
    terminology: {
      job: 'Session',
      jobPlural: 'Sessions',
      checkout: 'Loan',
      checkin: 'Return',
      producer: 'Bandleader',
      gearList: 'Equipment',
    },
    defaultCategories: [
      'Electric Guitars',
      'Acoustic Guitars',
      'Bass Guitars',
      'Drums & Percussion',
      'Keyboards & Piano',
      'Synthesizers',
      'Strings',
      'Brass',
      'Woodwinds',
      'Amplifiers',
      'Pedals & Effects',
      'Microphones',
      'Audio Interfaces',
      'Cables',
      'Cases',
      'Accessories',
      'Sheet Music',
      'Recording Equipment',
      'DJ Equipment',
      'Vintage',
    ],
    defaultRoles: ['Admin', 'Bandleader', 'Musician', 'Tech', 'Manager', 'Member'],
    features: {
      jobs: true,          // Sessions for gigs/recordings
      signatures: false,   // Optional for loans
      simpleLoans: true,   // Enable simple loan tracking
      customFields: true,  // Show instrument fields
      publicGallery: true,
      receipts: false,
      calendar: true,
      packages: true,
      qrCodes: true,
    },
    customFieldDefinitions: [
      { key: 'make', label: 'Make/Brand', type: 'text', placeholder: 'e.g., Fender, Gibson, Martin' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Stratocaster, Les Paul' },
      { key: 'year', label: 'Year', type: 'number', placeholder: 'e.g., 1962' },
      { key: 'serial_number', label: 'Serial Number', type: 'text', placeholder: 'For insurance & provenance' },
      { key: 'finish', label: 'Finish/Color', type: 'text', placeholder: 'e.g., Sunburst, Natural' },
      { key: 'insurance_value', label: 'Insurance Value ($)', type: 'number', placeholder: 'Current insured value' },
      { key: 'provenance', label: 'Provenance/History', type: 'textarea', placeholder: 'Previous owners, notable history' },
    ],
  },

  photo: {
    id: 'photo',
    name: 'Photography',
    description: 'Manage camera bodies, lenses, lighting, and studio equipment',
    icon: 'Camera',
    terminology: {
      job: 'Shoot',
      jobPlural: 'Shoots',
      checkout: 'Check Out',
      checkin: 'Check In',
      producer: 'Lead Photographer',
      gearList: 'Kit',
    },
    defaultCategories: [
      'Camera Bodies',
      'Lenses',
      'Flashes & Strobes',
      'Light Modifiers',
      'Continuous Lighting',
      'Tripods & Monopods',
      'Gimbals & Stabilizers',
      'Backgrounds',
      'Memory Cards',
      'Batteries & Chargers',
      'Bags & Cases',
      'Filters',
      'Cables & Tethering',
      'Props',
      'Studio Equipment',
      'Drones',
      'Computers',
      'Printers',
    ],
    defaultRoles: ['Admin', 'Lead Photographer', 'Photographer', 'Assistant', 'Retoucher', 'Studio Manager'],
    features: {
      jobs: true,
      signatures: true,
      simpleLoans: true,
      customFields: true,
      publicGallery: true,
      receipts: true,
      calendar: true,
      packages: true,
      qrCodes: true,
    },
    customFieldDefinitions: [
      { key: 'make', label: 'Make/Brand', type: 'text', placeholder: 'e.g., Canon, Nikon, Sony' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g., EOS R5, Z9' },
      { key: 'serial_number', label: 'Serial Number', type: 'text' },
      {
        key: 'lens_mount',
        label: 'Lens Mount',
        type: 'select',
        options: ['Canon EF', 'Canon RF', 'Nikon F', 'Nikon Z', 'Sony E', 'Sony A', 'Fuji X', 'Fuji GFX', 'Micro 4/3', 'Leica M', 'Leica L', 'Hasselblad', 'Other']
      },
      { key: 'sensor_size', label: 'Sensor Size', type: 'select', options: ['Full Frame', 'APS-C', 'Micro 4/3', 'Medium Format', '1-inch', 'Other'] },
      { key: 'firmware_version', label: 'Firmware Version', type: 'text' },
    ],
  },

  general: {
    id: 'general',
    name: 'General Collection',
    description: 'Track any type of equipment or collection',
    icon: 'Package',
    terminology: {
      job: 'Project',
      jobPlural: 'Projects',
      checkout: 'Borrow',
      checkin: 'Return',
      producer: 'Owner',
      gearList: 'Items',
    },
    defaultCategories: [
      'Electronics',
      'Tools',
      'Sports Equipment',
      'Camping & Outdoor',
      'Books',
      'Art Supplies',
      'Kitchen',
      'Furniture',
      'Vehicles',
      'Collectibles',
      'Games',
      'Clothing',
      'Jewelry',
      'Antiques',
      'Other',
    ],
    defaultRoles: ['Admin', 'Owner', 'Manager', 'Member'],
    features: {
      jobs: false,         // Pure catalog mode
      signatures: false,
      simpleLoans: true,
      customFields: true,
      publicGallery: true,
      receipts: false,
      calendar: false,
      packages: true,
      qrCodes: true,
    },
    customFieldDefinitions: [
      { key: 'make', label: 'Make/Brand', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'serial_number', label: 'Serial Number', type: 'text' },
      { key: 'acquisition_date', label: 'Acquisition Date', type: 'date' },
      { key: 'acquisition_source', label: 'Acquired From', type: 'text', placeholder: 'Where/who you got it from' },
    ],
  },
};

/**
 * Get the configuration for a specific vertical
 */
export const getVerticalConfig = (vertical: Vertical): VerticalConfig => {
  return VERTICAL_CONFIGS[vertical] || VERTICAL_CONFIGS.general;
};

/**
 * Get all verticals as an array (useful for selection UI)
 */
export const getAllVerticals = (): VerticalConfig[] => {
  return Object.values(VERTICAL_CONFIGS);
};

/**
 * Check if a feature is enabled for a vertical
 */
export const isFeatureEnabled = (vertical: Vertical, feature: keyof VerticalConfig['features']): boolean => {
  const config = getVerticalConfig(vertical);
  return config.features[feature];
};

/**
 * Get terminology for a vertical
 */
export const getTerminology = (vertical: Vertical): VerticalConfig['terminology'] => {
  return getVerticalConfig(vertical).terminology;
};

/**
 * Get categories for a vertical
 */
export const getCategoriesForVertical = (vertical: Vertical): string[] => {
  return getVerticalConfig(vertical).defaultCategories;
};

/**
 * Get roles for a vertical
 */
export const getRolesForVertical = (vertical: Vertical): string[] => {
  return getVerticalConfig(vertical).defaultRoles;
};

/**
 * Get custom field definitions for a vertical
 */
export const getCustomFieldsForVertical = (vertical: Vertical): CustomFieldDefinition[] => {
  return getVerticalConfig(vertical).customFieldDefinitions;
};
