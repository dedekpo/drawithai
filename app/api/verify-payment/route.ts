import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "ID da sessão é obrigatório" },
        { status: 400 }
      );
    }

    // Recuperar a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Pagamento não foi concluído" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}