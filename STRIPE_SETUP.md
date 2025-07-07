# Configuração do Sistema de Pagamentos com Stripe

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Chaves da API do Stripe
3. Configuração de webhook

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Configuração do Webhook no Stripe

1. Acesse o Dashboard do Stripe
2. Vá em "Developers" > "Webhooks"
3. Clique em "Add endpoint"
4. URL do endpoint: `https://seu-dominio.com/api/webhook`
5. Selecione o evento: `checkout.session.completed`
6. Copie o "Signing secret" para a variável `STRIPE_WEBHOOK_SECRET`

### 3. Instalação de Dependências

```bash
npm install stripe
```

## 💰 Como Funciona

### Sistema de Créditos
- **Preço**: R$ 20,00
- **Créditos**: 7 créditos por compra
- **Uso**: 1 crédito = 1 geração de imagem

### Fluxo de Pagamento
1. Usuário clica em "Comprar Créditos"
2. Redirecionamento para Stripe Checkout
3. Após pagamento bem-sucedido:
   - Webhook recebe confirmação
   - 7 créditos são adicionados à conta
   - Usuário é redirecionado para página de sucesso

### APIs Criadas
- `GET /api/credits` - Buscar créditos do usuário
- `POST /api/credits` - Adicionar/subtrair créditos
- `POST /api/create-checkout-session` - Criar sessão de pagamento
- `POST /api/webhook` - Receber confirmações do Stripe
- `GET /api/verify-payment` - Verificar status do pagamento

## 🔒 Segurança

- Verificação de assinatura do webhook
- Autenticação obrigatória para todas as operações
- Validação de créditos antes da geração

## 🚀 Produção

Para produção, você precisará:

1. Substituir as chaves de teste pelas chaves de produção
2. Configurar um banco de dados real (PostgreSQL, MongoDB, etc.)
3. Implementar sistema de logs
4. Configurar monitoramento de webhooks

## 📱 Interface do Usuário

- **Exibição de créditos** em tempo real
- **Botão de compra** integrado
- **Validação visual** quando sem créditos
- **Página de sucesso** após pagamento
- **Mensagens de erro** claras

## 🛠️ Desenvolvimento

Para testar localmente:

1. Use as chaves de teste do Stripe
2. Configure ngrok para expor localhost: `ngrok http 3000`
3. Use a URL do ngrok para o webhook no Stripe
4. Teste com cartões de teste do Stripe

### Cartões de Teste
- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155