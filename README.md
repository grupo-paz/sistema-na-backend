# 🚀 Sistema de Gestão - Narcóticos Anônimos (NA)

Este é o repositório do nosso Projeto Integrador da disciplina "Projeto Integrador" na Faculdade de Tecnologia da Universidade Estadual de Campinas (FT/UNICAMP). Estamos construindo um sistema para ajudar um grupo de NA a organizar suas reuniões, eventos e comunicados.

---

### 🎯 O Problema que Estamos Resolvendo

A comunicação no grupo atualmente depende de cadernos físicos e WhatsApp. Isso causa problemas como perda de informações, dificuldade de organização e ruídos na comunicação.

Nosso objetivo é criar uma plataforma centralizada para acabar com essa bagunça. A ideia é ter um lugar único e confiável para todas as informações importantes, melhorando a comunicação e a eficiência do grupo.

### ✨ Features Principais

- **📅 Agenda de Reuniões:** Um calendário ou lista para ver todas as reuniões semanais.
- **🎉 Mural de Eventos:** Uma área para divulgar eventos únicos, como confraternizações e workshops.
- **📢 Dados da Secretaria:** Acesso rápido e transparente aos dados financeiros do grupo, como a Sétima Tradição.
- **👀 Acesso Público:** Membros podem consultar tudo sem precisar de login.
- **🔒 Painel Admin:** Uma área segura para os servidores de confiança gerenciarem as informações.

### 🛠️ Nossa Stack

| Área      | Tecnologias                                                  |
| --------- | ------------------------------------------------------       |
| **Backend** | Node.js, TypeScript, Express, Prisma, PostgreSQL, JWT, Zod |
                                      
### 🚀 Rodando o Backend Localmente

Guia para configurar e rodar o ambiente de desenvolvimento do backend.

**Você vai precisar de:**
* Node.js (v18+)
* NPM ou Yarn
* Git
* PostgreSQL
* Uma conta gratuita no **[Mailtrap.io](https://mailtrap.io/)** (para testar os e-mails)

**Passo a passo:**

1.  **Clone o repositório e instale as dependências:**
    ```bash
    git clone <URL_DO_REPOSITORIO_BACKEND>
    cd na-sistema
    npm install
    ```

2.  **Configure o Banco de Dados (PostgreSQL):**
    * Abra o `psql` ou a sua ferramenta de gestão de base de dados.
    * Execute os seguintes comandos SQL para criar o utilizador e o banco de dados para este projeto:

    ```sql
    -- Cria um utilizador (role) para a aplicação
    CREATE USER usuario_projeto WITH PASSWORD 'senha_projeto';

    -- Cria o banco de dados
    CREATE DATABASE na_api;

    -- Dá todas as permissões do banco para o novo utilizador
    GRANT ALL PRIVILEGES ON DATABASE na_api TO usuario_projeto;

    -- Permite que o novo utilizador crie outros bancos (necessário para o Prisma)
    ALTER USER usuario_projeto CREATEDB;
    ```

3.  **Configure as Variáveis de Ambiente (`.env`):**
    * Na pasta `na-sistema/backend`, copie o ficheiro `.env.example` para um novo ficheiro chamado `.env`.
    * Preencha-o com os seus dados. Ele deve ficar parecido com isto:
        ```env
        DATABASE_URL="postgresql://usuario_projeto:senha_projeto@localhost:5432/na_api"
        FRONTEND_URL="http://localhost:5173"

        # Credenciais do Gmail (Usar Senha de App de 16 dígitos)
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT=465
        EMAIL_USER="equipe.narcoticos.sa@gmail.com"
        EMAIL_PASS="SUA_SENHA_DE_APP_GMAIL"

        JWT_SECRET="um-segredo-qualquer-bem-longo"
        API_KEY="chave-secreta-da-api-12345"

        # E-mail do super admin
        SUPER_ADMIN_EMAIL="EMAIL_SUPER_ADMIN"

        # Senha padrão para o Super Admin
        SUPER_ADMIN_PASSWORD="SENHA_SUPER_ADMIN"
        ```

4.  **Prepare o Banco de Dados com o Prisma:**
    * Estes comandos vão criar as tabelas e popular o banco com o primeiro administrador.
    ```bash
    # Aplica as migrações (cria as tabelas)
    npx prisma migrate dev

    # Popula o banco com o primeiro admin (admin@admin.com / Admin@2025!)
    npx prisma db seed
    ```

5.  **Suba o servidor:**
    ```bash
    npm run dev
    ```
E pronto! O backend estará a rodar em `http://localhost:3333`.

### 👥 A Equipe

| Papel             | Quem é          |
| ----------------- | --------------- |
| Product Owner (PO) | Maria Luiza Sperancin Mancebo |
| Scrum Master      | Juliana da Costa Silva |
| UX Designer       | Julia Dias Luz |
| Dev Backend ☕    | Ryan Pavini |

---