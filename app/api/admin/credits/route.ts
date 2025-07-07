import { NextRequest, NextResponse } from "next/server";
import { firebaseCreditManager } from "@/app/lib/firebase-credits";
import { auth } from "@/auth";

// Lista de emails de administradores (em produção, use um sistema mais robusto)
const ADMIN_EMAILS: string[] = [
  // Adicione aqui os emails dos administradores
  // "admin@exemplo.com"
];

async function isAdmin(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email);
}

// GET - Listar todos os usuários e seus créditos
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: "Acesso negado - apenas administradores" },
        { status: 403 }
      );
    }

    const users = await firebaseCreditManager.getAllUsers();
    
    return NextResponse.json({ 
      users,
      total: users.length 
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Definir créditos para um usuário específico
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: "Acesso negado - apenas administradores" },
        { status: 403 }
      );
    }

    const { email, credits, action } = await request.json();

    if (!email || credits === undefined) {
      return NextResponse.json(
        { error: "Email e créditos são obrigatórios" },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case "set":
        result = await firebaseCreditManager.setCredits(email, credits);
        break;
      case "add":
        result = await firebaseCreditManager.addCredits(email, credits);
        break;
      case "subtract":
        const subtractResult = await firebaseCreditManager.subtractCredits(email, credits);
        if (!subtractResult.success) {
          return NextResponse.json(
            { error: subtractResult.error },
            { status: 400 }
          );
        }
        result = subtractResult.credits;
        break;
      default:
        return NextResponse.json(
          { error: "Ação inválida. Use: set, add, ou subtract" },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      email,
      credits: result,
      action
    });
  } catch (error) {
    console.error("Erro ao gerenciar créditos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}