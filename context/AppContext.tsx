
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { Job, InventoryItem, User, Kit, Transaction, ViewState, ItemStatus, ItemCondition, TransactionLog, Theme, TransactionType, UserRole } from '../types';

// --- 1. CONFIGURATION ---

// Helper to safely access environment variables without crashing
const getEnvVar = (key: string) => {
    try {
        // @ts-ignore - Prevent TS errors if import.meta.env is missing in some builds
        return (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env[key] : undefined;
    } catch (e) {
        return undefined;
    }
};

// !!! IMPORTANT: REPLACE THESE VALUES WITH YOUR SUPABASE KEYS !!!
// If you are deploying to Vercel/Netlify, set these as Environment Variables instead.
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://gfonvcryarcxxrgdzkmi.supabase.co'; 
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmb252Y3J5YXJjeHhyZ2R6a21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc0MjUsImV4cCI6MjA3OTIyMzQyNX0.3XKwlCygN9U72_iLgP_hMjCz9RD5ZupcL5OIoUBPa5I';

// Check if the user has actually configured the app
const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes('INSERT_YOUR') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('INSERT_YOUR');

// Helper to safely validate URL to prevent crash
const isValidUrl = (urlString: string) => {
    try { 
        return Boolean(new URL(urlString)); 
    } catch(e) { 
        return false; 
    }
}

// Safe client creation to prevent crashes if keys are malformed during setup
const safeUrl = (isConfigured && isValidUrl(SUPABASE_URL)) ? SUPABASE_URL : 'https://placeholder.supabase.co';
const safeKey = (isConfigured && SUPABASE_ANON_KEY) ? SUPABASE_ANON_KEY : 'placeholder';

export const supabase = createClient(safeUrl, safeKey);

// --- 2. STATE DEFINITIONS ---

interface AppState {
  jobs: Job[];
  inventory: InventoryItem[];
  users: User[];
  kits: Kit[];
  transactions: Transaction[];
  currentView: ViewState;
  currentUser: User | null;
  theme: Theme;
  isLoading: boolean;
  pendingEmail?: string;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: Partial<AppState> }
  | { type: 'NAVIGATE'; payload: ViewState }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_INVENTORY_ITEM_LOCAL'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM_LOCAL'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM_LOCAL'; payload: number }
  | { type: 'CREATE_JOB_LOCAL'; payload: Job }
  | { type: 'UPDATE_JOB_LOCAL'; payload: Job }
  | { type: 'DELETE_JOB_LOCAL'; payload: number }
  | { type: 'DELETE_TEAM_MEMBER_LOCAL'; payload: string }
  | { 
      type: 'COMPLETE_TRANSACTION'; 
      payload: { 
          transaction: Omit<Transaction, 'id' | 'timestamp'>; 
          updatedItems: { itemId: number; newStatus: ItemStatus; newCondition: ItemCondition; notes?: string; isMissing?: boolean }[] 
      } 
    };

const initialState: AppState = {
  jobs: [],
  inventory: [],
  users: [],
  kits: [],
  transactions: [],
  currentView: { view: 'LANDING' },
  currentUser: null,
  theme: 'dark',
  isLoading: true,
};

// --- 3. REDUCER ---
// --- 3. REDUCER ---
// --- 3. REDUCER ---


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
    case 'SET_DATA':
        return { ...state, ...action.payload };
    case 'NAVIGATE':
      return { ...state, currentView: action.payload };
    case 'SET_CURRENT_USER':
      // Only navigate to DASHBOARD if user is logging in for the first time (no previous user)
      // Don't change view if user is already logged in (token refresh, reconnect, etc.)
      const shouldNavigate = action.payload && !state.currentUser;
      return {
          ...state,
          currentUser: action.payload,
          currentView: shouldNavigate
            ? { view: 'DASHBOARD' }
            : (action.payload ? state.currentView : { view: 'LANDING' })
      };
    case 'LOGOUT':
        return {
            ...state,
            currentUser: null,
            currentView: { view: 'LANDING' }
        };
    case 'TOGGLE_THEME': {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        return {
            ...state,
            theme: newTheme,
            currentUser: state.currentUser ? { ...state.currentUser, theme: newTheme } : null
        };
    }
    
    case 'ADD_INVENTORY_ITEM_LOCAL':
        return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY_ITEM_LOCAL':
        return { ...state, inventory: state.inventory.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INVENTORY_ITEM_LOCAL':
        return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };
    case 'CREATE_JOB_LOCAL':
        return { ...state, jobs: [...state.jobs, action.payload] };
    case 'UPDATE_JOB_LOCAL':
        return { ...state, jobs: state.jobs.map(j => j.id === action.payload.id ? action.payload : j) };
    case 'DELETE_JOB_LOCAL':
        return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) };
    case 'DELETE_TEAM_MEMBER_LOCAL':
        return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'COMPLETE_TRANSACTION': {
        const { transaction, updatedItems } = action.payload;
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now(),
            timestamp: new Date().toISOString(),
        };
        
        // STRICT: Update inventory status based exactly on payload
        const updatedInventory = state.inventory.map(item => {
            const update = updatedItems.find(
              u => u.itemId === item.id
            );
            if (!update) return item;
          
            const newHistory: TransactionLog = {
                transactionId: newTransaction.id,
                jobId: newTransaction.jobId,
                userId: newTransaction.userId,
                assignedToId: newTransaction.assignedToId,
                type: newTransaction.type,
                date: newTransaction.timestamp,
                condition: update.newCondition,
                notes: update.notes,
              };
            return {
              ...item,
              status: update.newStatus,
              condition: update.newCondition,
              notes: update.notes || item.notes,
              history: [newHistory, ...item.history],
            };
          });

        return {
            ...state,
            transactions: [newTransaction, ...state.transactions], 
            inventory: updatedInventory
        };
    }
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  supabase: SupabaseClient;
  navigateTo: (view: ViewState['view'], params?: Record<string, any>) => void;
  findItem: (id: number) => InventoryItem | undefined;
  findUser: (id: string) => User | undefined;
  findJob: (id: number) => Job | undefined;
  refreshData: (silent?: boolean) => Promise<void>;
  checkAuth: (session?: Session | null) => Promise<boolean>;
  isConfigured: boolean;
  deleteJob: (jobId: number) => Promise<void>;
  deleteInventoryItem: (itemId: number) => Promise<void>;
  deleteKit: (kitId: number) => Promise<void>;
  addTeamMember: (name: string, role: UserRole, email?: string) => Promise<string | undefined>;
  updateTeamMember: (id: string, name: string, role: UserRole, email: string) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  mergeOfflineProfile: (offlineId: string, realUserId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  createTransaction: (
      transaction: Omit<Transaction, 'id' | 'timestamp'>,
      updatedItems: { itemId: number; newStatus: ItemStatus; newCondition: ItemCondition; notes?: string; isMissing?: boolean }[]
  ) => Promise<boolean>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  signOut: () => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- 4. PROVIDER ---

export const AppProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(appReducer, {
      ...initialState,
      theme: 'dark' as Theme,
  });

  useEffect(() => {
      const html = document.documentElement;
      if (state.theme === 'dark') {
          html.classList.add('dark');
      } else {
          html.classList.remove('dark');
      }
  }, [state.theme]);

  // Track if a refresh is in progress to prevent race conditions
  const refreshInProgress = React.useRef(false);

  const refreshData = async (silent = false, overrideOrgId?: string) => {
      // Prevent concurrent refreshes that could cause data overwrites
      if (refreshInProgress.current) {
          console.log('Refresh already in progress, skipping...');
          return;
      }
      refreshInProgress.current = true;

      if (!silent) dispatch({ type: 'SET_LOADING', payload: true });
      try {
          if (!isConfigured) {
              if (!silent) dispatch({ type: 'SET_LOADING', payload: false });
              refreshInProgress.current = false;
              return;
          }

          // Get organization ID - use override if provided, otherwise from current user
          // CRITICAL for data isolation between organizations
          const orgId = overrideOrgId || state.currentUser?.active_organization_id || state.currentUser?.organization_id;

          if (!orgId) {
              console.warn('No organization ID found - cannot load data');
              if (!silent) dispatch({ type: 'SET_LOADING', payload: false });
              refreshInProgress.current = false;
              return;
          }

          console.log('Starting data refresh for organization:', orgId);

          // 1. Fetch Raw Data - FILTERED BY ORGANIZATION
          const { data: items, error: itemsError } = await supabase
              .from('inventory')
              .select('*')
              .eq('organization_id', orgId)
              .order('id');
          console.log('Inventory fetched:', items?.length, 'items');
          if (itemsError) throw itemsError;

          // CRITICAL: Don't proceed if we got no items AND there was an issue
          // This prevents wiping existing data on network/RLS errors
          if (items === null) {
              console.warn('Inventory fetch returned null - possible RLS or network issue');
              throw new Error('Failed to fetch inventory data');
          }

          // Profiles: fetch users in this organization (via organization_members or same org_id)
          const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .eq('organization_id', orgId);
          console.log('Profiles fetched:', profiles?.length, 'profiles');
          if (profilesError) console.warn("Profiles fetch error", profilesError);

          const { data: jobsData, error: jobsError } = await supabase
              .from('jobs')
              .select(`*, job_items(item_id)`)
              .eq('organization_id', orgId);
          console.log('Jobs fetched:', jobsData?.length, 'jobs');
          if (jobsError) throw jobsError;

          const { data: kitsData } = await supabase
              .from('kits')
              .select(`*, kit_items(item_id)`)
              .eq('organization_id', orgId);
          console.log('Kits fetched:', kitsData?.length, 'kits');

          const { data: transactionsData, error: txError } = await supabase
              .from('transactions')
              .select(`*, transaction_items(*)`)
              .eq('organization_id', orgId)
              .order('timestamp', { ascending: false });
          console.log('Transactions fetched:', transactionsData?.length, 'transactions');

          if (txError) console.warn("Transactions fetch error", txError);

          console.log('Starting data formatting...');

          // 2. Format Data
          const defaultOrgId = '00000000-0000-0000-0000-000000000000';
          const formattedUsers: User[] = (profiles || []).map((p: any) => ({
              id: p.id,
              name: p.full_name || 'Unknown',
              email: p.email,
              role: p.role as UserRole,
              theme: p.theme as Theme || 'dark',
              organization_id: p.organization_id || defaultOrgId
          }));

          const formattedJobs: Job[] = (jobsData || []).map((j: any) => ({
              id: j.id,
              name: j.name,
              producerId: j.producer_id,
              startDate: j.start_date,
              endDate: j.end_date,
              status: j.status,
              gearList: (j.job_items || []).map((ji: any) => ({ itemId: ji.item_id })),
              organization_id: j.organization_id || defaultOrgId
          }));
          
          let formattedKits: Kit[] = (kitsData || []).map((k: any) => ({
              id: k.id,
              name: k.name,
              itemIds: (k.kit_items || []).map((ki: any) => ki.item_id),
              organization_id: k.organization_id || defaultOrgId
          }));

          const transactions: Transaction[] = (transactionsData || []).map((t: any) => ({
              id: t.id,
              jobId: t.job_id,
              type: t.type as TransactionType,
              userId: t.user_id,
              assignedToId: t.assigned_to_id,
              timestamp: t.timestamp,
              signature: t.signature_url,
              items: (t.transaction_items || []).map((ti: any) => ({
                  itemId: ti.item_id,
                  startCondition: ti.condition as ItemCondition,
                  endCondition: ti.condition as ItemCondition,
                  notes: ti.notes,
                  isMissing: ti.is_missing
              })),
              organization_id: t.organization_id || defaultOrgId
          }));

          const formattedInventory: InventoryItem[] = (items || []).map((i: any) => {
              // Build History
              const itemHistory: TransactionLog[] = transactions
                  .filter(t => t.items && t.items.some(ti => ti.itemId === i.id))
                  .map(t => {
                      const txItem = t.items.find(ti => ti.itemId === i.id);
                      return {
                          transactionId: t.id,
                          jobId: t.jobId,
                          userId: t.userId,
                          assignedToId: t.assignedToId,
                          type: t.type,
                          date: t.timestamp,
                          condition: txItem?.endCondition || ItemCondition.GOOD,
                          notes: txItem?.notes
                      };
                  });

              // SINGLE SOURCE OF TRUTH: TRUST THE DATABASE STATUS
              // We do not "guess" status from history anymore. 
              // We expect the write-action (Checkout) to have updated the DB column correctly.
              
              return {
                  id: i.id,
                  name: i.name,
                  qrCode: i.qr_code,
                  category: i.category,
                  status: i.status as ItemStatus, // Trust the DB
                  condition: i.condition,
                  notes: i.notes,
                  purchaseDate: i.purchase_date,
                  value: i.value,
                  weight: i.weight,
                  storageCase: i.storage_case,
                  imageUrl: i.image_url || `https://picsum.photos/seed/${i.name.replace(/[^a-zA-Z0-9]/g,'')}/200`,
                  history: itemHistory,
                  organization_id: i.organization_id || defaultOrgId
              };
          });

          dispatch({
              type: 'SET_DATA',
              payload: {
                  inventory: formattedInventory,
                  users: formattedUsers || [],
                  jobs: formattedJobs || [],
                  kits: formattedKits || [],
                  transactions: transactions
              }
          });

          console.log('Data refresh completed successfully');

      } catch (err: any) {
          // FIX: Safely log error string to prevent [object Object]
          const message = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
          console.error("Error fetching data:", message);
          // DO NOT dispatch SET_DATA on error - preserve existing data
      } finally {
          refreshInProgress.current = false;
          if (!silent) dispatch({ type: 'SET_LOADING', payload: false });
      }
  };

  const processUserSession = async (session: Session): Promise<boolean> => {
    try {
        console.log('Processing user session for:', session.user.email);

        // 1. Fetch user profile from database to get theme preference and organization
        console.log('Fetching profile for user ID:', session.user.id);

        let profileData = null;
        try {
            // Add timeout to profile fetch
            const fetchPromise = supabase
                .from('profiles')
                .select('full_name, role, theme, organization_id, active_organization_id')
                .eq('id', session.user.id)
                .maybeSingle();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout after 5s')), 5000)
            );

            const result = await Promise.race([fetchPromise, timeoutPromise]) as any;

            profileData = result.data;

            if (result.error) {
                console.error('Profile fetch error:', result.error);
            }
        } catch (fetchError: any) {
            console.error('Profile fetch exception:', fetchError.message || fetchError);
        }

        console.log('Profile data received:', profileData);

        const email = session.user.email || `user-${session.user.id}@example.com`;
        const full_name = profileData?.full_name || session.user.user_metadata?.full_name || email.split('@')[0];
        const userTheme = (profileData?.theme as Theme) || 'dark';

        // Default organization_id if not set (for backwards compatibility with existing users)
        const defaultOrgId = '00000000-0000-0000-0000-000000000000';
        // Use active_organization_id if set, otherwise fall back to organization_id
        const orgId = profileData?.active_organization_id || profileData?.organization_id || defaultOrgId;

        const userProfile = {
            id: session.user.id,
            name: full_name || 'Unknown User',
            email: email,
            role: (profileData?.role as UserRole) || (session.user.user_metadata?.role as UserRole) || 'Crew',
            theme: userTheme,
            organization_id: profileData?.organization_id || defaultOrgId,
            active_organization_id: orgId
        };

        // Set theme from user profile
        dispatch({ type: 'SET_DATA', payload: { theme: userTheme } });
        dispatch({ type: 'SET_CURRENT_USER', payload: userProfile });

        console.log('User profile set, starting background data refresh for org:', orgId);

        // 2. Load Data in Background - pass orgId to ensure correct data is loaded
        refreshData(true, orgId).catch(e => console.error("Background refresh failed", e));

        // 3. AUTO-MERGE: Check for offline profiles with matching email (runs in background, non-blocking)
        // This merges any offline profiles created for this user before they signed up
        (async () => {
            try {
                console.log('Checking for offline profiles to merge...');
                const { data: offlineProfiles } = await Promise.race([
                    supabase
                        .from('profiles')
                        .select('id, email')
                        .eq('organization_id', orgId)
                        .like('email', '%@offline.user')
                        .limit(50),
                    new Promise<{ data: null }>((_, reject) =>
                        setTimeout(() => reject(new Error('Auto-merge query timeout')), 5000)
                    )
                ]) as { data: any[] | null };

                if (offlineProfiles && offlineProfiles.length > 0) {
                    // Find offline profiles where the name part matches the real user's email prefix
                    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    const matchingProfile = offlineProfiles.find(p => {
                        const offlinePrefix = p.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '').split('.')[0];
                        return offlinePrefix === emailPrefix || p.email.toLowerCase().includes(emailPrefix);
                    });

                    if (matchingProfile && matchingProfile.id !== session.user.id) {
                        console.log('Found matching offline profile to merge:', matchingProfile.id);
                        // Run merge silently in background
                        await supabase.from('jobs').update({ producer_id: session.user.id }).eq('producer_id', matchingProfile.id);
                        await supabase.from('transactions').update({ user_id: session.user.id }).eq('user_id', matchingProfile.id);
                        await supabase.from('transactions').update({ assigned_to_id: session.user.id }).eq('assigned_to_id', matchingProfile.id);
                        await supabase.from('profiles').delete().eq('id', matchingProfile.id);
                        console.log('Auto-merge completed successfully');
                    }
                }
            } catch (mergeError) {
                // Silently fail - auto-merge is a convenience feature, not critical
                console.log('Auto-merge check skipped or failed (non-critical):', mergeError);
            }
        })();

        console.log('processUserSession completed successfully');
        return true;
    } catch (globalError) {
        console.error("CRITICAL: processUserSession failed", globalError);
        return false;
    }
  };

  const checkAuth = async (currentSession?: Session | null): Promise<boolean> => {
      try {
          let session = currentSession;
          if (!session) {
            const { data } = await supabase.auth.getSession();
            session = data.session;
          }

          if (session) {
              // Add timeout to prevent login from hanging forever
              const timeoutPromise = new Promise<boolean>((_, reject) =>
                  setTimeout(() => reject(new Error('Login timeout after 10s')), 10000)
              );

              try {
                  return await Promise.race([processUserSession(session), timeoutPromise]);
              } catch (timeoutError) {
                  console.error('Login timed out, proceeding with minimal profile');
                  // Create a minimal profile so user can at least log in
                  const email = session.user.email || `user-${session.user.id}@example.com`;
                  const defaultOrgId = '00000000-0000-0000-0000-000000000000';
                  dispatch({ type: 'SET_CURRENT_USER', payload: {
                      id: session.user.id,
                      name: session.user.user_metadata?.full_name || email.split('@')[0],
                      email: email,
                      role: 'Crew',
                      theme: 'dark',
                      organization_id: defaultOrgId,
                      active_organization_id: defaultOrgId
                  }});
                  return true;
              }
          } else {
              dispatch({ type: 'SET_LOADING', payload: false });
          }
      } catch (error) {
          console.error("Manual auth check failed", error);
          dispatch({ type: 'SET_LOADING', payload: false });
      }
      return false;
  };

  const uploadImage = async (file: File): Promise<string> => {
      if (!state.currentUser) throw new Error("Must be logged in to upload");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('inventory').upload(filePath, file);
      if (uploadError) throw new Error("Upload failed. " + uploadError.message);
      const { data } = supabase.storage.from('inventory').getPublicUrl(filePath);
      return data.publicUrl;
  };

  const createTransaction = async (
      transaction: Omit<Transaction, 'id' | 'timestamp'>, 
      updatedItems: { itemId: number; newStatus: ItemStatus; newCondition: ItemCondition; notes?: string; isMissing?: boolean }[]
  ): Promise<boolean> => {
      try {
          dispatch({ type: 'SET_LOADING', payload: true });

          // 1. Sanitize IDs
          const sanitizedAssignedToId = transaction.assignedToId && transaction.assignedToId.trim() !== '' 
              ? transaction.assignedToId 
              : null;

          // 2. Create Transaction Record
          const { data: txData, error: txError } = await supabase.from('transactions').insert({
            job_id: transaction.jobId,
            user_id: transaction.userId,
            type: transaction.type,
            assigned_to_id: sanitizedAssignedToId,
            signature_url: transaction.signature,
            timestamp: new Date().toISOString()
        }).select().single();

          if (txError) throw txError;
          const newTxId = txData.id;

          // 3. Create Transaction Items
          const txItemsPayload = transaction.items.map(i => ({
              transaction_id: newTxId,
              item_id: i.itemId,
              condition: i.endCondition,
              notes: i.notes,
              is_missing: i.isMissing
          }));

          if (txItemsPayload.length > 0) {
              const { error: itemsError } = await supabase.from('transaction_items').insert(txItemsPayload);
              if (itemsError) throw itemsError;
          }

          // 4. UPDATE INVENTORY STATUS (CRITICAL & MANDATORY)
          // We loop through each item and explicitly update its status in the database.
          for (const update of updatedItems) {
              const { error: updateError } = await supabase.from('inventory').update({
                  status: update.newStatus, // THIS IS THE KEY CHANGE
                  condition: update.newCondition,
                  notes: update.notes || undefined 
              }).eq('id', update.itemId);
              
              if (updateError) {
                  console.error(`Failed to update item ${update.itemId} status`, updateError);
                  throw new Error(`Database failed to update status for item ${update.itemId}. Please try again.`);
              }
          }

          // 5. Update Local State (Optimistic)
          dispatch({
              type: 'COMPLETE_TRANSACTION',
              payload: {
                  transaction: {
                      ...transaction,
                      assignedToId: sanitizedAssignedToId || undefined
                  },
                  updatedItems
              }
          });
          
          return true;

      } catch (error: any) {
          console.error("Transaction Creation Failed:", error);
          
          // Robust Error Message Extraction
          let message = "Unknown error";
          if (error) {
              if (typeof error === 'string') message = error;
              else if (error.message) message = error.message;
              else if (error.details) message = error.details;
              else if (error.hint) message = error.hint;
              else {
                  try {
                      message = JSON.stringify(error);
                  } catch (e) {
                      message = "Unserializable Error Object";
                  }
              }
          }
          
          alert('Failed to save transaction: ' + message);
          return false;
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  };

  const deleteJob = async (jobId: number) => {
    try {
        dispatch({ type: 'SET_LOADING', payload: true });
        // Manually cascade delete to ensure cleanup even if DB cascade fails
        const { data: txs } = await supabase.from('transactions').select('id').eq('job_id', jobId);
        if (txs && txs.length > 0) {
            const txIds = txs.map((t: any) => t.id);
            await supabase.from('transaction_items').delete().in('transaction_id', txIds);
            await supabase.from('transactions').delete().eq('job_id', jobId);
        }
        await supabase.from('job_items').delete().eq('job_id', jobId);
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        
        if (error) throw error;

        dispatch({ type: 'DELETE_JOB_LOCAL', payload: jobId });
        await refreshData(true);
    } catch (error: any) {
        console.error("Delete Job Failed:", error);
        const message = error.message || JSON.stringify(error);
        alert('Error deleting job: ' + message);
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteInventoryItem = async (itemId: number) => {
    try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await supabase.from('job_items').delete().eq('item_id', itemId);
        await supabase.from('transaction_items').delete().eq('item_id', itemId);
        const { error } = await supabase.from('inventory').delete().eq('id', itemId);
        if (error) throw error;
        dispatch({ type: 'DELETE_INVENTORY_ITEM_LOCAL', payload: itemId });
        await refreshData(true);
    } catch (error: any) {
        console.error("Delete Item Failed:", error);
        const message = error.message || JSON.stringify(error);
        alert('Error deleting item: ' + message);
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteKit = async (kitId: number) => {
      try {
          dispatch({ type: 'SET_LOADING', payload: true });
          await supabase.from('kit_items').delete().eq('kit_id', kitId);
          await supabase.from('kits').delete().eq('id', kitId);
          await refreshData(true);
      } catch (error: any) {
          console.error("Delete Kit Failed:", error);
          const message = error.message || JSON.stringify(error);
          alert('Error deleting package: ' + message);
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  };
  
  const addTeamMember = async (name: string, role: UserRole, email?: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
          const id = crypto.randomUUID();
          // Generate unique email with timestamp to avoid duplicate constraint violations
          const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
          const fakeEmail = email || `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}.${uniqueSuffix}@offline.user`;
          // CRITICAL: Use the same organization ID logic as refreshData
          const organizationId = state.currentUser?.active_organization_id || state.currentUser?.organization_id || '00000000-0000-0000-0000-000000000000';

          console.log('Adding team member:', { name, role, email: fakeEmail, organizationId });

          const { error } = await supabase.from('profiles').insert({
              id,
              full_name: name,
              role,
              email: fakeEmail,
              organization_id: organizationId
          });

          if (error) {
              console.error('Supabase insert error:', error);
              throw error;
          }

          console.log('Team member added to database, updating local state');

          // Immediately add to local state so UI updates without waiting for refresh
          const newUser: User = {
              id,
              name,
              email: fakeEmail,
              role,
              organization_id: organizationId,
              theme: 'dark'
          };
          dispatch({
              type: 'SET_DATA',
              payload: { users: [...state.users, newUser] }
          });

          console.log('Local state updated, returning ID:', id);

          // NOTE: We do NOT call refreshData here because it could race with
          // the database insert and overwrite our local state before the DB
          // has committed. The local state update above is sufficient.
          return id;
      } catch (e: any) {
          console.error("Error adding team member:", e);
          throw e;
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  };
  
  const updateTeamMember = async (id: string, name: string, role: UserRole, email: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
          const { error } = await supabase.from('profiles').update({ full_name: name, role: role, email: email }).eq('id', id);
          if (error) throw error;
          await refreshData(true);
      } catch (e: any) {
          console.error("Error updating team member:", e);
          throw e;
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  };

  const deleteTeamMember = async (id: string) => {
      try {
          const currentUserId = state.currentUser?.id;
          if (currentUserId && currentUserId !== id) {
             await supabase.from('jobs').update({ producer_id: currentUserId }).eq('producer_id', id);
             await supabase.from('transactions').update({ user_id: currentUserId }).eq('user_id', id);
             await supabase.from('transactions').update({ "assignedToId": currentUserId }).eq('assignedToId', id);
          }
          const { error } = await supabase.from('profiles').delete().eq('id', id);
          if (error) throw error;
          dispatch({ type: 'DELETE_TEAM_MEMBER_LOCAL', payload: id });
          refreshData(true);
      } catch (e: any) {
          console.error("Error deleting team member:", e);
          const message = e.message || JSON.stringify(e);
          alert("Failed to delete member. " + message);
      }
  };
  
  const mergeOfflineProfile = async (offlineId: string, realUserId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
          await supabase.from('jobs').update({ producer_id: realUserId }).eq('producer_id', offlineId);
          await supabase.from('transactions').update({ user_id: realUserId }).eq('user_id', offlineId);
          await supabase.from('transactions').update({ "assignedToId": realUserId }).eq('assignedToId', offlineId);
          await supabase.from('profiles').delete().eq('id', offlineId);
          await refreshData(true);
      } catch (error) {
          console.error("Error merging profiles:", error);
      } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
      }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
      try {
          dispatch({ type: 'UPDATE_INVENTORY_ITEM_LOCAL', payload: item });
          
          const { error } = await supabase.from('inventory').update({
              name: item.name,
              category: item.category,
              qr_code: item.qrCode,
              status: item.status,
              condition: item.condition,
              purchase_date: item.purchaseDate || null,
              value: item.value,
              weight: item.weight, 
              storage_case: item.storageCase,
              image_url: item.imageUrl,
              notes: item.notes
          }).eq('id', item.id);

          if (error) throw error;
      } catch (err: any) {
          console.error("Update Inventory Error:", err);
          const message = err.message || JSON.stringify(err);
          alert("Failed to update item. " + message);
          refreshData(true);
      }
  };

  const signOut = async () => {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
  };

  const toggleTheme = async () => {
      dispatch({ type: 'TOGGLE_THEME' });

      // Save theme preference to database if user is logged in
      if (state.currentUser) {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          try {
              const { error } = await supabase
                  .from('profiles')
                  .update({ theme: newTheme })
                  .eq('id', state.currentUser.id);

              if (error) {
                  console.error('Failed to save theme preference:', error);
              }
          } catch (err) {
              console.error('Error saving theme:', err);
          }
      }
  };

  // Initial Load & Auth Check
  useEffect(() => {
      const init = async () => {
          if (!isConfigured) {
               dispatch({ type: 'SET_LOADING', payload: false });
               return;
          }
          await checkAuth();
      };
      
      const safetyTimer = setTimeout(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
      }, 5000);

      init();

      // Track the last processed session to prevent duplicate processing
      let lastProcessedSessionId: string | null = null;

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email);

          if (event === 'SIGNED_IN' && session) {
               // Prevent processing the same session multiple times (token refresh, etc.)
               const sessionId = session.access_token;
               if (lastProcessedSessionId === sessionId) {
                   console.log('Session already processed, skipping...');
                   return;
               }
               lastProcessedSessionId = sessionId;

               // Add timeout to prevent hanging - create minimal profile on timeout
               try {
                   const timeoutPromise = new Promise((_, reject) =>
                       setTimeout(() => reject(new Error('Session processing timeout')), 8000)
                   );
                   await Promise.race([processUserSession(session), timeoutPromise]);
               } catch (timeoutError) {
                   console.error('Auth state handler timed out, creating minimal profile');
                   const email = session.user.email || `user-${session.user.id}@example.com`;
                   const defaultOrgId = '00000000-0000-0000-0000-000000000000';
                   dispatch({ type: 'SET_CURRENT_USER', payload: {
                       id: session.user.id,
                       name: session.user.user_metadata?.full_name || email.split('@')[0],
                       email: email,
                       role: 'Crew',
                       theme: 'dark',
                       organization_id: defaultOrgId,
                       active_organization_id: defaultOrgId
                   }});
               }
          } else if (event === 'SIGNED_OUT') {
               lastProcessedSessionId = null;
               dispatch({ type: 'LOGOUT' });
          } else if (event === 'TOKEN_REFRESHED' && session) {
               // Token refresh shouldn't re-fetch all data, just update the session
               console.log('Token refreshed, keeping existing data');
               lastProcessedSessionId = session.access_token;
          }
      });

      return () => {
          clearTimeout(safetyTimer);
          authListener.subscription.unsubscribe();
      };
  }, []);


  // Helpers
  const navigateTo = (view: ViewState['view'], params = {}) => {
    dispatch({ type: 'NAVIGATE', payload: { view, params } });
  };

  const findItem = (id: number) => state.inventory.find(item => item.id === id);
  const findUser = (id: string) => state.users.find(user => user.id === id);
  const findJob = (id: number) => state.jobs.find(job => job.id === id);

  return (
    <AppContext.Provider value={{ state, dispatch, supabase, navigateTo, findItem, findUser, findJob, refreshData, checkAuth, isConfigured, deleteJob, deleteInventoryItem, deleteKit, addTeamMember, updateTeamMember, deleteTeamMember, mergeOfflineProfile, uploadImage, createTransaction, updateInventoryItem, signOut, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
