import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { firebaseCreditManager } from "@/app/lib/firebase-credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Adicionar créditos ao usuário
      if (session.metadata?.userEmail && session.metadata?.credits) {
        const email = session.metadata.userEmail;
        const creditsToAdd = parseInt(session.metadata.credits);
        
        try {
          const newCredits = await firebaseCreditManager.addCredits(email, creditsToAdd);
          
          console.log(`Créditos adicionados: ${creditsToAdd} para ${email}`);
          console.log(`Total de créditos: ${newCredits}`);
        } catch (error) {
          console.error('Erro ao adicionar créditos via webhook:', error);
          // Não retornar erro para não afetar o webhook do Stripe
        }
      }
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}