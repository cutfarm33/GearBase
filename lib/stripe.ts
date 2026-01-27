// Stripe Checkout Utility
// Creates a checkout session via Supabase Edge Function

import type { SupabaseClient } from '@supabase/supabase-js';

export const createCheckoutSession = async (supabase: SupabaseClient): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated. Please log in first.');

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    headers: { Authorization: `Bearer ${session.access_token}` }
  });

  if (error) throw new Error(error.message || 'Failed to create checkout session');
  if (!data?.url) throw new Error('No checkout URL returned');

  return data.url;
};
