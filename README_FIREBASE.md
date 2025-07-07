# DrawItAI - Sistema de Créditos com Firebase

Este projeto agora utiliza o Firebase Firestore como banco de dados para gerenciar os créditos dos usuários de forma persistente e escalável.

## 🔥 Firebase Integration

### Funcionalidades implementadas:

- **Persistência de dados**: Os créditos são armazenados permanentemente no Firebase
- **Escalabilidade**: Suporte a múltiplas instâncias da aplicação
- **Segurança**: Dados protegidos com Firebase Admin SDK
- **Monitoramento**: Visualização em tempo real no console do Firebase

### Sistema de créditos:

- **Compra**: +7 créditos por compra (R$ 20,00)
- **Geração**: -1 crédito por imagem gerada
- **Verificação**: Validação automática antes da geração
- **Histórico**: Timestamps de criação e atualização

## 🚀 Configuração rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
Siga o guia detalhado em [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` e configure:
```env
# Firebase Admin
FIREBASE_PROJECT_ID=seu-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=seu-service-account@seu-projeto.iam.gserviceaccount.com
```

### 4. Testar conexão
```bash
npm run test-firebase
```

### 5. Executar aplicação
```bash
npm run dev
```

## 📊 APIs disponíveis

### Créditos do usuário
```http
GET /api/credits
```
Retorna os créditos do usuário logado.

```http
POST /api/credits
Content-Type: application/json

{
  "action": "add|subtract",
  "amount": 5
}
```

### Geração de imagem
```http
POST /api/generate
Content-Type: application/json

{
  "imageData": "data:image/png;base64,..."
}
```
Gera uma imagem e consome 1 crédito.

### Administração (opcional)
```http
GET /api/admin/credits
```
Lista todos os usuários e seus créditos (apenas administradores).

```http
POST /api/admin/credits
Content-Type: application/json

{
  "email": "usuario@email.com",
  "credits": 10,
  "action": "set|add|subtract"
}
```

## 🛠️ Scripts úteis

### Testar Firebase
```bash
npm run test-firebase
```
Verifica se a configuração do Firebase está correta.

### Migrar dados (opcional)
```bash
npm run migrate-firebase
```
Migra dados do sistema antigo para o Firebase.

## 📁 Estrutura do banco de dados

### Coleção: `user_credits`
```javascript
{
  email: "usuario@email.com",
  credits: 10,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Segurança

### Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_credits/{document} {
      allow read, write: if false; // Apenas via Admin SDK
    }
  }
}
```

### Autenticação
- Todas as operações requerem autenticação via NextAuth
- Apenas usuários logados podem acessar seus créditos
- Administradores têm acesso a funcionalidades extras

## 🚨 Troubleshooting

### Erro de autenticação Firebase
1. Verifique as variáveis de ambiente
2. Confirme se a chave privada está formatada corretamente
3. Verifique se o service account tem permissões

### Créditos não sendo adicionados
1. Verifique os logs do webhook do Stripe
2. Confirme se o Firestore está ativado
3. Verifique a conectividade com o Firebase

### Erro de conexão
```bash
npm run test-firebase
```
Execute este comando para diagnosticar problemas de conexão.

## 📈 Monitoramento

Acesse o console do Firebase para monitorar:
- Número de usuários
- Créditos por usuário
- Operações realizadas
- Logs de erro

Console: https://console.firebase.google.com/

## 🔄 Migração do sistema anterior

Se você estava usando o sistema de créditos em memória:

1. Edite `scripts/migrate-to-firebase.js`
2. Adicione os dados do sistema antigo
3. Execute: `npm run migrate-firebase`

## 📞 Suporte

Para problemas relacionados ao Firebase:
1. Consulte [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Execute `npm run test-firebase`
3. Verifique os logs do console do Firebase