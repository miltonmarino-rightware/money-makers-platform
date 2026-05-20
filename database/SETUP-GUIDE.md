# MONEY MAKERS PLATFORM — GUIA DE CONFIGURAÇÃO
## Do zero ao online em ordem

---

## PASSO 1 — Instalar dependência Supabase no projeto

Abre o terminal no VS Code (dentro da pasta `money-makers-platform`) e corre:

```bash
npm install @supabase/supabase-js
```

---

## PASSO 2 — Criar ficheiro .env.local

Na raiz do projeto (mesmo nível que `package.json`), cria um ficheiro chamado `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIza...
```

**Onde encontrar os valores Supabase:**
1. Vai ao teu projeto em https://supabase.com/dashboard
2. Clica em **Project Settings** (ícone de engrenagem, em baixo à esquerda)
3. Clica em **API**
4. Copia: **Project URL** → `VITE_SUPABASE_URL`
5. Copia: **anon public** → `VITE_SUPABASE_ANON_KEY`

**Gemini API Key (gratuito):**
1. Vai a https://aistudio.google.com/app/apikey
2. Clica em **Create API key**
3. Copia → `VITE_GEMINI_API_KEY`

---

## PASSO 3 — Correr os SQLs no Supabase

Vai ao teu projeto Supabase → **SQL Editor** → clica em **New query**

Corre os ficheiros pela ordem:

### 3.1 — Tabelas (01-schema.sql)
- Copia o conteúdo de `database/01-schema.sql`
- Cola no SQL Editor
- Clica **Run**
- Deve aparecer "Success" em verde

### 3.2 — Políticas RLS (02-rls-policies.sql)
- Copia o conteúdo de `database/02-rls-policies.sql`
- Cola e clica **Run**

### 3.3 — Storage Buckets (03-storage.sql)
- Copia o conteúdo de `database/03-storage.sql`
- Cola e clica **Run**

---

## PASSO 4 — Criar a conta do Admin (Owen)

### 4.1 — Criar utilizador no Supabase Auth
1. No Supabase, vai a **Authentication** → **Users**
2. Clica em **Invite user**
3. Coloca o email do Owen
4. Ele receberá um email para definir a password

### 4.2 — Promover a Admin
1. Volta ao **SQL Editor**
2. Abre `database/04-admin-seed.sql`
3. **Substitui** `owen@moneymakers.com` pelo email real do Owen
4. Corre o SQL

---

## PASSO 5 — Copiar os ficheiros src para o projeto

Os ficheiros da pasta `src/` deste ZIP substituem os equivalentes no teu projeto:

```
src/lib/supabase.ts          → substitui (ou cria se não existe)
src/types/database.ts        → substitui src/types/platform.ts
src/contexts/AuthContext.tsx → SUBSTITUI o AuthContext.tsx atual
src/services/supabase-services.ts → substitui src/services/api.ts
src/hooks/useGeminiChat.ts   → substitui src/hooks/useChatContext.tsx
```

**IMPORTANTE:** Depois de substituir o `AuthContext.tsx`, o `App.tsx` pode precisar
de ajuste porque o `user` agora é do tipo Supabase `User` em vez de `PlatformUser`.

No `App.tsx`, o guard `ProtectedRoute` usa `useAuth()`. Muda de:
```tsx
// ANTES
const { user } = useAuth();
if (!user) return <Navigate to="/auth/login" replace />;

// DEPOIS
const { user, role } = useAuth();
if (!user) return <Navigate to="/auth/login" replace />;
```

Para `AdminRoute`:
```tsx
// ANTES
if (user.role !== 'admin') ...

// DEPOIS
if (role !== 'admin') ...
```

---

## PASSO 6 — Testar localmente

```bash
npm run dev
```

Abre http://localhost:5173

- Tenta registar um novo utilizador → deve funcionar (sem mock)
- Faz refresh → deve continuar logado (sessão persistente)
- Faz login com o email do Owen → deve redirecionar para /admin

---

## PASSO 7 — Deploy no Vercel

1. Vai a https://vercel.com e faz login com GitHub
2. Importa o repositório `money-makers-platform`
3. Em **Environment Variables**, adiciona:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. Clica **Deploy**

**No Supabase**, adiciona o URL do Vercel às origens permitidas:
- **Authentication** → **URL Configuration**
- **Site URL**: `https://money-makers-platform.vercel.app`
- **Redirect URLs**: `https://money-makers-platform.vercel.app/**`

---

## VERIFICAÇÃO FINAL

Após tudo configurado, confirma:

```
□ npm install @supabase/supabase-js   ← correu sem erros
□ .env.local criado com os 3 valores
□ 01-schema.sql correu com sucesso
□ 02-rls-policies.sql correu com sucesso
□ 03-storage.sql correu com sucesso
□ 04-admin-seed.sql correu (com email do Owen)
□ Ficheiros src/ copiados para o projeto
□ npm run dev funciona sem erros
□ Registo de novo utilizador funciona
□ Login do Owen vai para /admin
□ Refresh não desloga o utilizador
```
