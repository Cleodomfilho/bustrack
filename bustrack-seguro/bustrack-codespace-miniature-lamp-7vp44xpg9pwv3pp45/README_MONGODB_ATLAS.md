# BusTrack Escolar com MongoDB Atlas

## Instalação

Entre na pasta backend:

```bash
cd backend
npm install
npm run dev
```

## Executar localmente

Para rodar o frontend e o backend juntos em um único servidor:

```bash
cd backend
npm start
```

Depois acesse `http://localhost:5000`.

## Configurar MongoDB Atlas

Edite o arquivo `.env` dentro de `backend/` com a URI do Atlas:

```env
PORT=5000
MONGO_URI=mongodb+srv://cleodomfilho:<db_password>@cleodomgomes.6miuahw.mongodb.net/?appName=cleodomgomes
ZAP_API_KEY=seu_callmebot_api_key
```

Substitua `<db_password>` pela senha do usuário `cleodomfilho` no MongoDB Atlas.

> Use o arquivo `backend/.env.example` como referência.

## Usar WhatsApp via API gratuita

Esta implementação usa a API gratuita do CallMeBot para enviar mensagens via WhatsApp.

1. Acesse https://www.callmebot.com/whatsapp.php
2. Siga as instruções para registrar seu número e obter a `API Key`
3. Preencha `ZAP_API_KEY` em `backend/.env`
4. Os responsáveis cadastrados em `Responsavel` receberão a mensagem via WhatsApp

> O serviço é gratuito para testes e não substitui um provedor pago em produção.

## Implantação na Web

Este projeto já está pronto para rodar como um app web combinado (frontend + backend).

### Deploy no Render

1. Crie um repositório no GitHub e envie todo o conteúdo deste projeto.
2. No Render, crie um novo serviço do tipo **Web Service**.
3. Conecte o repositório GitHub.
4. O Render detectará o `render.yaml` e usará estas configurações:
   - `buildCommand`: `cd backend && npm install`
   - `startCommand`: `cd backend && npm start`
   - `envVars`: `MONGO_URI`, `ZAP_API_KEY`, `PORT`
5. Defina os segredos no Render:
   - `MONGO_URI`: sua string do MongoDB Atlas
   - `ZAP_API_KEY`: sua chave CallMeBot
   - `PORT`: `5000` (opcional)
6. Ative o deploy automático para cada push.

### Como publicar

- Suba o projeto para o GitHub
- No Render, conecte o repositório
- Verifique se o `render.yaml` está presente na raiz do repo
- Configure as variáveis de ambiente no painel do Render
- Clique em `Deploy`

No servidor, use:

```bash
npm start
```

> O arquivo `render.yaml` está incluído na raiz do projeto para facilitar o deploy automático.

## API

- POST /api/responsaveis
- GET /api/responsaveis
