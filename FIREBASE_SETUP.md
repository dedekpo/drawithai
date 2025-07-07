# Configuração do Firebase

Este projeto agora usa o Firebase Firestore como banco de dados para gerenciar os créditos dos usuários.

## Pré-requisitos

1. Conta no Google Cloud Platform
2. Projeto Firebase criado

## Passos para configuração

### 1. Criar projeto Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga os passos para criar um novo projeto
4. Ative o Firestore Database no modo de produção

### 2. Configurar Service Account

1. No console do Firebase, vá para "Configurações do projeto" (ícone de engrenagem)
2. Vá para a aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON

### 3. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Firebase Admin
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-chave-privada-aqui\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=seu-service-account@seu-projeto.iam.gserviceaccount.com
```

**Importante:** 
- Substitua `\n` por quebras de linha reais na chave privada
- Mantenha as aspas duplas ao redor da chave privada
- Você pode encontrar essas informações no arquivo JSON baixado

### 4. Estrutura do banco de dados

O sistema criará automaticamente uma coleção chamada `user_credits` com a seguinte estrutura:

```javascript
{
  email: "usuario@email.com",
  credits: 10,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 5. Regras de segurança do Firestore

Configure as seguintes regras no Firestore para segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas administradores podem acessar user_credits
    match /user_credits/{document} {
      allow read, write: if false; // Apenas via Admin SDK
    }
  }
}
```

## Funcionalidades implementadas

### Sistema de créditos

- **Compra de créditos**: Quando um usuário completa uma compra via Stripe, 7 créditos são automaticamente adicionados
- **Consumo de créditos**: Cada geração de imagem consome 1 crédito
- **Verificação de créditos**: O sistema verifica se o usuário tem créditos suficientes antes de gerar imagens
- **Persistência**: Os créditos são armazenados permanentemente no Firebase

### APIs disponíveis

- `GET /api/credits` - Busca os créditos do usuário logado
- `POST /api/credits` - Adiciona ou subtrai créditos (para administração)
- `POST /api/generate` - Gera imagem e consome 1 crédito
- `POST /api/webhook` - Webhook do Stripe que adiciona créditos após compra

## Migração do sistema anterior

O sistema anterior usava armazenamento em memória. Com o Firebase:

1. Os créditos agora são persistentes entre reinicializações do servidor
2. Múltiplas instâncias da aplicação podem compartilhar o mesmo banco de dados
3. Os dados são seguros e escaláveis
4. Possibilidade de implementar funcionalidades administrativas

## Monitoramento

Você pode monitorar o uso do Firebase através do console:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para "Firestore Database"
4. Visualize a coleção `user_credits` para ver todos os usuários e seus créditos

## Troubleshooting

### Erro de autenticação
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se de que a chave privada está formatada corretamente
- Verifique se o service account tem permissões adequadas

### Erro de conexão
- Verifique se o Firestore está ativado no projeto
- Confirme se o PROJECT_ID está correto
- Verifique a conectividade com a internet

### Créditos não sendo adicionados
- Verifique os logs do webhook do Stripe
- Confirme se os metadados estão sendo enviados corretamente
- Verifique se o webhook está configurado corretamente no Stripe