# Teste NODE — SPS Group

API REST de cadastro de usuários em Node.js, implementada como teste técnico.

---

## O que foi feito

O projeto partiu de um enunciado simples (CRUD de usuários com autenticação JWT e repositório em memória) e foi evoluído com melhorias de modernização sem alterar os requisitos originais.

### Alterações em relação a uma implementação básica

**TypeScript**
O código foi escrito inteiramente em TypeScript. Interfaces para `User` e `JwtPayload` ficam em `src/types.ts`, e o tipo `Request` do Express foi aumentado globalmente para carregar `req.user` sem casting manual.

**Separação de responsabilidades**
Em vez de um único arquivo com todas as rotas, o projeto foi organizado em módulos:
- `src/app.ts` — configuração do Express (CORS, JSON, rotas)
- `src/index.ts` — apenas sobe o servidor
- `src/routes/auth.ts` — rota de autenticação
- `src/routes/users.ts` — rotas de usuários
- `src/routes/index.ts` — agrega e exporta os roteadores
- `src/repository.ts` — repositório em memória com funções puras
- `src/middleware/auth.ts` — middleware JWT isolado
- `src/schemas.ts` — schemas de validação

**Validação de entrada com Zod**
Os bodies de todas as rotas são validados via Zod antes de qualquer lógica de negócio. Erros de validação retornam `400` com os detalhes dos campos inválidos.

**Express 5**
O projeto usa Express 5 (`^5.0.1`), que trata erros assíncronos nativamente sem precisar de `next(err)` manual em cada handler.

**Testes automatizados com Vitest + Supertest**
Testes de integração cobrem todos os endpoints (`POST /auth`, `GET/POST/PUT/DELETE /users`) diretamente sobre a aplicação Express, sem mocks de banco — o repositório em memória já é isolável via `reset()`.

---

## Stack

| Camada | Lib |
|---|---|
| Runtime | Node.js + TypeScript (`tsx` em dev, `tsc` em build) |
| Framework | Express 5 |
| Autenticação | jsonwebtoken |
| Validação | Zod |
| Testes | Vitest + Supertest |
| Env | dotenv |

---

## Requisitos originais atendidos

- Repositório de usuários em memória
- Usuário admin pré-cadastrado (`admin@spsgroup.com.br` / `1234`)
- `POST /auth` — retorna JWT
- Todas as rotas de usuário protegidas por JWT
- `POST /users` — cria usuário, bloqueia e-mail duplicado
- `GET /users` — lista usuários
- `PUT /users/:id` — atualiza usuário
- `DELETE /users/:id` — remove usuário

---

## Como rodar

```bash
# instalar dependências
yarn

# criar arquivo de ambiente
cp .env.example .env   # ou edite o .env existente

# desenvolvimento (hot reload + inspector na porta 7000)
yarn dev

# testes
yarn test

# build de produção
yarn build
yarn start
```

### Variáveis de ambiente (`.env`)

```env
PORT=3000
JWT_SECRET=sua_chave_secreta
```

---

## Endpoints

### `POST /auth`
Autentica e retorna um token JWT.

```json
// body
{ "email": "admin@spsgroup.com.br", "password": "1234" }

// response 200
{ "token": "<jwt>" }
```

### `GET /users` — requer `Authorization: Bearer <token>`
Retorna todos os usuários.

### `POST /users` — requer auth
```json
// body
{ "name": "João", "email": "joao@email.com", "type": "user", "password": "senha" }

// response 201
{ "id": 2, "name": "João", ... }
```

### `PUT /users/:id` — requer auth
Todos os campos são opcionais. Retorna `404` se o id não existir, `409` se o e-mail já pertencer a outro usuário.

### `DELETE /users/:id` — requer auth
Retorna `204` em caso de sucesso, `404` se não encontrar.

---

## Sobre o uso de IA neste projeto

O [Claude Code](https://claude.ai/code) (Anthropic) foi utilizado como ferramenta de auxílio durante o desenvolvimento. Nenhuma decisão de biblioteca, arquitetura ou estrutura de pastas foi tomada pela IA — todas as escolhas (Express, Zod, Vitest, separação de módulos, etc.) foram definidas pelo desenvolvedor. O Claude atuou exclusivamente como executor das instruções recebidas: escreveu, refatorou e organizou o código conforme guiado, sem propor alterações além do que foi solicitado.
