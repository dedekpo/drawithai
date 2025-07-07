"use client";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSession } from "next-auth/react";

interface CreditSystemProps {
  onCreditsUpdate: (credits: number) => void;
  externalCredits?: number; // Créditos vindos de fora (após geração)
}

export interface CreditSystemRef {
  refreshCredits: () => Promise<void>;
}

const CreditSystem = forwardRef<CreditSystemRef, CreditSystemProps>(
  ({ onCreditsUpdate, externalCredits }, ref) => {
    const { data: session } = useSession();
    const [credits, setCredits] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string>("");

    // Buscar créditos do usuário
    useEffect(() => {
      if (session?.user?.email) {
        fetchCredits();
      }
    }, [session]);

    // Atualizar créditos quando receber valor externo
    useEffect(() => {
      if (externalCredits !== undefined && externalCredits !== credits) {
        setCredits(externalCredits);
        onCreditsUpdate(externalCredits);
      }
    }, [externalCredits, credits, onCreditsUpdate]);

    const fetchCredits = async () => {
      console.log("🔍 CreditSystem: Starting fetchCredits");
      setError(""); // Clear any previous errors
      
      try {
        setLoading(true);
        console.log("🔍 CreditSystem: Making API request to /api/credits");
        
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch("/api/credits", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("🔍 CreditSystem: API response status:", response.status);
        
        const data = await response.json();
        console.log("🔍 CreditSystem: API response data:", data);
        
        if (response.ok) {
          console.log("✅ CreditSystem: Successfully fetched credits:", data.credits);
          setCredits(data.credits);
          onCreditsUpdate(data.credits);
        } else {
          console.error("❌ CreditSystem: API returned error:", data);
          setError(`Erro ao carregar créditos: ${data.error || 'Erro desconhecido'}`);
          // Set credits to 0 if there's an error to prevent infinite loading
          setCredits(0);
          onCreditsUpdate(0);
        }
      } catch (error) {
        console.error("❌ CreditSystem: Error fetching credits:", error);
        console.error("❌ CreditSystem: Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        
        if (error instanceof Error && error.name === 'AbortError') {
          setError("Timeout ao carregar créditos. Tente novamente.");
        } else {
          setError("Erro de conexão ao carregar créditos. Verifique sua internet.");
        }
        
        // Set credits to 0 if there's an error to prevent infinite loading
        setCredits(0);
        onCreditsUpdate(0);
      } finally {
        console.log("🔍 CreditSystem: Finished fetchCredits, setting loading to false");
        setLoading(false);
      }
    };

    // Expor método para refresh externo
    useImperativeHandle(ref, () => ({
      refreshCredits: fetchCredits
    }));

    // Test function for debugging
    const testCreditsAPI = async () => {
      console.log("🔍 CreditSystem: Testing credits API...");
      try {
        const response = await fetch("/api/test-credits");
        const data = await response.json();
        console.log("🔍 CreditSystem: Test API response:", data);
        alert(`Test API Response: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error("❌ CreditSystem: Test API error:", error);
        alert(`Test API Error: ${error}`);
      }
    };

    const handlePurchaseCredits = async () => {
      if (!session?.user?.email) return;

      setPurchasing(true);
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.url) {
          // Redirecionar para o Stripe Checkout
          window.location.href = data.url;
        } else {
          alert("Erro ao criar sessão de pagamento. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro ao criar checkout:", error);
        alert("Erro ao processar pagamento. Tente novamente.");
      } finally {
        setPurchasing(false);
      }
    };

    return (
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-700">
            💳 Seus Créditos
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⭐</span>
            <span className="text-2xl font-bold text-purple-600">
              {loading ? "..." : credits}
            </span>
            <span className="text-slate-600">créditos</span>
            {error && (
              <button
                onClick={fetchCredits}
                className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Tentar novamente"
              >
                🔄
              </button>
            )}            <button
              onClick={testCreditsAPI}
              className="ml-2 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="Testar API"
            >
              🧪
            </button>          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">
                  Erro ao carregar créditos
                </p>
                <p className="text-red-700 text-sm">
                  {error}
                </p>
                <button
                  onClick={fetchCredits}
                  className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {credits === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">
                  Você não tem créditos suficientes
                </p>
                <p className="text-yellow-700 text-sm">
                  Compre créditos para continuar gerando imagens
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              🎨 Pacote de Créditos
            </h3>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-3xl font-bold text-purple-600">7</span>
              <span className="text-slate-600">créditos</span>
              <span className="text-slate-400">•</span>
              <span className="text-2xl font-bold text-green-600">R$ 10,00</span>
            </div>
            <p className="text-slate-600 text-sm">
              Cada crédito = 1 geração de imagem com IA
            </p>
          </div>

          <button
            onClick={handlePurchaseCredits}
            disabled={purchasing}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {purchasing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">💳</span>
                Comprar 7 Créditos por R$ 10,00
              </div>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              🔒 Pagamento seguro processado pelo Stripe
            </p>
          </div>
        </div>

        {credits > 0 && !loading && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="text-green-800 font-medium">
                  Você tem {credits} crédito{credits !== 1 ? 's' : ''} disponível{credits !== 1 ? 'is' : ''}
                </p>
                <p className="text-green-700 text-sm">
                  Pronto para gerar {credits} imagem{credits !== 1 ? 'ns' : ''} com IA!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CreditSystem.displayName = "CreditSystem";

export default CreditSystem;