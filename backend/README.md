# 🚀 Sistema de Gestão - Narcóticos Anônimos (NA)

Este é o repositório do nosso Projeto Integrador da Unicamp. Estamos construindo um sistema para ajudar um grupo de NA a organizar suas reuniões, eventos e comunicados.

---

### 🎯 O Problema que Estamos Resolvendo

A comunicação no grupo atualmente depende de cadernos físicos e WhatsApp[cite: 6, 24]. [cite_start]Isso causa problemas como perda de informações, dificuldade de organização e ruídos na comunicação.

Nosso objetivo é criar uma plataforma centralizada para acabar com essa bagunça. [cite_start]A ideia é ter um lugar único e confiável para todas as informações importantes, melhorando a comunicação e a eficiência do grupo.

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

Bora configurar o ambiente de desenvolvimento.

**Você vai precisar de:**
* Node.js (v18+)
* NPM ou Yarn
* Git
* PostgreSQL

**Passo a passo:**
1.  **Clone o repo:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GITLAB>
    cd nome-do-repositorio
    ```

2.  **Instale as dependências:**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure o `.env`:**
    * Copie o `.env.example` para um novo arquivo `.env`.
    * Preencha a `DATABASE_URL` com seus dados do Postgres.
        ```env
        DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/na_api"
        ```

4.  **Prepare o Banco de Dados:**
    * Este comando cria as tabelas para você.
        ```bash
        npx prisma migrate dev
        ```

5.  **Suba o servidor:**
    * Rode o script de desenvolvimento (ele reinicia sozinho quando você salva!).
        ```bash
        npm run dev
        ```
E pronto! O backend estará rodando em `http://localhost:3333`.

### 👥 A Equipe

| Papel             | Quem é          |
| ----------------- | --------------- |
| Product Owner (PO) | Maria Luiz Sperancin Mancebo |
| Scrum Master      | Juliana da Costa Silva |
| UX Designer       | Julia Dias Luz |
| Dev Backend ☕    | Ryan Pavini |
| Dev Frontend ⚛️   | Samuel Calegnan dos Santos Souza |

---