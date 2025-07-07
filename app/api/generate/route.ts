import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/auth";
import { firebaseCreditManager } from "@/app/lib/firebase-credits";

// Inicializar o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para converter data URL em base64 puro
function extractBase64FromDataUrl(dataUrl: string): string {
  const base64Index = dataUrl.indexOf(',');
  return base64Index !== -1 ? dataUrl.substring(base64Index + 1) : dataUrl;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Você precisa estar logado para usar esta funcionalidade" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Verificar se o usuário tem créditos suficientes
    const hasCredits = await firebaseCreditManager.hasCredits(userEmail, 1);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "Você não tem créditos suficientes. Compre mais créditos para continuar gerando imagens." },
        { status: 402 }
      );
    }

    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Dados da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Extrair base64 puro do data URL
    const base64Image = extractBase64FromDataUrl(imageData);

    // Usar a nova Responses API para editar/melhorar a imagem diretamente
    const prompt = `Transform this image into a professional art made by a professional artist usign an iPad.`;

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:image/png;base64,${base64Image}`,
              detail: "high",
            },
          ],
        },
      ],
      tools: [
        {
          type: "image_generation",
          quality: "medium",
          size: "1536x1024",
        },
      ],
    });

    // Extrair dados da imagem gerada
    const generatedImageData = response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    if (generatedImageData.length > 0) {
      const imageBase64 = generatedImageData[0];
      
      // Descontar 1 crédito do usuário após geração bem-sucedida
      const result = await firebaseCreditManager.subtractCredits(userEmail, 1);
      
      if (!result.success) {
        return NextResponse.json(
          { error: "Erro ao processar créditos" },
          { status: 500 }
        );
      }
      
      // Converter base64 para data URL para exibição
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      return NextResponse.json({ 
        imageUrl,
        message: "Imagem editada com sucesso!",
        creditsRemaining: result.credits
      });
    } else {
      // Se não houver imagem gerada, verificar se há conteúdo de texto
      const textContent = response.output
        .filter((output) => output.type === "message")
        .map((output) => output.content)
        .join(" ");

      return NextResponse.json(
        { error: `Falha ao gerar imagem. Resposta: ${textContent || "Nenhuma imagem foi gerada."}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Erro ao editar imagem:", error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: "Cota da API OpenAI esgotada. Verifique seu plano." },
          { status: 402 }
        );
      }
      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          { error: "Chave da API OpenAI inválida." },
          { status: 401 }
        );
      }
      if (error.message.includes('model_not_found')) {
        return NextResponse.json(
          { error: "Modelo não encontrado. Verifique se sua conta tem acesso ao GPT-4o." },
          { status: 403 }
        );
      }
      if (error.message.includes('responses')) {
        return NextResponse.json(
          { error: "Erro na API Responses. Verifique se sua conta tem acesso a esta funcionalidade." },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}