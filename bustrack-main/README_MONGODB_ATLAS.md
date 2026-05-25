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
MONGO_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=troque_para_um_seguro_secret
```

Substitua `<usuario>` e `<senha>` pelos dados do seu usuário MongoDB Atlas.

> Use o arquivo `backend/.env.example` como referência.

## Observação

O projeto atual não usa mais a integração com a API do CallMeBot, portanto a variável `ZAP_API_KEY` foi removida do exemplo de configuração.

## Implantação na Web

Este projeto já está pronto para rodar como um app web combinado (frontend + backend).

### Deploy no Render

1. Crie um repositório no GitHub e envie todo o conteúdo deste projeto.
2. No Render, crie um novo serviço do tipo **Web Service**.
3. Conecte o repositório GitHub.
4. O Render detectará o `render.yaml` e usará estas configurações:
   - `buildCommand`: `cd backend && npm install`
   - `startCommand`: `cd backend && npm start`
   - `envVars`: `MONGO_URI`, `PORT`
5. Defina os segredos no Render:
   - `MONGO_URI`: sua string do MongoDB Atlas
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
