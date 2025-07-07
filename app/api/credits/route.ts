import { NextRequest, NextResponse } from "next/server";
import { firebaseCreditManager } from "@/app/lib/firebase-credits";
import { auth } from "@/auth";

export async function GET() {
  console.log("🔍 Credits API: Starting GET request");
  
  try {
    console.log("🔍 Credits API: Getting session...");
    const session = await auth();
    
    console.log("🔍 Credits API: Session data:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    });
    
    if (!session?.user?.email) {
      console.log("❌ Credits API: No session or email found");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    console.log("🔍 Credits API: Fetching credits for email:", email);
    
    const credits = await firebaseCreditManager.getCredits(email);
    
    console.log("✅ Credits API: Successfully fetched credits:", credits);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("❌ Credits API: Error occurred:", error);
    console.error("❌ Credits API: Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Return a more detailed error response for debugging
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { action, amount } = await request.json();
    const email = session.user.email;

    if (action === "add") {
      const newCredits = await firebaseCreditManager.addCredits(email, amount);
      return NextResponse.json({ 
        credits: newCredits,
        success: true 
      });
    } else if (action === "subtract") {
      const result = await firebaseCreditManager.subtractCredits(email, amount);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ 
        credits: result.credits,
        success: true 
      });
    }

    return NextResponse.json(
      { error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao atualizar créditos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}