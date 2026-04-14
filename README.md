# DTF

Web-app voltado a conexao entre pessoas que compartilham interesse por cinema romantico, com foco em interacao social, descoberta de perfis e construcao de afinidades.

## 1. Autores

- Maycon Freitas
- Joice Xavier

## 2. Descricao do Projeto

O DTF e uma plataforma web desenvolvida para aproximar usuarios com gosto em comum por producoes cinematograficas de tematica romantica. A proposta do sistema e oferecer um ambiente digital em que o cinema funcione como ponto de partida para conversas, identificacao de afinidades e possiveis conexoes entre pessoas.

O projeto foi concebido como uma aplicacao com interface moderna e fluxo simples de navegacao, permitindo que o usuario explore perfis, interaja com conteudos e estabeleca contato com outros participantes da plataforma. Seu publico-alvo e formado por pessoas interessadas em cinema romantico e em experiencias de interacao social baseadas em preferencias culturais compartilhadas.

## 3. Objetivo

O principal objetivo do DTF e reduzir a dificuldade de conexao entre pessoas com interesses em comum, especialmente no contexto de preferencias por filmes romanticos e narrativas afetivas.

De forma mais especifica, o projeto busca:

- criar um ambiente digital voltado para amantes de cinema romantico;
- incentivar interacoes baseadas em afinidade de gosto e perfil;
- promover conversas e conexoes entre usuarios a partir de interesses compartilhados;
- apresentar uma proposta de interface intuitiva para navegacao, descoberta e comunicacao.

## 4. Funcionalidades Principais

- Cadastro de usuarios e entrada inicial na plataforma.
- Etapa de onboarding para identificacao de preferencias e perfil do usuario.
- Exploracao de perfis e descoberta de usuarios com interesses semelhantes.
- Sistema de comunicacao por chat entre usuarios conectados.
- Possibilidade de conexao e geracao de match com base em afinidades.
- Navegacao por feed, perfis e area de conversas.

## 5. Como Funciona

O fluxo principal de uso da plataforma pode ser resumido nas seguintes etapas:

1. O usuario acessa o sistema e cria sua conta ou realiza sua identificacao inicial.
2. Em seguida, passa por uma etapa de apresentacao e definicao de preferencias.
3. A plataforma sugere perfis e conteudos relacionados ao universo do cinema romantico.
4. O usuario pode explorar outros perfis, interagir com a interface e iniciar conversas.
5. Quando ha compatibilidade de interesses, a plataforma favorece a formacao de conexoes e matches.

## 6. Tecnologias Utilizadas

As tecnologias atualmente identificadas no projeto estao organizadas abaixo para facilitar manutencao e futuras atualizacoes.

| Categoria | Tecnologia | Finalidade no projeto |
| --- | --- | --- |
| Front-end | React | Construcao da interface da aplicacao |
| Linguagem | TypeScript | Tipagem estatica e maior seguranca no desenvolvimento |
| Build e desenvolvimento | Vite | Ambiente de desenvolvimento e empacotamento |
| Roteamento | React Router DOM | Navegacao entre paginas e fluxos da aplicacao |
| Estilo | Tailwind CSS | Estruturacao visual e estilizacao da interface |
| Animacoes | Framer Motion | Transicoes e interacoes visuais |
| Icones | Lucide React | Composicao visual de elementos de interface |
| Back-end local | Express | Servidor local para execucao da aplicacao |
| Estado da aplicacao | React Context API | Gerenciamento de estado global |
| Dados de prototipo | Arquivos mock locais | Simulacao de usuarios, filmes, chats e matches |

## 7. Estrutura do Projeto

A organizacao atual do repositorio segue uma divisao simples entre interface, dados simulados, estado global e servidor local:

```text
dtf/
|- src/
|  |- components/   # Componentes reutilizaveis da interface
|  |- context/      # Contexto global e regras principais da aplicacao
|  |- data/         # Dados simulados utilizados no prototipo
|  |- pages/        # Paginas e telas principais do sistema
|  |- types/        # Tipagens e contratos de dados
|  |- App.tsx       # Configuracao principal de rotas e fluxo da aplicacao
|  |- index.css     # Estilos globais
|  `- main.tsx      # Ponto de entrada do front-end
|- server.ts        # Servidor local com Express e integracao ao Vite
|- package.json     # Dependencias, scripts e metadados do projeto
|- tsconfig.json    # Configuracao do TypeScript
|- vite.config.ts   # Configuracao do Vite
`- README.md        # Documentacao principal do projeto
```

## 8. Como Executar o Projeto

### Pre-requisitos

- Node.js instalado na maquina
- npm disponivel no ambiente

### Instalacao e execucao

```bash
npm install
npm run dev
```

Apos a execucao do comando de desenvolvimento, a aplicacao podera ser acessada localmente no endereco informado pelo servidor, normalmente:

```text
http://localhost:3000
```

## 9. Consideracoes Finais

O DTF representa uma proposta de plataforma social tematica, centrada na aproximacao de pessoas por meio de preferencias em comum no cinema romantico. Alem de apresentar um fluxo funcional de navegacao e interacao, o projeto tambem serve como base para evolucao futura, incluindo autenticacao real, persistencia de dados, recomendacao personalizada e expansao das funcionalidades sociais.
