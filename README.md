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

## Versão final dos CRUDs (Sprint 03 — Lab03S03)

- **Autenticação:** login único para aluno, professor e empresa (login ou email + senha). A API emite um token JWT, e o front-end guarda a sessão e protege as rotas por perfil.
- **Aluno:** cadastro público com entrada automática no sistema. Cada aluno consulta, edita (inclusive a senha) e exclui apenas o próprio cadastro.
- **Empresa parceira:** cadastro público e listagem pública das parceiras. Cada empresa consulta, edita e exclui apenas o próprio cadastro.
- **Vantagens da empresa:** cadastro com descrição, foto (upload) e custo em moedas, além de edição, ativação/desativação e exclusão. Uma vantagem já resgatada é desativada em vez de excluída.
- **Professor:** lista os alunos da sua instituição, que é a base para o envio de moedas.
- **Testes:** 31 testes de integração da API com banco PostgreSQL real (`cd backend && npm test`).
- **Modelos atualizados:** [diagrama de componentes](docs/diagramas/componentes/diagrama-de-componentes.png) e [estratégia de persistência](docs/persistencia.md).

### Estrutura do código

```
backend/
  prisma/schema.prisma      # modelo de dados (ORM) + migrations/ + seed.js + dados.js
  src/
    routes/                 # rotas REST e regras de acesso por perfil
    controllers/            # Controller (HTTP)
    services/               # regras de negócio, validação e autenticação
    dao/                    # padrão DAO sobre o Prisma
    middlewares/            # autenticação JWT, autorização, upload, erros
    config/  utils/
  tests/                    # testes de integração (node:test + supertest)
frontend/
  src/
    api/                    # comunicação com o back-end (Axios + token)
    contexts/AuthContext    # sessão do usuário
    pages/                  # alunos/, empresas/, professor/, vantagens/, Login
    components/             # Layout, RotaProtegida, Campo, Alerta...
```

### Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | público | Login (login ou email + senha) → token JWT |
| GET | `/api/auth/eu` | autenticado | Dados do usuário logado |
| GET | `/api/instituicoes` | público | Instituições pré-cadastradas |
| POST | `/api/alunos` | público | Cadastro de aluno |
| GET | `/api/alunos` | professor | Alunos da instituição do professor |
| GET / PUT / DELETE | `/api/alunos/:id` | o próprio aluno | Consulta / atualiza / exclui |
| POST | `/api/empresas` | público | Cadastro de empresa parceira |
| GET | `/api/empresas` | público | Lista de empresas parceiras |
| GET / PUT / DELETE | `/api/empresas/:id` | a própria empresa | Consulta / atualiza / exclui |
| GET | `/api/vantagens` | autenticado | Aluno: catálogo ativo · Empresa: as suas |
| GET | `/api/vantagens/:id` | autenticado | Detalhe da vantagem |
| POST / PUT | `/api/vantagens[/:id]` | empresa dona | Cadastro / edição (multipart com `foto`) |
| DELETE | `/api/vantagens/:id` | empresa dona | Exclui ou, se já resgatada, desativa |

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

### Contas de demonstração (criadas pelo seed)

| Perfil | Login | Senha |
|---|---|---|
| Professora (PUC Minas) | `ana.souza` | `professor123` |
| Professor (UFMG) | `carlos.lima` | `professor123` |
| Aluna (PUC Minas) | `maria` | `123456` |
| Empresa parceira | `cantina` | `123456` |

Cada professor começa com o crédito de 1.000 moedas do semestre atual.

### Testes

```bash
cd backend
npm test   # cria/migra o banco moeda_estudantil_test e roda os testes de integração
```


