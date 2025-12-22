# iContas

Projeto iContas — aplicação para controle financeiro (backend Flask + frontend Vite/React).

## Objetivo deste README
Instruções rápidas para rodar localmente com Docker, variáveis de ambiente necessárias e como usar os workflows CI que criei.

---

## Requisitos
- Docker & Docker Compose
- Git
- (Opcional) GitHub CLI ou chave SSH para push em CI

## Variáveis de ambiente
Crie um arquivo `backend/.env` (NÃO COMITAR) ou configure as variáveis no seu ambiente/serviço de deploy:

- `DATABASE_URL` (opcional) — ex: `postgresql://user:pass@host:5432/db`
- `MAIL_SERVER` — ex: `smtp.gmail.com`
- `MAIL_PORT` — ex: `465`
- `MAIL_USERNAME` — seu e-mail de envio
- `MAIL_PASSWORD` — senha do app SMTP
- `MAIL_USE_TLS` — `True` ou `False`
- `MAIL_USE_SSL` — `True` ou `False`
- `JWT_SECRET_KEY` — chave secreta para JWT

> Use `backend/.env.example` como modelo (já incluído).

## Rodando com Docker Compose (desenvolvimento)
Na raiz do projeto:

```bash
# cria .env/local .env para backend (preencha as variáveis)
# Exemplo: backend/.env (copie backend/.env.example e preencha)

docker-compose up --build
```

- Backend ficará acessível em `http://localhost:5000`.
- Frontend será servido em `http://localhost:3000` (nginx serve o build).

## Rodando sem Docker (desenvolvimento)
- Backend:
  ```bash
  cd backend
  python -m venv venv
  venv\Scripts\activate   # Windows
  pip install -r requirements.txt
  flask run  # ou python app.py
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## GitHub Actions (CI)
Criei dois workflows:
- `.github/workflows/ci-backend.yml` — instala dependências Python, roda lint (flake8) e `pytest` (opcional).
- `.github/workflows/ci-frontend.yml` — instala dependências Node, roda lint, testes e build.

Os workflows são básicos e podem ser estendidos para publicar imagens Docker ou rodar deploy automático.

## Limpeza de segredos (o que foi feito)
- Removi segredos do histórico Git usando `git-filter-repo` (mirror + push forçado). Caso precise, confirme se todos os colaboradores devem re-clonar.
- Adicionei `.gitignore` e `backend/.env.example`.

## Próximos passos recomendados (prioridade)
1. Rotacionar quaisquer credenciais reais que podem ter sido expostas (SMTP, PATs, etc.).
2. Configurar CI para publicar imagens (Docker Hub/GitHub Packages) e deploy automático.
3. Adicionar testes unitários e E2E (Cypress / Playwright).
4. Implementar observabilidade (Sentry + logs + métricas).

## Contato / ajuda
Se quiser, eu posso:
- adicionar publish das imagens no CI;
- criar `CONTRIBUTING.md` e incluir convenções de commits;
- configurar testes E2E e cobertura automática;
- automatizar deploy no Render/AWS.

---

Arquivo gerado automaticamente por assistência — ajuste ao seu fluxo.
