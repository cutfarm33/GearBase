// Supabase Edge Function for deleting a user's account and all associated data

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Delete user's storage files
    const { data: files } = await supabase.storage
      .from('inventory')
      .list(user.id);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${user.id}/${f.name}`);
      await supabase.storage.from('inventory').remove(filePaths);
    }

    // Delete receipts subfolder
    const { data: receiptFiles } = await supabase.storage
      .from('inventory')
      .list(`${user.id}/receipts`);

    if (receiptFiles && receiptFiles.length > 0) {
      const receiptPaths = receiptFiles.map((f) => `${user.id}/receipts/${f.name}`);
      await supabase.storage.from('inventory').remove(receiptPaths);
    }

    // Delete user's data from tables (cascade should handle most, but be explicit)
    const userId = user.id;

    await supabase.from('receipts').delete().eq('user_id', userId);
    await supabase.from('loans').delete().eq('user_id', userId);
    await supabase.from('transactions').delete().eq('user_id', userId);
    await supabase.from('inventory_items').delete().eq('user_id', userId);
    await supabase.from('kits').delete().eq('user_id', userId);
    await supabase.from('jobs').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete the auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete account: ' + deleteError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Delete account error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
