# Histórias de Usuário — Sistema de Moeda Estudantil

Formato: **Como** [papel], **quero** [ação], **para** [benefício]. Cada história indica o caso de uso relacionado no [Diagrama de Casos de Uso](diagramas/casos-de-uso/casos-de-uso.png).

---

## Aluno

### US01 — Cadastro de aluno
**Como** aluno, **quero** me cadastrar no sistema de mérito, **para** poder receber moedas dos meus professores.

**Critérios de aceitação:**
- O cadastro exige nome, email, CPF, RG, endereço, instituição de ensino, curso, login e senha.
- A instituição é escolhida em uma lista de instituições pré-cadastradas.
- CPF, email e login devem ser únicos; dados inválidos ou duplicados são rejeitados com mensagem clara.
- A senha é armazenada de forma criptografada.
- O aluno começa com saldo de 0 moedas.

**Caso de uso:** Cadastrar-se como aluno

### US02 — Gerenciar perfil de aluno
**Como** aluno, **quero** consultar, editar e excluir meus dados cadastrais, **para** mantê-los atualizados ou deixar o programa.

**Critérios de aceitação:**
- O aluno autenticado visualiza todos os seus dados (exceto a senha).
- Pode alterar qualquer campo, respeitando as mesmas validações do cadastro.
- A exclusão da conta exige confirmação.

**Caso de uso:** Gerenciar perfil de aluno

### US11 — Extrato do aluno
**Como** aluno, **quero** consultar meu extrato, **para** saber quantas moedas tenho e como as recebi ou usei.

**Critérios de aceitação:**
- Exibe o saldo atual.
- Lista as moedas recebidas (data, professor, valor e motivo) e as trocas realizadas (data, vantagem, valor e código do cupom), em ordem cronológica decrescente.

**Caso de uso:** Consultar extrato

### US12 — Listar vantagens
**Como** aluno, **quero** ver as vantagens disponíveis, **para** escolher em que trocar minhas moedas.

**Critérios de aceitação:**
- Cada vantagem mostra nome, descrição, foto, custo em moedas e empresa parceira.
- Só aparecem vantagens ativas.

**Caso de uso:** Listar vantagens

### US13 — Resgatar vantagem
**Como** aluno, **quero** trocar minhas moedas por uma vantagem, **para** usufruir do reconhecimento que recebi.

**Critérios de aceitação:**
- O resgate só é permitido se o saldo do aluno for maior ou igual ao custo da vantagem.
- O custo é descontado do saldo do aluno no momento do resgate.
- O sistema gera um código de cupom único.
- O aluno recebe por email um cupom com o código, para usar na troca presencial.
- A empresa parceira recebe por email o mesmo código, para conferir a troca.
- O resgate aparece no extrato do aluno.

**Caso de uso:** Resgatar vantagem («include» Gerar código de cupom, Enviar cupom ao aluno, Notificar empresa parceira)

### US09 — Notificação de recebimento de moedas
**Como** aluno, **quero** ser notificado por email quando receber moedas, **para** saber que fui reconhecido e por quê.

**Critérios de aceitação:**
- O email é enviado logo após a transferência.
- Informa o professor, a quantidade de moedas e o motivo.

**Caso de uso:** Notificar aluno por email

---

## Professor

### US08 — Enviar moedas
**Como** professor, **quero** enviar moedas a um aluno, **para** reconhecer seu bom comportamento ou participação.

**Critérios de aceitação:**
- O professor seleciona um aluno da sua instituição, informa a quantidade e um motivo (obrigatório).
- A quantidade deve ser maior que zero e menor ou igual ao saldo do professor.
- O valor é debitado do saldo do professor e creditado ao do aluno.
- A transação é registrada com data e hora e dispara o email da US09.

**Caso de uso:** Enviar moedas

### US10 — Extrato do professor
**Como** professor, **quero** consultar meu extrato, **para** acompanhar meu saldo e as moedas que já distribuí.

**Critérios de aceitação:**
- Exibe o saldo atual.
- Lista os envios (data, aluno, valor e motivo) e os créditos semestrais recebidos.

**Caso de uso:** Consultar extrato

### US14 — Crédito semestral
**Como** professor, **quero** receber 1.000 moedas a cada semestre, **para** ter saldo para reconhecer meus alunos.

**Critérios de aceitação:**
- No início de cada semestre, o sistema credita automaticamente 1.000 moedas a cada professor.
- O crédito é cumulativo: soma-se ao saldo atual, sem zerá-lo.
- Cada professor recebe no máximo um crédito por semestre.

**Caso de uso:** Creditar 1.000 moedas semestrais (ator: Tempo/Agendador)

---

## Empresa parceira

### US03 — Cadastro de empresa parceira
**Como** empresa parceira, **quero** me cadastrar no sistema, **para** oferecer vantagens aos alunos.

**Critérios de aceitação:**
- O cadastro exige nome, CNPJ, email, login e senha.
- CNPJ, email e login devem ser únicos.
- A senha é armazenada de forma criptografada.

**Caso de uso:** Cadastrar-se como empresa

### US04 — Gerenciar perfil de empresa
**Como** empresa parceira, **quero** consultar, editar e excluir meus dados, **para** mantê-los atualizados.

**Critérios de aceitação:**
- A empresa autenticada visualiza e edita seus dados com as mesmas validações do cadastro.
- A exclusão exige confirmação e remove as vantagens da empresa. Se alguma vantagem já tiver sido resgatada, a exclusão é bloqueada para preservar o histórico dos alunos.

**Caso de uso:** Gerenciar perfil de empresa

### US06 — Cadastrar vantagem
**Como** empresa parceira, **quero** cadastrar vantagens, **para** que os alunos possam trocá-las por moedas.

**Critérios de aceitação:**
- A vantagem exige nome, descrição, foto do produto e custo em moedas (inteiro maior que zero).
- A foto é enviada por upload (formatos de imagem comuns).
- A vantagem cadastrada fica visível para os alunos.

**Caso de uso:** Gerenciar vantagens

### US07 — Editar e remover vantagens
**Como** empresa parceira, **quero** editar ou remover minhas vantagens, **para** manter a oferta atualizada.

**Critérios de aceitação:**
- A empresa só altera as próprias vantagens.
- Uma vantagem removida deixa de aparecer para os alunos, mas os resgates já feitos continuam no histórico.

**Caso de uso:** Gerenciar vantagens

### US16 — Consultar cupons resgatados
**Como** empresa parceira, **quero** ver os cupons gerados para as minhas vantagens, **para** conferir o código quando o aluno vier fazer a troca. *(Incluída na Release 02.)*

**Critérios de aceitação:**
- Lista data, código do cupom, aluno, vantagem e valor em moedas, do mais recente para o mais antigo.
- A empresa só vê os resgates das próprias vantagens.

**Caso de uso:** Consultar cupons resgatados

---

## Todos os usuários

### US05 — Autenticação
**Como** aluno, professor ou empresa parceira, **quero** fazer login e logout com meu login e senha, **para** acessar as funcionalidades do meu perfil com segurança.

**Critérios de aceitação:**
- Credenciais inválidas são rejeitadas sem revelar qual campo está errado.
- Após o login, o usuário só acessa as funcionalidades do seu tipo de perfil.
- Todas as funcionalidades, exceto os cadastros de aluno e de empresa, exigem autenticação.
- Professores já vêm pré-cadastrados, com login e senha fornecidos pela instituição.

**Caso de uso:** Realizar login / Realizar logout

---

## Rastreabilidade (requisito → história)

| Requisito do enunciado | Histórias |
|---|---|
| Cadastro de aluno com instituição pré-cadastrada | US01, US02 |
| Professores pré-cadastrados e vinculados a uma instituição | US05, US08 |
| 1.000 moedas por semestre, cumulativas | US14 |
| Envio de moedas com saldo suficiente e motivo obrigatório | US08 |
| Notificação por email ao receber moedas | US09 |
| Extrato de professor e aluno | US10, US11 |
| Cadastro de empresa e de vantagens (descrição, foto, custo) | US03, US04, US06, US07 |
| Resgate com desconto do saldo, cupom e emails com código | US12, US13, US16 |
| Login e senha para todos os perfis | US05 |
