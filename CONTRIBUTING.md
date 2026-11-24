# Como contribuir

Este guia é para quem vai propor mudanças no projeto, em especial os grupos que farão a análise crítica e as refatorações GRASP da Sprint 03 (Lab04S03).

## Preparar o ambiente

Siga a seção [Como executar localmente](README.md#como-executar-localmente) do README. Antes de mudar qualquer coisa, confirme que os testes passam:

```bash
cd backend
npm test
```

## Fluxo de um pull request

1. Faça um **fork** do repositório e crie uma branch a partir da `main`, por exemplo `refatoracao/creator-vantagem`.
2. Faça **uma refatoração por pull request**. Fica mais fácil de revisar e de citar no relatório.
3. Rode `npm test` no `backend/` e `npm run build` no `frontend/`. Uma refatoração não deve mudar o comportamento, então os testes existentes precisam continuar passando sem ajustes.
4. Abra o pull request contra a `main` deste repositório. O modelo de descrição já pede o padrão GRASP, o código antes e depois e a justificativa.

## Mapa do código para a análise

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Rotas | `backend/src/routes/` | URL, verbo e quem pode acessar (middlewares) |
| Controllers | `backend/src/controllers/` | Ler a requisição, chamar o service, escolher o status HTTP |
| Services | `backend/src/services/` | Regras de negócio e validação |
| DAOs | `backend/src/dao/` | Acesso ao banco via Prisma e tradução de erros do banco |
| Modelo | `backend/prisma/schema.prisma` | Tabelas, relações e restrições |
| Front-end | `frontend/src/` | Páginas React, sessão (`AuthContext`) e cliente HTTP (`api/`) |

Os diagramas UML estão em `docs/diagramas/` (fonte `.puml` e imagem `.png`). Se uma refatoração mudar nomes de classes ou responsabilidades, atualize o `.puml` correspondente e gere o PNG com o [PlantUML](https://plantuml.com/).

## Convenções

- Código e mensagens ao usuário em português; nomes de classes, métodos e variáveis sem acento.
- JavaScript com módulos ES (`import`/`export`) e o estilo dos arquivos vizinhos.
- Toda regra nova de negócio vem acompanhada de um teste em `backend/tests/`.
