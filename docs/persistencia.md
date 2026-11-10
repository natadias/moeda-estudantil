# Estratégia de acesso ao banco de dados

## Visão geral

A persistência combina duas abordagens:

1. **ORM: Prisma.** O esquema do banco é declarado em [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). A partir dele, o Prisma gera as migrações SQL em `backend/prisma/migrations/` e um cliente tipado para consultas.
2. **Padrão DAO.** Cada entidade tem um DAO em [`backend/src/dao/`](../backend/src/dao/), e somente os DAOs falam com o Prisma. Os Services (regras de negócio) usam os DAOs e não sabem que existe um ORM por baixo.

```
Controller ──> Service ──> DAO ──> Prisma Client ──> PostgreSQL
 (HTTP)       (regras)   (acesso)     (ORM)
```

## Por que ORM + DAO

| Decisão | Motivo |
|---|---|
| Prisma como ORM | O esquema declarativo fica versionado junto com o código, as migrações são geradas automaticamente, as consultas são tipadas e as relações aninhadas (aluno + usuário + endereço) são gravadas numa única operação. |
| DAO sobre o ORM | Isola as camadas superiores do Prisma. Trocar de ORM ou de banco altera apenas os DAOs. Também concentra a tradução de erros do banco (chave duplicada, registro inexistente, FK violada) em erros de negócio, em [`daoErrors.js`](../backend/src/dao/daoErrors.js). |
| PostgreSQL | Banco relacional robusto, com suporte a enums, transações e restrições de unicidade. Roda localmente via Docker. |

## Mapeamento do diagrama de classes

O [modelo ER](diagramas/er/modelo-er.png) foi derivado do [diagrama de classes](diagramas/classes/diagrama-de-classes.png):

- **Herança `Usuario` → `Aluno` / `Professor` / `EmpresaParceira`:** uma tabela por classe (*class table inheritance*).
  - A tabela `usuario` guarda as credenciais comuns (email, login, senha com hash bcrypt).
  - Cada subclasse tem sua tabela, cuja PK é também FK para `usuario.id`.
  - Excluir o usuário remove a subclasse em cascata.
- **Herança `Transacao` → `TransferenciaMoedas` / `ResgateVantagem` / `CreditoSemestral`:** uma única tabela `transacao` (*single table inheritance*), com a coluna `tipo` como discriminador. Isso simplifica o extrato, que é uma consulta só, ordenada por data.
- **Composição `Aluno` → `Endereco`:** tabela `endereco` com `aluno_id` único e exclusão em cascata.
- **Regras garantidas no banco:**
  - unicidade de email, login, CPF, CNPJ e código de cupom;
  - um crédito semestral por professor em cada semestre: `UNIQUE (professor_id, semestre)`;
  - transações não podem perder suas referências (`ON DELETE RESTRICT`).

## DAOs implementados

| DAO | Operações |
|---|---|
| `AlunoDAO` | `create`, `findAll`, `findById`, `update`, `delete`. Grava usuário, aluno e endereço numa única operação aninhada. |
| `EmpresaParceiraDAO` | `create`, `findAll`, `findById`, `update`, `delete`. Grava usuário e empresa; as vantagens são removidas em cascata. |
| `InstituicaoEnsinoDAO` | `findAll`, `findById`. As instituições são pré-cadastradas pelo seed. |
| `UsuarioDAO` | `findByLoginOuEmail`, `findById`. Usado pela autenticação (Sprint 03). |
| `VantagemDAO` | `create`, `findAll` (por empresa ou só ativas), `findById`, `update`, `delete`. Vantagens já resgatadas são desativadas em vez de apagadas (Sprint 03). |
| `ProfessorDAO` | `findById`. Professores são pré-cadastrados pelo seed; usado para filtrar os alunos da instituição do professor e para conferir o saldo no envio de moedas. |
| `TransacaoDAO` | `transferir` e `resgatar`: débito condicional (`saldo >= valor`) e crédito/registro numa única transação, para dois pedidos simultâneos nunca deixarem saldo negativo. `findExtrato` (por aluno, professor ou empresa) e `creditarSemestre`, protegido pela restrição única `(professor_id, semestre)` (Release 02). |

## Testes da camada de persistência

Os testes de integração em [`backend/tests/`](../backend/tests/) exercitam a API inteira (rotas → controllers → services → DAOs → PostgreSQL) num banco separado, `moeda_estudantil_test`. Cada arquivo começa com o banco limpo e com o seed aplicado:

```bash
cd backend
npm test
```

## Comandos

```bash
cd backend
npx prisma migrate dev     # aplica/cria migrações
npx prisma db seed         # instituições, professores e contas de demonstração
npx prisma studio          # inspeciona o banco no navegador
```
