"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";



function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("ID da sessão não encontrado");
      setLoading(false);
      return;
    }

    // Verificar o pagamento
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setLoading(false);
        } else {
          setError(data.error || "Erro ao verificar pagamento");
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        setError("Erro ao verificar pagamento");
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando pagamento...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-slate-700 mb-4">
            Erro no Pagamento
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-700 mb-4">
          Pagamento Realizado com Sucesso!
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">⭐</span>
            <span className="text-xl font-bold text-green-600">7 Créditos</span>
          </div>
          <p className="text-green-700 text-sm">
            Foram adicionados à sua conta
          </p>
        </div>
        <p className="text-slate-600 mb-6">
          Agora você pode gerar 7 imagens incríveis com nossa IA!
        </p>
        <button
          onClick={handleGoHome}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Começar a Criar! 🎨
        </button>
      </div>
    </main>
  );
}
// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Carregando...</p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}