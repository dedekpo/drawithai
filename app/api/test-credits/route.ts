import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  console.log("🔍 Test Credits API: Starting test");
  
  try {
    console.log("🔍 Test Credits API: Getting session...");
    const session = await auth();
    
    console.log("🔍 Test Credits API: Session data:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    });
    
    if (!session?.user?.email) {
      console.log("❌ Test Credits API: No session or email found");
      return NextResponse.json(
        { error: "Não autorizado", hasSession: false },
        { status: 401 }
      );
    }

    console.log("✅ Test Credits API: Session is valid");
    
    // Return test data without touching Firebase
    return NextResponse.json({ 
      credits: 5, // Test value
      email: session.user.email,
      timestamp: new Date().toISOString(),
      test: true
    });
  } catch (error) {
    console.error("❌ Test Credits API: Error occurred:", error);
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