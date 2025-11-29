
import { User, InventoryItem, Kit, Job, ItemStatus, ItemCondition, JobStatus, TransactionLog } from './types';

// Mock users now use UUID-like strings to match Supabase types
export const users: User[] = [
  { id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1', name: 'Alice Admin', role: 'Admin', email: 'alice@geartrack.com' },
  { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef2', name: 'Bob Producer', role: 'Producer', email: 'bob@geartrack.com' },
  { id: 'c3d4e5f6-a7b8-9012-3456-78901abcdef3', name: 'Charlie Crew', role: 'Crew', email: 'charlie@geartrack.com' },
  { id: 'd4e5f6a7-b8c9-0123-4567-89012abcdef4', name: 'Diana DP', role: 'Crew', email: 'diana@geartrack.com' },
];

const initialHistory: TransactionLog[] = [];

export const inventory: InventoryItem[] = [
    { id: 101, name: 'Sony FX6', qrCode: 'SN-FX6-001', category: 'Camera', status: ItemStatus.AVAILABLE, condition: ItemCondition.USED, notes: "Small scratch on LCD screen. Doesn't affect function.", purchaseDate: '2022-03-15', value: 5998, history: initialHistory, imageUrl: 'https://picsum.photos/seed/sonyfx6/200' },
    { id: 102, name: 'RED Komodo 6K', qrCode: 'SN-KOM-001', category: 'Camera', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2021-11-20', value: 5995, history: initialHistory, imageUrl: 'https://picsum.photos/seed/redkomodo/200' },
    { id: 201, name: 'Canon 24-70mm f/2.8L II', qrCode: 'SN-L2470-001', category: 'Lens', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2020-05-10', value: 1899, history: initialHistory, imageUrl: 'https://picsum.photos/seed/canon2470/200' },
    { id: 202, name: 'Sigma 18-35mm f/1.8 Art', qrCode: 'SN-S1835-001', category: 'Lens', status: ItemStatus.AVAILABLE, condition: ItemCondition.DAMAGED, notes: 'Stiff focus ring.', purchaseDate: '2019-08-22', value: 699, history: initialHistory, imageUrl: 'https://picsum.photos/seed/sigma1835/200' },
    { id: 301, name: 'Sachtler Flowtech 75', qrCode: 'SN-SACH-001', category: 'Tripod', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2022-03-15', value: 1350, history: initialHistory, imageUrl: 'https://picsum.photos/seed/sachtler75/200' },
    { id: 401, name: 'Aputure LS 600d Pro', qrCode: 'SN-APU600-001', category: 'Lighting', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2023-01-05', value: 1890, history: initialHistory, imageUrl: 'https://picsum.photos/seed/apu600/200' },
    { id: 402, name: 'Astera Titan Tube Kit (8 tubes)', qrCode: 'SN-AST-001', category: 'Lighting', status: ItemStatus.AVAILABLE, condition: ItemCondition.DAMAGED, notes: 'Tube #3 has dead pixels.', purchaseDate: '2022-09-12', value: 8500, history: initialHistory, imageUrl: 'https://picsum.photos/seed/astera/200' },
    { id: 501, name: 'C-Stand', qrCode: 'SN-CSTAND-001', category: 'Grip', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2020-01-30', value: 150, history: initialHistory, imageUrl: 'https://picsum.photos/seed/cstand1/200' },
    { id: 502, name: 'C-Stand', qrCode: 'SN-CSTAND-002', category: 'Grip', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2020-01-30', value: 150, history: initialHistory, imageUrl: 'https://picsum.photos/seed/cstand2/200' },
    { id: 601, name: 'Sound Devices MixPre-6 II', qrCode: 'SN-SDMP6-001', category: 'Audio', status: ItemStatus.AVAILABLE, condition: ItemCondition.GOOD, purchaseDate: '2021-06-18', value: 950, history: initialHistory, imageUrl: 'https://picsum.photos/seed/sdmixpre6/200' },
    { id: 602, name: 'Sennheiser MKH-416', qrCode: 'SN-SENN-001', category: 'Audio', status: ItemStatus.AVAILABLE, condition: ItemCondition.USED, notes: 'Windscreen is torn.', purchaseDate: '2018-12-01', value: 999, history: initialHistory, imageUrl: 'https://picsum.photos/seed/senn416/200' },
];

export const kits: Kit[] = [
  { id: 1, name: 'Camera A Kit', itemIds: [101, 301, 201] }, // Sony FX6, Sachtler Tripod, Canon 24-70mm
  { id: 2, name: 'Audio Kit', itemIds: [601, 602] }, // MixPre-6, Sennheiser MKH-416
];

export const jobs: Job[] = [
  {
    id: 1,
    name: '"Sunset Boulevard" Commercial',
    producerId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef2', // Matches Bob Producer
    startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0],
    status: JobStatus.UPCOMING,
    gearList: [{ itemId: 101 }, { itemId: 301 }, { itemId: 602 }],
  },
];
