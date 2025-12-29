// Demo data based on real production gear inventory
// This data is loaded when new users want to try the app with sample data

import { ItemStatus, ItemCondition, JobStatus } from '../types';

export interface DemoInventoryItem {
  name: string;
  category: string;
  status: ItemStatus;
  condition: ItemCondition;
  value?: number;
  weight?: number;
  storageCase?: string;
  notes?: string;
  qrCode: string;
}

export interface DemoJob {
  name: string;
  status: JobStatus;
  startDate: string;
  endDate: string;
}

export interface DemoKit {
  name: string;
  itemNames: string[]; // Will be resolved to IDs after items are created
}

export const demoInventory: DemoInventoryItem[] = [
  // Cameras
  { name: "Sony FX6", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 5998, weight: 2.0, storageCase: "Camera Case A", qrCode: "CAM-FX6-001" },
  { name: "Sony FX3", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3898, weight: 1.5, storageCase: "Camera Case B", qrCode: "CAM-FX3-001" },
  { name: "Sony FX9", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 10998, weight: 4.0, storageCase: "Camera Case C", qrCode: "CAM-FX9-001" },
  { name: "Sony A7S III", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3498, weight: 1.4, storageCase: "Camera Case D", qrCode: "CAM-A7S3-001" },
  { name: "Sony A7 IV", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2498, weight: 1.5, storageCase: "Camera Case D", qrCode: "CAM-A74-001" },
  { name: "Blackmagic Pocket 6K Pro", category: "Cameras", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2495, weight: 2.1, storageCase: "Camera Case E", qrCode: "CAM-BMP6K-001" },

  // Lenses - Sony
  { name: "Sony 24-70mm f/2.8 GM II", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2298, weight: 1.7, storageCase: "Lens Case 1", qrCode: "LENS-2470GM2-001" },
  { name: "Sony 70-200mm f/2.8 GM II", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2798, weight: 2.3, storageCase: "Lens Case 1", qrCode: "LENS-70200GM2-001" },
  { name: "Sony 16-35mm f/2.8 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2198, weight: 1.5, storageCase: "Lens Case 1", qrCode: "LENS-1635GM-001" },
  { name: "Sony 50mm f/1.2 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1998, weight: 1.5, storageCase: "Lens Case 2", qrCode: "LENS-50GM-001" },
  { name: "Sony 85mm f/1.4 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1798, weight: 1.8, storageCase: "Lens Case 2", qrCode: "LENS-85GM-001" },
  { name: "Sony 135mm f/1.8 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1898, weight: 2.1, storageCase: "Lens Case 2", qrCode: "LENS-135GM-001" },
  { name: "Sony 14mm f/1.8 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1598, weight: 1.0, storageCase: "Lens Case 3", qrCode: "LENS-14GM-001" },
  { name: "Sony 20mm f/1.8 G", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 898, weight: 0.8, storageCase: "Lens Case 3", qrCode: "LENS-20G-001" },
  { name: "Sony 35mm f/1.4 GM", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1398, weight: 1.2, storageCase: "Lens Case 3", qrCode: "LENS-35GM-001" },

  // Cinema Lenses
  { name: "Sigma 18-35mm T2.0 Cine", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3999, weight: 2.8, storageCase: "Cine Lens Case", qrCode: "LENS-SIG1835-001" },
  { name: "Sigma 50-100mm T2.0 Cine", category: "Lenses", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3999, weight: 3.2, storageCase: "Cine Lens Case", qrCode: "LENS-SIG50100-001" },

  // Audio
  { name: "Sound Devices MixPre-6 II", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 899, weight: 1.0, storageCase: "Audio Case A", qrCode: "AUD-MIXPRE6-001" },
  { name: "Sennheiser MKH 416", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 999, weight: 0.5, storageCase: "Audio Case A", qrCode: "AUD-MKH416-001" },
  { name: "Sennheiser MKH 416 #2", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 999, weight: 0.5, storageCase: "Audio Case A", qrCode: "AUD-MKH416-002" },
  { name: "Rode NTG5", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 499, weight: 0.2, storageCase: "Audio Case A", qrCode: "AUD-NTG5-001" },
  { name: "Sennheiser G4 Wireless Kit", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 629, weight: 0.8, storageCase: "Audio Case B", qrCode: "AUD-G4-001" },
  { name: "Sennheiser G4 Wireless Kit #2", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 629, weight: 0.8, storageCase: "Audio Case B", qrCode: "AUD-G4-002" },
  { name: "Rode Wireless GO II", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 299, weight: 0.2, storageCase: "Audio Case B", qrCode: "AUD-RWGO2-001" },
  { name: "Tentacle Sync E", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 299, weight: 0.1, storageCase: "Audio Case B", qrCode: "AUD-TENTSYNC-001" },
  { name: "Tentacle Sync E #2", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 299, weight: 0.1, storageCase: "Audio Case B", qrCode: "AUD-TENTSYNC-002" },
  { name: "Zoom H6", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 0.6, storageCase: "Audio Case B", qrCode: "AUD-H6-001" },
  { name: "K-Tek Boom Pole", category: "Audio", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 1.2, storageCase: "Boom Pole Bag", qrCode: "AUD-BOOM-001" },

  // Monitors
  { name: "SmallHD Cine 7", category: "Monitors", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2499, weight: 1.8, storageCase: "Monitor Case", qrCode: "MON-CINE7-001" },
  { name: "SmallHD Focus 7", category: "Monitors", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 899, weight: 1.2, storageCase: "Monitor Case", qrCode: "MON-FOCUS7-001" },
  { name: "Atomos Ninja V+", category: "Monitors", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 799, weight: 0.8, storageCase: "Monitor Case", qrCode: "MON-NINJAV-001" },
  { name: "Portkeys BM5 III", category: "Monitors", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 399, weight: 0.7, storageCase: "Monitor Case", qrCode: "MON-BM5-001" },

  // Support
  { name: "Sachtler FSB 8", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 2099, weight: 8.5, storageCase: "Tripod Bag A", qrCode: "SUP-FSB8-001" },
  { name: "Sachtler FSB 6", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1599, weight: 6.5, storageCase: "Tripod Bag B", qrCode: "SUP-FSB6-001" },
  { name: "DJI RS 3 Pro", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 799, weight: 3.3, storageCase: "Gimbal Case", qrCode: "SUP-RS3P-001" },
  { name: "DJI RS 2", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 699, weight: 2.8, storageCase: "Gimbal Case", qrCode: "SUP-RS2-001" },
  { name: "Easyrig Minimax", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1895, weight: 4.0, storageCase: "Easyrig Bag", qrCode: "SUP-ERYIG-001" },
  { name: "SmallRig FX6 Cage", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 199, weight: 0.8, storageCase: "Cage Box", qrCode: "SUP-FX6CAGE-001" },
  { name: "SmallRig FX3 Cage", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 149, weight: 0.5, storageCase: "Cage Box", qrCode: "SUP-FX3CAGE-001" },
  { name: "Manfrotto Magic Arm", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 79, weight: 0.4, storageCase: "Accessories", qrCode: "SUP-MAGICARM-001" },
  { name: "Manfrotto Super Clamp", category: "Support", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 45, weight: 0.3, storageCase: "Accessories", qrCode: "SUP-SUPERCLAMP-001" },

  // Lighting
  { name: "Aputure 600d Pro", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1699, weight: 6.5, storageCase: "Light Case A", qrCode: "LGT-600D-001" },
  { name: "Aputure 300d II", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1099, weight: 4.0, storageCase: "Light Case A", qrCode: "LGT-300D-001" },
  { name: "Aputure 120d II", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 745, weight: 2.8, storageCase: "Light Case B", qrCode: "LGT-120D-001" },
  { name: "Aputure MC 4-Light Kit", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 599, weight: 1.0, storageCase: "Light Case B", qrCode: "LGT-MC4-001" },
  { name: "Aputure Nova P300c", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 1499, weight: 7.5, storageCase: "Light Case C", qrCode: "LGT-NOVA-001" },
  { name: "Amaran 60x S Bi-Color", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 199, weight: 1.5, storageCase: "Light Case B", qrCode: "LGT-60X-001" },
  { name: "Light Dome II", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 169, weight: 2.0, storageCase: "Modifier Bag", qrCode: "LGT-DOME2-001" },
  { name: "Lantern 90", category: "Lighting", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 99, weight: 1.0, storageCase: "Modifier Bag", qrCode: "LGT-LANT90-001" },

  // Grip
  { name: "C-Stand with Arm", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 189, weight: 12.0, notes: "x4 available", qrCode: "GRIP-CSTAND-001" },
  { name: "C-Stand with Arm #2", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 189, weight: 12.0, qrCode: "GRIP-CSTAND-002" },
  { name: "C-Stand with Arm #3", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 189, weight: 12.0, qrCode: "GRIP-CSTAND-003" },
  { name: "C-Stand with Arm #4", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 189, weight: 12.0, qrCode: "GRIP-CSTAND-004" },
  { name: "Impact Light Stand 10ft", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 79, weight: 3.0, qrCode: "GRIP-STAND10-001" },
  { name: "Impact Light Stand 10ft #2", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 79, weight: 3.0, qrCode: "GRIP-STAND10-002" },
  { name: "4x4 Floppy", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 129, weight: 4.0, storageCase: "Flag Bag", qrCode: "GRIP-FLOPPY44-001" },
  { name: "4x4 Frame + Silk", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 189, weight: 5.0, storageCase: "Flag Bag", qrCode: "GRIP-SILK44-001" },
  { name: "Sandbags 25lb (x6)", category: "Grip", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 90, weight: 150.0, notes: "Set of 6", qrCode: "GRIP-SANDBAG-001" },

  // Drones
  { name: "DJI Mavic 3 Pro Cine", category: "Drones", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 4799, weight: 2.0, storageCase: "Drone Case A", qrCode: "DRN-MAV3PRO-001" },
  { name: "DJI Mini 3 Pro", category: "Drones", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 909, weight: 0.5, storageCase: "Drone Case B", qrCode: "DRN-MINI3-001" },
  { name: "DJI FPV Combo", category: "Drones", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 999, weight: 1.5, storageCase: "Drone Case C", qrCode: "DRN-FPV-001" },
  { name: "DJI Inspire 2", category: "Drones", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3299, weight: 8.5, storageCase: "Inspire Case", qrCode: "DRN-INSP2-001" },

  // Media
  { name: "CFexpress Type A 160GB", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 398, weight: 0.05, storageCase: "Media Case", qrCode: "MED-CFEA160-001" },
  { name: "CFexpress Type A 160GB #2", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 398, weight: 0.05, storageCase: "Media Case", qrCode: "MED-CFEA160-002" },
  { name: "CFexpress Type A 160GB #3", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 398, weight: 0.05, storageCase: "Media Case", qrCode: "MED-CFEA160-003" },
  { name: "CFexpress Type A 160GB #4", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 398, weight: 0.05, storageCase: "Media Case", qrCode: "MED-CFEA160-004" },
  { name: "Samsung T7 2TB SSD", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 219, weight: 0.2, storageCase: "Media Case", qrCode: "MED-T72TB-001" },
  { name: "Samsung T7 2TB SSD #2", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 219, weight: 0.2, storageCase: "Media Case", qrCode: "MED-T72TB-002" },
  { name: "SanDisk Extreme Pro 512GB", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 89, weight: 0.05, storageCase: "Media Case", qrCode: "MED-SDEXP512-001" },
  { name: "SanDisk Extreme Pro 512GB #2", category: "Media", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 89, weight: 0.05, storageCase: "Media Case", qrCode: "MED-SDEXP512-002" },

  // Batteries & Power
  { name: "Sony BP-U100 Battery", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 0.8, storageCase: "Battery Case", qrCode: "PWR-BPU100-001" },
  { name: "Sony BP-U100 Battery #2", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 0.8, storageCase: "Battery Case", qrCode: "PWR-BPU100-002" },
  { name: "Sony BP-U100 Battery #3", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 0.8, storageCase: "Battery Case", qrCode: "PWR-BPU100-003" },
  { name: "Sony BP-U100 Battery #4", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 349, weight: 0.8, storageCase: "Battery Case", qrCode: "PWR-BPU100-004" },
  { name: "Sony NP-FZ100 Battery", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 78, weight: 0.1, storageCase: "Battery Case", qrCode: "PWR-FZ100-001" },
  { name: "Sony NP-FZ100 Battery #2", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 78, weight: 0.1, storageCase: "Battery Case", qrCode: "PWR-FZ100-002" },
  { name: "Sony NP-FZ100 Battery #3", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 78, weight: 0.1, storageCase: "Battery Case", qrCode: "PWR-FZ100-003" },
  { name: "Sony NP-FZ100 Battery #4", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 78, weight: 0.1, storageCase: "Battery Case", qrCode: "PWR-FZ100-004" },
  { name: "V-Mount Battery 150Wh", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 299, weight: 1.2, storageCase: "V-Mount Case", qrCode: "PWR-VMOUNT150-001" },
  { name: "V-Mount Battery 150Wh #2", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 299, weight: 1.2, storageCase: "V-Mount Case", qrCode: "PWR-VMOUNT150-002" },
  { name: "V-Mount Charger Dual", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 199, weight: 1.5, storageCase: "V-Mount Case", qrCode: "PWR-VCHARGER-001" },
  { name: "Sony Dual BC-U2A Charger", category: "Batteries & Power", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 295, weight: 0.8, storageCase: "Battery Case", qrCode: "PWR-BCU2A-001" },

  // Cables
  { name: "HDMI 2.1 Cable 6ft", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 29, weight: 0.2, storageCase: "Cable Bag", qrCode: "CBL-HDMI6-001" },
  { name: "HDMI 2.1 Cable 6ft #2", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 29, weight: 0.2, storageCase: "Cable Bag", qrCode: "CBL-HDMI6-002" },
  { name: "SDI Cable 6ft", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 35, weight: 0.3, storageCase: "Cable Bag", qrCode: "CBL-SDI6-001" },
  { name: "SDI Cable 25ft", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 65, weight: 0.8, storageCase: "Cable Bag", qrCode: "CBL-SDI25-001" },
  { name: "XLR Cable 10ft", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 25, weight: 0.3, storageCase: "Audio Cable Bag", qrCode: "CBL-XLR10-001" },
  { name: "XLR Cable 10ft #2", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 25, weight: 0.3, storageCase: "Audio Cable Bag", qrCode: "CBL-XLR10-002" },
  { name: "XLR Cable 25ft", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 35, weight: 0.5, storageCase: "Audio Cable Bag", qrCode: "CBL-XLR25-001" },
  { name: "Stinger 25ft (Edison)", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 45, weight: 2.0, storageCase: "Power Cable Bag", qrCode: "CBL-STING25-001" },
  { name: "Stinger 50ft (Edison)", category: "Cables", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 65, weight: 4.0, storageCase: "Power Cable Bag", qrCode: "CBL-STING50-001" },

  // Cases
  { name: "Pelican 1510 Rolling Case", category: "Cases", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 259, weight: 6.5, qrCode: "CASE-1510-001" },
  { name: "Pelican 1510 Rolling Case #2", category: "Cases", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 259, weight: 6.5, qrCode: "CASE-1510-002" },
  { name: "Pelican 1535 Air", category: "Cases", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 279, weight: 5.0, qrCode: "CASE-1535-001" },
  { name: "Pelican 1650 Large Case", category: "Cases", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 359, weight: 12.0, qrCode: "CASE-1650-001" },
  { name: "Nanuk 935 Case", category: "Cases", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 289, weight: 7.5, qrCode: "CASE-NANUK935-001" },

  // Computers
  { name: "MacBook Pro 16\" M3 Max", category: "Computers", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 3999, weight: 4.7, storageCase: "Laptop Bag", qrCode: "COMP-MBP16-001" },
  { name: "CalDigit TS4 Dock", category: "Computers", status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, value: 399, weight: 1.5, storageCase: "Tech Bag", qrCode: "COMP-TS4-001" },
];

// Calculate dates relative to today for realistic demo jobs
const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const twoWeeksOut = new Date(today);
twoWeeksOut.setDate(today.getDate() + 14);
const threeWeeksOut = new Date(today);
threeWeeksOut.setDate(today.getDate() + 21);

export const demoJobs: DemoJob[] = [
  {
    name: "NY Times Documentary",
    status: JobStatus.UPCOMING,
    startDate: nextWeek.toISOString().split('T')[0],
    endDate: twoWeeksOut.toISOString().split('T')[0],
  },
  {
    name: "Nike Commercial",
    status: JobStatus.UPCOMING,
    startDate: twoWeeksOut.toISOString().split('T')[0],
    endDate: threeWeeksOut.toISOString().split('T')[0],
  },
];

export const demoKits: DemoKit[] = [
  {
    name: "Sony FX6 Package",
    itemNames: [
      "Sony FX6",
      "Sony 24-70mm f/2.8 GM II",
      "Sony 70-200mm f/2.8 GM II",
      "SmallRig FX6 Cage",
      "Sony BP-U100 Battery",
      "Sony BP-U100 Battery #2",
      "CFexpress Type A 160GB",
      "CFexpress Type A 160GB #2",
    ],
  },
  {
    name: "Sony FX3 Package",
    itemNames: [
      "Sony FX3",
      "Sony 16-35mm f/2.8 GM",
      "Sony 50mm f/1.2 GM",
      "SmallRig FX3 Cage",
      "Sony NP-FZ100 Battery",
      "Sony NP-FZ100 Battery #2",
      "CFexpress Type A 160GB #3",
    ],
  },
];
