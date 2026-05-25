# BusTrack — versão corrigida para Render

## O que foi corrigido

1. **Porta do Render**
   - Removido o uso fixo de porta no `render.yaml`.
   - O servidor agora usa `process.env.PORT`, que é a porta automática fornecida pelo Render.

2. **Configuração do Render**
   - `render.yaml` atualizado com:
     - `buildCommand: npm ci --omit=dev --prefix backend`
     - `startCommand: node backend/server.js`
     - `healthCheckPath: /_health`
     - variáveis sensíveis como `MONGO_URI` e `JWT_SECRET` com `sync: false`.

3. **Conexão com MongoDB Atlas**
   - Validação clara se `MONGO_URI` não estiver configurada.
   - Timeout de conexão adicionado para evitar travamentos longos.
   - Logs mais claros para conexão, erro e desconexão.

4. **Health check**
   - A rota `/_health` agora informa se o banco está conectado.
   - Isso ajuda o Render a verificar se o serviço está saudável.

5. **Frontend mais resistente**
   - `authFetch` agora não quebra quando a resposta não vem em JSON.
   - Atualização de status reduzida de 15 segundos para 5 segundos nas telas de motorista, aluno e responsável.

6. **Segurança**
   - Removidos dados reais do `.env.example`.
   - O arquivo agora usa placeholders para `MONGO_URI` e `JWT_SECRET`.

## Variáveis que você precisa configurar no Render

No painel do Render, vá em **Environment** e crie:

```env
MONGO_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/bustrack?retryWrites=true&w=majority
MONGO_DB_NAME=bustrack
JWT_SECRET=um_segredo_grande_e_aleatorio
NODE_ENV=production
```

Não coloque `PORT` manualmente. O Render cria essa variável automaticamente.

## Build e Start no Render

Se você não usar o `render.yaml`, configure manualmente:

**Build Command**

```bash
npm ci --omit=dev --prefix backend
```

**Start Command**

```bash
node backend/server.js
```

**Health Check Path**

```text
/_health
```

## Sobre delays no Render

No plano gratuito do Render, o serviço pode hibernar depois de ficar sem uso. Quando alguém acessa depois disso, existe um atraso de inicialização chamado **cold start**. Isso não é erro do código. Para eliminar esse atraso totalmente, é necessário usar um plano pago ou uma hospedagem que não hiberne.

O código foi ajustado para iniciar da forma mais limpa possível, mas não há como remover 100% do cold start do plano gratuito apenas mexendo no projeto.
