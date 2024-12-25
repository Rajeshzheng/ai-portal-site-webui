import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/db/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  console.log('Webhook event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const url = session.metadata.url;
    
    console.log('Processing completed session for URL:', url);

    const supabase = createClient();
    
    try {
      // 直接更新数据库，不验证URL
      const { error } = await supabase
        .from('submit')
        .update({ status: 1 })
        .eq('url', url);

      if (error) {
        console.error('Failed to update submit status in database:', error.message, {
          url,
          error: error.details
        });
      } else {
        console.log('Successfully updated status for URL:', url);
      }
    } catch (error) {
      console.error('Error during database update:', error);
    }
  }

  return NextResponse.json({ received: true });
}