# Sistema de Moeda Estudantil

Sistema para estimular o reconhecimento do mérito estudantil por meio de uma moeda virtual. Professores distribuem moedas aos alunos, e os alunos as trocam por produtos e descontos oferecidos por empresas parceiras.

## Stack

| Camada | Tecnologia |
|---|---|
| View (front-end) | React + Axios |
| Controller / Service | Node.js + Express |
| Model / persistência | Prisma ORM + PostgreSQL |
| Autenticação | JWT + bcrypt |
| Email | Nodemailer |
| Upload de imagens | Multer |
| Crédito semestral | node-cron |

Arquitetura: **MVC**.

## Modelagem (Sprint 01 — Lab03S01)

- [Histórias de Usuário](docs/historias-de-usuario.md)
- Diagrama de Casos de Uso: [PNG](docs/diagramas/casos-de-uso/casos-de-uso.png) · [fonte PlantUML](docs/diagramas/casos-de-uso/casos-de-uso.puml)
- Diagrama de Classes: [PNG](docs/diagramas/classes/diagrama-de-classes.png) · [fonte PlantUML](docs/diagramas/classes/diagrama-de-classes.puml)
- Diagrama de Componentes: [PNG](docs/diagramas/componentes/diagrama-de-componentes.png) · [fonte PlantUML](docs/diagramas/componentes/diagrama-de-componentes.puml)

## Persistência e CRUDs (Sprint 02 — Lab03S02)

- Modelo ER: [PNG](docs/diagramas/er/modelo-er.png) · [fonte PlantUML](docs/diagramas/er/modelo-er.puml)
- [Estratégia de acesso ao banco (Prisma ORM + padrão DAO)](docs/persistencia.md)
- CRUD de aluno e de empresa parceira: API REST em [backend/](backend/) e telas em [frontend/](frontend/)
- O diagrama de componentes foi atualizado para mostrar a camada DAO.

### Estrutura do código

```
backend/
  prisma/schema.prisma      # modelo de dados (ORM) + migrations/ + seed.js
  src/
    routes/                 # rotas REST
    controllers/            # Controller (HTTP)
    services/               # regras de negócio e validação
    dao/                    # padrão DAO sobre o Prisma
    middlewares/  utils/  config/
frontend/
  src/
    api/                    # comunicação com o back-end (Axios)
    pages/alunos/           # listagem e formulário de aluno
    pages/empresas/         # listagem e formulário de empresa
    components/
```

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/instituicoes` | Instituições pré-cadastradas |
| GET / POST | `/api/alunos` | Lista / cadastra aluno |
| GET / PUT / DELETE | `/api/alunos/:id` | Consulta / atualiza / exclui aluno |
| GET / POST | `/api/empresas` | Lista / cadastra empresa parceira |
| GET / PUT / DELETE | `/api/empresas/:id` | Consulta / atualiza / exclui empresa parceira |

### Como executar

Pré-requisitos: Node.js 20+ e Docker.

```bash
# 1. Banco de dados (PostgreSQL)
docker compose up -d

# 2. Back-end (http://localhost:3333/api)
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Front-end (http://localhost:5173), em outro terminal
cd frontend
npm install
npm run dev
```

O seed cria 3 instituições e 2 professores (logins `ana.souza` e `carlos.lima`, senha `professor123`), cada um com o crédito de 1.000 moedas do semestre atual.
