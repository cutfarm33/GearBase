// Supabase Edge Function for creating Stripe Checkout sessions
// Handles both Founder's Deal (one-time $29) and Pro subscription ($5/mo)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const founderPriceId = Deno.env.get('STRIPE_FOUNDER_PRICE_ID');
    const proMonthlyPriceId = Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID');
    const founderLimit = parseInt(Deno.env.get('FOUNDER_LIMIT') || '100');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!stripeSecretKey || !founderPriceId) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, organization_id, plan, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if already a founder/pro
    if (profile.plan === 'founder' || profile.plan === 'pro') {
      return new Response(
        JSON.stringify({ error: 'Already subscribed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get founder count
    const { data: founderCount } = await supabase.rpc('get_founder_count');
    const isFounderAvailable = (founderCount || 0) < founderLimit;

    // Determine pricing
    const priceId = isFounderAvailable ? founderPriceId : proMonthlyPriceId;
    const mode = isFounderAvailable ? 'payment' : 'subscription';

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Create or reuse Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;

      // Save customer ID
      await supabase.from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get origin from request
    const origin = req.headers.get('origin') || 'https://mygearbase.com';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode as 'payment' | 'subscription',
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        organization_id: profile.organization_id || '',
        deal_type: isFounderAvailable ? 'founder' : 'pro_monthly'
      }
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Checkout error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
