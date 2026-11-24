# Sistema de Moeda Estudantil

Sistema para estimular o reconhecimento do mérito estudantil por meio de uma moeda virtual. Professores distribuem moedas aos alunos, e os alunos as trocam por produtos e descontos oferecidos por empresas parceiras.

## Aplicação no ar

| | Endereço |
|---|---|
| Front-end (Vercel) | `https://<preencher-após-o-deploy>.vercel.app` |
| API (Render) | `https://<preencher-após-o-deploy>.onrender.com/api/health` |

A API está no plano gratuito do Render e hiberna após 15 minutos sem uso: **o primeiro acesso pode levar até 1 minuto**. Depois disso, responde normalmente.

### Contas de demonstração

Criadas pelo seed, que também restaura estas senhas toda vez que roda. Na nuvem, o seed roda a cada inicialização da API.

| Perfil | Login | Senha | O que dá para fazer |
|---|---|---|---|
| Professora (PUC Minas) | `ana.souza` | `professor123` | Ver alunos, enviar moedas, extrato |
| Professor (UFMG) | `carlos.lima` | `professor123` | Idem, para alunos da UFMG |
| Aluna (PUC Minas) | `maria` | `123456` | Perfil, catálogo, resgatar vantagem, extrato |
| Empresa parceira | `cantina` | `123456` | Gerenciar vantagens, ver cupons resgatados |

Também é possível criar um aluno ou uma empresa pela tela inicial. Professores são pré-cadastrados (não há cadastro de professor pela tela, conforme o enunciado).

### Roteiro de 5 minutos

1. Entre como `ana.souza` → **Enviar moedas** → escolha a Maria, 100 moedas e um motivo.
2. Saia e entre como `maria` → **Vantagens** → troque moedas pelo "Café com pão de queijo" e anote o cupom.
3. Veja o **Extrato** da Maria (+100, −30).
4. Saia e entre como `cantina` → **Cupons resgatados**: o mesmo código aparece ali.

Os emails (moedas recebidas, cupom do aluno, aviso à empresa) aparecem no log da API enquanto nenhum SMTP estiver configurado.

### Onde está cada coisa

| Artefato | Arquivo |
|---|---|
| Histórias de usuário | [docs/historias-de-usuario.md](docs/historias-de-usuario.md) |
| Casos de uso | [PNG](docs/diagramas/casos-de-uso/casos-de-uso.png) · [PlantUML](docs/diagramas/casos-de-uso/casos-de-uso.puml) |
| Classes | [PNG](docs/diagramas/classes/diagrama-de-classes.png) · [PlantUML](docs/diagramas/classes/diagrama-de-classes.puml) |
| Componentes | [PNG](docs/diagramas/componentes/diagrama-de-componentes.png) · [PlantUML](docs/diagramas/componentes/diagrama-de-componentes.puml) |
| Modelo ER | [PNG](docs/diagramas/er/modelo-er.png) · [PlantUML](docs/diagramas/er/modelo-er.puml) |
| Sequência (SD01–SD07) | [docs/diagramas/sequencia/](docs/diagramas/sequencia/) |
| Visão geral de interação | [PNG](docs/diagramas/visao-geral-interacao/visao-geral-interacao.png) · [PlantUML](docs/diagramas/visao-geral-interacao/visao-geral-interacao.puml) |
| Implantação | [PNG](docs/diagramas/implantacao/diagrama-de-implantacao.png) · [PlantUML](docs/diagramas/implantacao/diagrama-de-implantacao.puml) |
| Estratégia de persistência (ORM + DAO) | [docs/persistencia.md](docs/persistencia.md) |
| Apresentação da Sprint 03 | [docs/apresentacao/](docs/apresentacao/) |
| Como contribuir (pull requests de refatoração) | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Stack e arquitetura

| Camada | Tecnologia |
|---|---|
| View (front-end) | React 19 + Vite + React Router + Axios |
| Controller / Service | Node.js 22+ com Express 5 |
| Model / persistência | Prisma ORM (padrão DAO) + PostgreSQL 16 |
| Autenticação | JWT + bcrypt |
| Email | Nodemailer |
| Upload de imagens | Multer (fotos gravadas no banco) |
| Crédito semestral | node-cron |
| Testes | node:test + supertest, contra PostgreSQL real |
| Implantação | Vercel (front-end) + Render (API e banco) |

Arquitetura **MVC em camadas**: `routes → middlewares → controllers → services → DAOs → Prisma → PostgreSQL`. Só os DAOs conhecem o Prisma; só rotas e controllers conhecem HTTP.

## Como executar localmente

Pré-requisitos: **Node.js 22.12 ou mais novo** e **Docker** (para o PostgreSQL).

```bash
# 1. Banco de dados (PostgreSQL 16 na porta 5432)
docker compose up -d

# 2. Back-end — http://localhost:3333/api
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev

# 3. Front-end — http://localhost:5173 (em outro terminal)
cd frontend
npm install
npm run dev
```

Sem Docker: use qualquer PostgreSQL 14+ e ajuste `DATABASE_URL` no `backend/.env`.

Problemas comuns:

- **"Não foi possível conectar ao servidor" na tela de login:** a API não está rodando, ou o front-end foi aberto por outro endereço que não `http://localhost:5173` (a API só aceita a origem configurada em `CORS_ORIGIN`).
- **Erro de conexão com o banco:** confira com `docker ps` se o container `moeda-estudantil-db` está de pé.
- **Recomeçar do zero:** `cd backend && npx prisma migrate reset` apaga o banco de desenvolvimento, recria as tabelas e roda o seed.

### Testes

```bash
cd backend
npm test   # cria/migra o banco moeda_estudantil_test (separado) e roda os 43 testes de integração
```

## Implantação na nuvem (Lab04S02)

O [diagrama de implantação](docs/diagramas/implantacao/diagrama-de-implantacao.png) mostra a configuração. O deploy é automático a cada push na `main`.

**API e banco no Render** (definidos em [render.yaml](render.yaml)):

1. Em [render.com](https://render.com), **New → Blueprint** e escolha este repositório. O Render cria o PostgreSQL e o Web Service `moeda-estudantil-api`.
2. Preencha `CORS_ORIGIN` com o endereço do front-end na Vercel (pode ser mais de um, separados por vírgula). `JWT_SECRET` é gerado automaticamente.
3. Ao iniciar, o serviço roda `prisma migrate deploy`, o seed e a API. Confira em `https://<servico>.onrender.com/api/health`.

**Front-end na Vercel** (configuração em [frontend/vercel.json](frontend/vercel.json)):

1. Em [vercel.com](https://vercel.com), **Add New → Project**, importe o repositório e defina **Root Directory = `frontend`**.
2. Crie a variável `VITE_API_URL = https://<servico>.onrender.com/api` e faça o deploy.
3. Volte ao Render e confirme que `CORS_ORIGIN` tem o endereço gerado pela Vercel.

Decisões tomadas para a nuvem:

- **Fotos no PostgreSQL**: o disco do plano gratuito do Render é apagado a cada reinício, então as fotos das vantagens ficam em uma coluna `bytea` e são servidas por `GET /api/vantagens/:id/foto`, com cache longo no navegador.
- **Crédito semestral ao iniciar**: como o serviço gratuito hiberna, o agendador também credita o semestre corrente sempre que a API sobe. A restrição única `(professor_id, semestre)` impede crédito em dobro.
- **Seed a cada inicialização**: garante as contas de demonstração com as senhas da tabela acima para quem for avaliar.
- O banco gratuito do Render expira após 30 dias; depois disso é preciso recriá-lo (o seed repopula os dados de demonstração).

## Referência técnica

### Estrutura do código

```
backend/
  prisma/schema.prisma      # modelo de dados (ORM) + migrations/ + seed.js + dados.js + imagens/
  src/
    routes/                 # rotas REST e regras de acesso por perfil
    controllers/            # Controller (HTTP)
    services/               # regras de negócio, validação, autenticação e emails
    dao/                    # padrão DAO sobre o Prisma
    middlewares/            # autenticação JWT, autorização, upload, erros
    jobs/agendador.js       # crédito semestral (node-cron)
    config/  utils/
  tests/                    # testes de integração (node:test + supertest)
frontend/
  src/
    api/                    # comunicação com o back-end (Axios + token)
    contexts/AuthContext    # sessão do usuário
    pages/                  # alunos/, empresas/, professor/, transacoes/, vantagens/, Login
    components/             # Layout, RotaProtegida, Campo, Alerta...
render.yaml                 # infraestrutura no Render (API + PostgreSQL)
frontend/vercel.json        # build e rotas da SPA na Vercel
```

### Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/health` | público | Verificação de saúde (usada pelo Render) |
| POST | `/api/auth/login` | público | Login (login ou email + senha) → token JWT |
| GET | `/api/auth/eu` | autenticado | Dados do usuário logado |
| GET | `/api/instituicoes` | público | Instituições pré-cadastradas |
| POST | `/api/alunos` | público | Cadastro de aluno |
| GET | `/api/alunos` | professor | Alunos da instituição do professor |
| GET / PUT / DELETE | `/api/alunos/:id` | o próprio aluno | Consulta / atualiza / exclui (bloqueado se houver transações) |
| POST | `/api/empresas` | público | Cadastro de empresa parceira |
| GET | `/api/empresas` | público | Lista de empresas parceiras |
| GET / PUT / DELETE | `/api/empresas/:id` | a própria empresa | Consulta / atualiza / exclui (bloqueado se houver resgates) |
| GET | `/api/vantagens` | autenticado | Aluno: catálogo ativo · Empresa: as suas |
| GET | `/api/vantagens/:id` | autenticado | Detalhe da vantagem |
| GET | `/api/vantagens/:id/foto` | público | Imagem da vantagem |
| POST / PUT | `/api/vantagens[/:id]` | empresa dona | Cadastro / edição (multipart com `foto`) |
| DELETE | `/api/vantagens/:id` | empresa dona | Exclui ou, se já resgatada, desativa |
| POST | `/api/transferencias` | professor | Envia moedas `{alunoId, valor, motivo}` e notifica o aluno |
| POST | `/api/resgates` | aluno | Resgata `{vantagemId}`, gera o cupom e envia os emails |
| GET | `/api/extrato` | aluno, professor, empresa | Saldo e transações (empresa: cupons resgatados) |

### Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `DATABASE_URL` | backend | Conexão com o PostgreSQL |
| `PORT` | backend | Porta da API (padrão 3333; o Render define sozinho) |
| `CORS_ORIGIN` | backend | Endereços do front-end, separados por vírgula |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | backend | Assinatura e validade do token |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_REMETENTE` | backend | Opcionais; sem `SMTP_HOST` os emails vão para o log |
| `VITE_API_URL` | frontend (build) | Endereço da API; padrão `http://localhost:3333/api` |
