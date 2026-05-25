# Deploy no Render — passo a passo rápido

Este arquivo descreve como usar o script `deploy_render.sh` para configurar variáveis de ambiente (secrets) e acionar o deploy do serviço no Render via API.

ATENÇÃO: o script usa a API pública do Render — mantenha a `RENDER_API_KEY` em segurança.

Pré-requisitos
- Ter um serviço já criado no Render que aponte para este repositório (pode criar pelo painel). Anote o `Service ID` do serviço.
- Ter uma Render API Key com permissões para editar o serviço.
- Ter a `MONGO_URI` do MongoDB Atlas e um `JWT_SECRET` forte.
- `jq` disponível localmente (para saída formatada).

Como usar

1. Clone/entre no repositório e dê permissão de execução ao script:

```bash
cd /path/to/bustrack
chmod +x deploy_render.sh
```

2. Exporte as variáveis necessárias (ou coloque na mesma linha ao executar):

```bash
export RENDER_API_KEY="<sua_render_api_key>"
export RENDER_SERVICE_ID="<seu_service_id>"
export MONGO_URI="mongodb+srv://user:pass@cluster0.../bustrack?retryWrites=true&w=majority"
export JWT_SECRET="uma_senha_segura_aqui"
export MONGO_DB_NAME="bustrack"  # opcional

./deploy_render.sh
```

O que o script faz
- Cria/atualiza as env vars `MONGO_URI`, `MONGO_DB_NAME` e `JWT_SECRET` no serviço Render informado.
- Aciona um novo deploy (POST /services/{serviceId}/deploys) para iniciar o build com os novos valores.

Se preferir fazer tudo pelo painel do Render (UI), siga o README principal e defina as mesmas variáveis na seção `Environment` do serviço.

Troubleshooting
- Se o deploy falhar por conexão com Mongo, verifique a `MONGO_URI` e na sua conta Atlas permita acessos (IP Access List) para o Render.
- Logs: acesse o painel do serviço no Render → `Logs` para ver saída do build e do `server.js`.

Contato
- Se quiser, posso executar/validar os passos enquanto você cola a API key (opção A). Caso contrário, rode o script localmente.
