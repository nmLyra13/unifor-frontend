# UniProject — Frontend

Frontend do sistema universitário, integrado com o backend [Project-Unifor](https://github.com/EricNasciment/Project-Unifor).

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Firebase SDK** (autenticação com email/senha e Google)
- **Axios** com interceptor automático de token
- **React Router v6** com guards de role
- **Tailwind CSS** — tema dark academic (Crimson Pro + Plus Jakarta Sans)

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e preencha com as credenciais do seu projeto Firebase:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_API_URL=http://localhost:5000
```

> As credenciais estão no [Console Firebase](https://console.firebase.google.com) → Configurações do Projeto → Seus aplicativos → Web.

### 3. Rodar em desenvolvimento

```bash
# Backend primeiro (na pasta do Project-Unifor)
npm run dev   # porta 5000

# Frontend
npm run dev   # porta 3000
```

---

## Fluxo de autenticação

```
1. Usuário faz login (email/senha ou Google) via Firebase Auth no client
2. Firebase retorna um ID Token JWT
3. Toda requisição à API inclui: Authorization: Bearer <idToken>
4. O backend valida o token via Firebase Admin SDK
5. A role (aluno/professor/admin) é lida das Custom Claims do token
```

### Primeiro acesso

Ao logar pela primeira vez sem role definida, o usuário é redirecionado para `/setup` onde escolhe:
- **Aluno** → acesso a disciplinas e boletim
- **Professor** → acesso a disciplinas e alunos

> O Admin só pode ser definido via painel admin (por outro admin) ou via variável `ROOT_ADMIN_EMAIL` no backend.

---

## Estrutura de rotas

| Rota | Role(s) | Página |
|------|---------|--------|
| `/login` | pública | Login / Cadastro |
| `/setup` | pública (pós-login) | Configuração de perfil |
| `/aluno/disciplinas` | aluno, admin | Lista de disciplinas + matrícula |
| `/aluno/boletim` | aluno, admin | Boletim de notas |
| `/professor/disciplinas` | professor, admin | Gerenciar disciplinas |
| `/professor/alunos` | professor, admin | Listar alunos + lançar notas |
| `/admin/usuarios` | admin | CRUD de usuários |
| `/admin/disciplinas` | admin | CRUD de disciplinas |

---

## Build para produção

```bash
npm run build
npm run preview
```
