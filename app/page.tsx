"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import DrawingCanvas from "./components/DrawingCanvas";
import AuthButton from "./components/AuthButton";
import CreditSystem, { CreditSystemRef } from "./components/CreditSystem";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [drawingData, setDrawingData] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [userCredits, setUserCredits] = useState<number>(0);
  const [creditUpdateMessage, setCreditUpdateMessage] = useState<string>("");
  const creditSystemRef = useRef<CreditSystemRef>(null);

  const handleDrawingChange = (imageData: string) => {
    setDrawingData(imageData);
    setError(""); // Limpar erro quando usuário desenha
  };

  const handleCreditsUpdate = (credits: number) => {
    setUserCredits(credits);
  };

  const generateImage = async () => {
    if (!session) {
      setError("Você precisa estar logado para usar esta funcionalidade!");
      return;
    }

    if (!drawingData) {
      setError("Por favor, desenhe algo no canvas primeiro!");
      return;
    }

    if (userCredits < 1) {
      setError("Você não tem créditos suficientes! Compre mais créditos para continuar.");
      return;
    }

    setIsGenerating(true);
    setError("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: drawingData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedImage(data.imageUrl);
        // Atualizar créditos localmente primeiro para resposta imediata
        if (data.creditsRemaining !== undefined) {
          setUserCredits(data.creditsRemaining);
          // Forçar atualização do componente CreditSystem
          setCreditUpdateMessage(`✅ Imagem gerada! 1 crédito descontado. Restam ${data.creditsRemaining} créditos.`);
          setTimeout(() => setCreditUpdateMessage(""), 5000);
          
          // Depois forçar atualização do componente
          setTimeout(async () => {
            if (creditSystemRef.current) {
              await creditSystemRef.current.refreshCredits();
            }
          }, 100);
        }
      } else {
        if (response.status === 402) {
          setError("Você não tem créditos suficientes! Compre mais créditos para continuar.");
        } else {
          setError(data.error || "Erro ao editar imagem. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com Autenticação */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Image alt="DrawithAI logo" src="/icon1.png" width={50} height={50} />
              <h1 className="text-4xl font-bold text-slate-700">
                DrawithAI
              </h1>
            </div>
            <AuthButton />
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {session 
              ? "Desenhe algo no canvas e nossa IA irá transformar seu desenho em uma obra de arte profissional!"
              : "Faça login com sua conta Google para começar a transformar seus desenhos em obras de arte!"
            }
          </p>
        </div>

        {/* Conteúdo Principal */}
        {!session ? (
          // Tela de Login
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 max-w-md">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-2xl font-bold text-slate-700 mb-4">
                Acesso Restrito
              </h2>
              <p className="text-slate-600 mb-8">
                Para usar o DrawithAI, você precisa fazer login com sua conta Google.
              </p>
              <AuthButton centered />
            </div>
            
            {/* Preview das funcionalidades */}
            <div className="w-full max-w-2xl bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                💡 O que você pode fazer após o login
              </h3>
              <div className="flex flex-col md:flex-row gap-4 text-center">
                <div className="flex-1">
                  <div className="text-2xl mb-2">✏️</div>
                  <h4 className="font-medium text-slate-700 mb-1">Desenhe</h4>
                  <p className="text-slate-600 text-sm">
                    Crie seus desenhos no canvas interativo
                  </p>
                </div>
                <div className="flex-1">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-medium text-slate-700 mb-1">IA Transforma</h4>
                  <p className="text-slate-600 text-sm">
                    Nossa IA aprimora seus desenhos
                  </p>
                </div>
                <div className="flex-1">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-medium text-slate-700 mb-1">Arte Profissional</h4>
                  <p className="text-slate-600 text-sm">
                    Receba resultados incríveis
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Interface Principal (usuário logado)
          <div className="flex flex-col items-center space-y-8">
            
            {/* Sistema de Créditos */}
            <CreditSystem 
              ref={creditSystemRef}
              onCreditsUpdate={handleCreditsUpdate} 
              externalCredits={userCredits}
            />
            <div className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">
                ✏️ Área de Desenho
              </h2>
              <DrawingCanvas onDrawingChange={handleDrawingChange} />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="w-full max-w-2xl p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Mensagem de atualização de créditos */}
            {creditUpdateMessage && (
              <div className="w-full max-w-2xl p-4 bg-green-100/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-xl text-center">
                {creditUpdateMessage}
              </div>
            )}

            {/* Botão Grande para Gerar IA */}
            <button
              onClick={generateImage}
              disabled={isGenerating || !drawingData || userCredits < 1}
              className="w-full max-w-md px-8 py-6 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 text-white font-bold text-xl rounded-2xl hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Transformando desenho...
                </div>
              ) : userCredits < 1 ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🔒</span>
                  Sem Créditos - Compre Mais
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Transformar com IA ({userCredits} crédito{userCredits !== 1 ? 's' : ''})
                </div>
              )}
            </button>

            {/* Resultado - Quarto */}
            <div className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">
                🎨 Resultado da IA
              </h2>
              <div className="border-2 border-dashed border-slate-300 rounded-xl h-96 flex items-center justify-center bg-white/50">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Imagem transformada pela IA"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-lg">
                      {isGenerating 
                        ? "Transformando sua obra de arte..." 
                        : "Sua imagem transformada aparecerá aqui"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instruções Simplificadas */}
            <div className="w-full max-w-2xl bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                💡 Como Funciona
              </h3>
              <div className="flex flex-col md:flex-row gap-4 text-center">
                <div className="flex-1">
                  <div className="text-2xl mb-2">✏️</div>
                  <h4 className="font-medium text-slate-700 mb-1">Desenhe</h4>
                  <p className="text-slate-600 text-sm">
                    Crie seu desenho no canvas
                  </p>
                </div>
                <div className="flex-1">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-medium text-slate-700 mb-1">IA Transforma</h4>
                  <p className="text-slate-600 text-sm">
                    Nossa IA aprimora seu desenho
                  </p>
                </div>
                <div className="flex-1">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-medium text-slate-700 mb-1">Arte Profissional</h4>
                  <p className="text-slate-600 text-sm">
                    Receba o resultado aprimorado
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
