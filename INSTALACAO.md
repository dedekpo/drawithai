# 🚀 Sistema de Pagamentos com Stripe - Instalação

## ✅ O que foi implementado

### 1. Sistema de Créditos
- **Preço**: R$ 20,00 por 7 créditos
- **Uso**: 1 crédito = 1 geração de imagem
- **Verificação**: Antes de cada geração

### 2. Componentes Criados
- `CreditSystem.tsx` - Interface de compra e exibição de créditos
- `credits.ts` - Gerenciador centralizado de créditos
- Página de sucesso após pagamento

### 3. APIs Implementadas
- `/api/credits` - Gerenciar créditos do usuário
- `/api/create-checkout-session` - Criar sessão de pagamento
- `/api/webhook` - Receber confirmações do Stripe
- `/api/verify-payment` - Verificar status do pagamento
- `/api/generate` - Atualizada para consumir créditos

## 🔧 Próximos Passos

### 1. Instalar Dependências
```bash
npm install stripe
```

### 2. Configurar Variáveis de Ambiente
Adicione ao seu `.env.local`:
```env
# Stripe (obtenha no dashboard do Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Configurar Webhook no Stripe
1. Acesse https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://seu-dominio.com/api/webhook`
3. Selecione evento: `checkout.session.completed`
4. Copie o signing secret

### 4. Testar Localmente
```bash
# Terminal 1 - Executar aplicação
npm run dev

# Terminal 2 - Expor localhost (para webhook)
npx ngrok http 3000
```

## 🎯 Funcionalidades

### Interface do Usuário
- ✅ Exibição de créditos em tempo real
- ✅ Botão de compra integrado
- ✅ Validação visual quando sem créditos
- ✅ Página de sucesso após pagamento
- ✅ Mensagens de erro claras

### Sistema de Pagamento
- ✅ Integração completa com Stripe
- ✅ Processamento seguro de pagamentos
- ✅ Confirmação via webhook
- ✅ Adição automática de créditos

### Controle de Acesso
- ✅ Verificação de créditos antes da geração
- ✅ Desconto automático após uso
- ✅ Sincronização em tempo real

## 🔒 Segurança Implementada

- ✅ Verificação de assinatura do webhook
- ✅ Autenticação obrigatória
- ✅ Validação de créditos server-side
- ✅ Tratamento de erros robusto

## 📱 Como Usar

1. **Usuário faz login** com Google
2. **Visualiza créditos** no topo da página
3. **Clica em "Comprar Créditos"** se necessário
4. **Paga R$ 20,00** via Stripe
5. **Recebe 7 créditos** automaticamente
6. **Gera imagens** consumindo 1 crédito por vez

## 🛠️ Para Produção

- [ ] Substituir chaves de teste por produção
- [ ] Implementar banco de dados real
- [ ] Configurar logs e monitoramento
- [ ] Adicionar sistema de backup
- [ ] Implementar rate limiting

## 📞 Suporte

O sistema está pronto para uso! Siga as instruções de configuração e teste com cartões de teste do Stripe antes de ir para produção.