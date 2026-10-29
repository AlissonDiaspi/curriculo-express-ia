# Currículo Express IA

Aplicação web gratuita para criar currículos profissionais com uma experiência guiada, modelos prontos e auxílio de inteligência artificial na escrita. O usuário informa seus próprios dados, escolhe um dos três modelos, revisa o documento e pode baixá-lo em **PDF ou DOCX**.

> **Princípio do projeto:** a IA auxilia na organização e melhoria da redação, sem inventar experiências, formações ou qualificações. Os layouts são definidos por templates DOCX, e não gerados pela IA.

## Funcionalidades

- Criação de currículo em etapas: informações pessoais, resumo, experiências, formação, habilidades e revisão.
- Três modelos profissionais com miniaturas de apresentação.
- Melhoria de resumo profissional e descrições de experiência com Google Gemini, conforme disponibilidade e limites da aplicação.
- Sessão anônima identificada por cookie `HttpOnly`, sem necessidade de criar conta.
- Persistência de currículos e controle de uso de IA em PostgreSQL.
- Pré-visualização do currículo em PDF.
- Download gratuito em PDF ou Word (`.docx`).
- Validação dos dados de entrada e verificação de acesso aos currículos da sessão.
- Interface responsiva.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Motion |
| Backend | NestJS 12, TypeScript, Zod |
| Banco de dados | PostgreSQL 17, Prisma 7 |
| IA | Google Gemini (`@google/genai`) |
| Documentos | Docxtemplater, PizZip, LibreOffice |
| Pré-visualizações dos modelos | PDF.js, `@napi-rs/canvas` |
| Infraestrutura local | Docker Compose, pnpm |
| Testes | Vitest, Supertest |

## Como funciona

1. O visitante inicia uma sessão anônima.
2. Preenche as informações do currículo no editor em etapas.
3. Opcionalmente, solicita melhorias de redação com IA para o resumo ou experiências.
4. Escolhe um dos três modelos e revisa os dados.
5. Visualiza a prévia em PDF.
6. Baixa o arquivo final em PDF ou DOCX.

O frontend envia as requisições à API NestJS com `credentials: 'include'`. A API utiliza a sessão para verificar o acesso aos currículos. Os documentos são gerados a partir de templates DOCX preenchidos com os dados informados; o LibreOffice é utilizado na conversão para PDF.

## Estrutura do repositório

```text
curriculo-express-ia/
├── apps/
│   ├── api/                 # API NestJS, Prisma, IA e geração de documentos
│   │   ├── prisma/          # Schema e migrations
│   │   ├── src/
│   │   └── .env.example
│   └── web/                 # Aplicação Next.js
│       ├── app/             # Rotas e páginas (conforme estrutura do projeto)
│       ├── lib/             # Cliente da API e constantes
│       ├── public/templates/# Miniaturas dos três modelos
│       └── .env.example
├── docker-compose.yml      # PostgreSQL local
├── package.json            # Scripts do monorepo
└── README.md
```

> O repositório pode conter outras pastas auxiliares. As aplicações utilizadas são `apps/api` e `apps/web`.

## Pré-requisitos

- Node.js compatível com as versões de Next.js e NestJS declaradas nos `package.json` (recomenda-se uma versão LTS atual).
- [pnpm](https://pnpm.io/installation).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) com Docker Compose.
- [LibreOffice](https://www.libreoffice.org/download/download-libreoffice/) instalado para gerar PDFs.
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/) para habilitar as melhorias com Gemini.

## Instalação e execução local

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/AlissonDiaspi/curriculo-express-ia
cd curriculo-express-ia
pnpm install
```



### 2. Configurar variáveis de ambiente

Copie os arquivos de exemplo:

**PowerShell (Windows):**

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

**Bash (Linux/macOS):**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edite `apps/api/.env` e informe a chave do Gemini, um modelo compatível e o caminho do executável do LibreOffice, se necessário. A conexão de banco fornecida no exemplo corresponde **exclusivamente** ao Docker Compose de desenvolvimento deste repositório.

O frontend usa `NEXT_PUBLIC_API_URL=http://localhost:3001`. O backend usa `FRONTEND_URL=http://localhost:3000` para a origem do frontend; confira eventuais ajustes de CORS e cookies em `apps/api/src/config/configure-http.ts` ao alterar endereços.


### 3. Iniciar o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d
```

O serviço utiliza PostgreSQL 17, banco `curriculo_express`, usuário `curriculo_user` e porta local `5432`. A senha configurada no Compose é apenas para desenvolvimento local.

### 4. Aplicar as migrations do Prisma

```bash
pnpm --dir apps/api exec prisma migrate deploy
pnpm --dir apps/api exec prisma generate
```

O `prisma.config.ts` da API lê `DATABASE_URL` do ambiente. Execute os comandos com a configuração do backend disponível em `apps/api/.env`.

### 5. Iniciar o backend e o frontend

Abra dois terminais na raiz do repositório.

**Terminal 1 — API:**

```bash
pnpm dev:api
```

**Terminal 2 — Web:**

```bash
pnpm dev:web
```

Acesse **http://localhost:3000**. A API utiliza **http://localhost:3001** por padrão.

### 6. Criar seu currículo

Na aplicação, siga as etapas do editor, escolha um modelo, revise o resultado e utilize os botões de pré-visualização ou download. As melhorias de texto por IA dependem da configuração e disponibilidade da API Gemini.

## Variáveis de ambiente

### Backend — `apps/api/.env`

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | String de conexão com PostgreSQL |
| `PORT` | Porta da API (padrão: `3001`) |
| `NODE_ENV` | Ambiente de execução |
| `FRONTEND_URL` | Origem do frontend |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `GEMINI_MODEL` | Identificador do modelo Gemini |
| `LIBREOFFICE_PATH` | Caminho do executável LibreOffice (`soffice`) |

### Frontend — `apps/web/.env.local`

| Variável | Finalidade |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Endereço-base da API NestJS, sem barra final |

> Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao navegador. Não coloque segredos nelas.

## Templates e geração de documentos

Os três modelos são identificados por `modelo-01`, `modelo-02` e `modelo-03`. O backend carrega o template DOCX selecionado, preenche os campos e gera o arquivo Word. Para PDF, converte o DOCX com LibreOffice.

As miniaturas exibidas no frontend ficam em `apps/web/public/templates/`. Após modificar os templates DOCX do backend, é possível regenerar essas imagens com:

```bash
pnpm --dir apps/api exec tsx src/documents/generate-template-images.ts
```

O script usa dados fictícios, gera um PDF de cada modelo, renderiza a primeira página em PNG e substitui as três miniaturas.

## Testes

Os testes do backend utilizam Vitest. Para executá-los:

```bash
pnpm --dir apps/api test
```

Para testes end-to-end, quando o ambiente estiver preparado:

```bash
pnpm --dir apps/api test:e2e
```



- O acesso aos currículos é associado a sessões anônimas com cookie `HttpOnly`.
- Os dados são validados no backend e o acesso aos documentos exige verificação da sessão.
- A IA pode estar indisponível ou sujeita a limites de uso; ela não deve ser tratada como fonte de fatos sobre a experiência do usuário.
- O projeto foi preparado para execução **local**; este README não descreve deploy em produção.
- A geração de PDF depende do LibreOffice instalado e acessível pelo backend.
- O banco de dados de desenvolvimento e as credenciais de exemplo não devem ser utilizados em produção.

## Motivação

O Currículo Express IA foi desenvolvido para unir uma interface acessível, edição guiada, geração real de documentos e uso responsável de IA em um fluxo simples de criação de currículos. O projeto também explora integração frontend/backend, persistência de dados, sessões anônimas, processamento de documentos e testes automatizados.

