// Supabase Edge Function for handling Stripe webhooks
// Processes checkout.session.completed events to activate plans

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const orgId = session.metadata?.organization_id;
      const dealType = session.metadata?.deal_type;

      if (!userId) {
        console.error('No user ID in session metadata');
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      if (dealType === 'founder') {
        // Get current founder count for numbering
        const { data: currentCount } = await supabase.rpc('get_founder_count');
        const founderNumber = (currentCount || 0) + 1;

        // Insert founder deal record
        const { error: dealError } = await supabase.from('founder_deals').insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          amount_paid: session.amount_total || 2900,
          founder_number: founderNumber
        });

        if (dealError) {
          console.error('Error inserting founder deal:', dealError);
          // If duplicate user, this is expected (idempotent)
          if (!dealError.message.includes('duplicate')) {
            return new Response(JSON.stringify({ error: dealError.message }), { status: 500 });
          }
        }

        // Update user profile - lifetime access (no expiration)
        await supabase.from('profiles').update({
          plan: 'founder',
          stripe_customer_id: session.customer as string,
          plan_expires_at: null
        }).eq('id', userId);

        // Update organization tier
        if (orgId) {
          await supabase.from('organizations').update({
            subscription_tier: 'pro',
            subscription_status: 'active'
          }).eq('id', orgId);
        }

        console.log(`Founder #${founderNumber} activated: ${userId}`);

      } else if (dealType === 'pro_monthly') {
        // Monthly Pro subscription
        await supabase.from('profiles').update({
          plan: 'pro',
          stripe_customer_id: session.customer as string
        }).eq('id', userId);

        if (orgId) {
          await supabase.from('organizations').update({
            subscription_tier: 'pro',
            subscription_status: 'active'
          }).eq('id', orgId);
        }

        console.log(`Pro subscription activated: ${userId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
