# Amigo Secreto Seguro

Aplicação web completa para gerir um sorteio de Amigo Secreto de Natal, com foco em segurança e encriptação. Permite gerir participantes, realizar o sorteio de forma encriptada e que cada pessoa descubra apenas o seu amigo secreto através de uma chave única.

## Funcionalidades

- **Gestão de Participantes**: Listar, adicionar, editar, ativar/desativar e apagar participantes
- **Sorteio Automático**: Gerar emparelhamento válido (ninguém fica consigo próprio, mínimo 3 participantes)
- **Resultados Encriptados**: O emparelhamento é guardado encriptado na base de dados
- **Consulta por Chave**: Cada participante introduz a sua chave para descobrir apenas o seu amigo secreto
- **Login de Administração**: Área `/admin` protegida por autenticação (utilizador + password)

## Tecnologias

- **Frontend**: Angular 21
- **Backend**: Node.js + Express
- **Base de Dados**: MySQL
- **Encriptação**: AES-256-GCM (módulo crypto do Node.js)

## Instalação

### Pré-requisitos

- Node.js 18+
- npm
- MySQL 5.7+ ou 8+

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install

# No servidor
cd server
npm install
```

### 2. Configurar o servidor

```bash
cd server
npm run setup
```

Isto cria o ficheiro `.env` com uma chave de encriptação gerada automaticamente. Para produção, gere uma chave manualmente:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

E coloque no `.env`. Configure também as variáveis MySQL:

```
ENCRYPTION_KEY=sua_chave_hex_64_caracteres
ADMIN_AUTH_SECRET=outra_chave_hex_64_caracteres
PORT=3000
CORS_ORIGIN=http://localhost:4200
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_password
MYSQL_DATABASE=amigo_secreto
```

### 3. Inicializar a base de dados

Certifique-se de que o MySQL está a correr. A base de dados `amigo_secreto` e as tabelas são criadas automaticamente ao iniciar o servidor. Para criar manualmente:

```bash
cd server
npm run init-db
```

## Como Correr o Projeto

### Opção A: Terminal único (recomendado para desenvolvimento)

```bash
npm run dev
```

Isto inicia o servidor (porta 3000) e o frontend Angular (porta 4200) em paralelo.

### Opção B: Dois terminais

**Terminal 1 - Servidor:**

```bash
npm run server
```

**Terminal 2 - Frontend:**

```bash
npm start
```

### Acesso

- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000/api
- **Login admin**: http://localhost:4200/admin/login
- **Área de administração** (protegida): http://localhost:4200/admin
- **Consulta do amigo secreto**: http://localhost:4200/consulta

Credenciais iniciais por defeito:
- Utilizador: `admin`
- Password: `admin123`

Estas credenciais são criadas automaticamente no primeiro arranque se a tabela `admins` estiver vazia. Recomenda-se alterar `ADMIN_PASSWORD` no `.env`.

## Área de Administração

Em `/admin` (após login) pode:

1. **Participantes** (rota padrão): Adicionar, editar, ativar/desativar e apagar participantes. Apenas participantes ativos entram no sorteio.
2. **Sorteio**: Clicar em "Gerar Sorteio" quando houver pelo menos 3 participantes ativos. Após o sorteio, são apresentadas as chaves para distribuir a cada participante.

## Abordagem de Encriptação

- **Algoritmo**: AES-256-GCM (encriptação autenticada)
- **Chave**: 32 bytes (256 bits) gerados aleatoriamente, guardados em variável de ambiente
- **Armazenamento**: Na tabela `participante_sorteio`, o campo `resultado_encriptado` guarda apenas o ID do amigo secreto encriptado (não o nome em texto claro)
- **Formato encriptado**: `iv:authTag:ciphertext` em base64 (IV e auth tag únicos por registo)
- **Tokens de consulta**: Cada participante recebe um token de 32 bytes em hexadecimal (64 caracteres), gerado com `crypto.randomBytes`, impossível de adivinhar

O emparelhamento completo nunca é desencriptado em conjunto; cada consulta desencripta apenas o resultado de um único participante após validação do token.

## Estrutura do Projeto

```
sorteio/
├── server/                 # Backend API
│   ├── db/
│   │   ├── database.js     # Conexão MySQL
│   │   ├── 001_initial.sql # Schema da base de dados
│   │   └── init.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── participantes.js
│   │   ├── sorteio.js
│   │   └── consulta.js
│   ├── services/
│   │   ├── admin-auth.js
│   │   ├── encryption.js   # AES-256-GCM
│   │   └── sorteio-logic.js
│   ├── middleware/
│   │   └── require-admin.js
│   ├── index.js
│   ├── setup.js
│   └── .env.example
├── src/
│   └── app/
│       ├── admin/          # Área de administração
│       ├── consulta/       # Página pública de consulta
│       ├── home/
│       └── services/
├── proxy.conf.json         # Proxy API em desenvolvimento
└── README.md
```

## Scripts Disponíveis

| Comando              | Descrição                              |
| -------------------- | -------------------------------------- |
| `npm start`          | Inicia o frontend Angular              |
| `npm run dev`        | Inicia servidor + frontend em paralelo |
| `npm run server`     | Inicia apenas o backend                |
| `npm run server:dev` | Backend em modo watch                  |
| `npm run build`      | Build de produção do frontend          |

## Acesso à Base de Dados

O MySQL pode ser acedido com qualquer cliente (MySQL Workbench, DBeaver, phpMyAdmin, etc.) ou via linha de comandos:

```bash
mysql -u root -p amigo_secreto
```

Tabelas: `participantes`, `sorteios`, `participante_sorteio`

Com autenticação admin, existe também:

- `admins`:
  - `id`
  - `username`
  - `nome`
  - `password_salt`
  - `password_hash`
  - `ativo`
  - `data_criacao`
  - `data_atualizacao`

## Produção

Para deploy em produção:

1. Configure `ENCRYPTION_KEY`, `CORS_ORIGIN` e variáveis `MYSQL_*` no servidor
2. Faça build do frontend: `npm run build`
3. Sirva os ficheiros de `dist/sorteio/browser/` (ou configure o servidor para o fazer)
4. Ou utilize um servidor web (nginx, etc.) como reverse proxy para a API

## Licença

Projeto académico.
