*This project has been created as part of the 42 curriculum by joao-rib, shrodrig, joseoliv, jcavadas.*

---

# ft_transcendence

## Description

Transcendence is a full-stack web application, the nature of which is entirely up to student choice.

For our group, we have chosen to implement a chess game, playable on a frontend platform, meant to be played by two people. The goal is for the app to be functional, secure, intuitive, and (most importantly) fun. 

Additional features include chat functionality and a leaderboard.

## Instructions

### Prerequisites

In order for this project to run, the following functionalities must be implemented in the PC or VM in question:

* make (Makefile)
* yq (yaml files)
* Docker
* Docker Compose (`docker compose`)
* Node.js
* pnpm
* An adequately configured VM (.env)

For the purposes of evaluation, the project must run in a predefined station, but it should run just as well in any machine with these prerequisites in place.

### Setup - Basic make commands

First of all, Docker must be installed and the current user must belong to the `docker` group. Someone with sudo privileges should ensure these for the user.

A Docker network typically requires "make up" to get started. In case the containers, images, etc. need to be rebuilt from the ground up, the adequate command is "make build", then "make up" (only when making significant changes to the Docker structure, as "build" takes a very long time to finish).

Note: A stable internet access is required for these to work

```bash
make up
make build
```

In order to stop the project, "make down" is used. This will stop the Dockers and respective volumes and containers.

```bash
make down
```

The commands listed below deal with thorough cleanup duty. "clean" removes built images only, while "fclean" also removes persistent data still present on the machine.

```bash
make clean
make fclean
```

For additional commands or a simple refresher, feel free to type "make help", for a quick overview.

```bash
make help
```

---

### Setup - .env // TODO esclarecer o método

Create a `.env` file at the root:

```env
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=yourdb

DATABASE_URL=postgresql://user:pass@localhost:5432/db
DATABASE_URL_DOCKER=postgresql://user:pass@db:5432/db

JWT_SECRET=your_secret
```

---

### Setup - Starting the App

Simply open up a browser of your choice and type the following into the address bar:

```text
http://localhost:8080
```

And that's all we need to get started!

---

## Project Development // TODO parte mais trabalhosa

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Open database UI:

```bash
npx prisma studio
```

---

## 👥 Team Information

| Name   | Role            | Responsibilities                                           |
| ------ | --------------- | ---------------------------------------------------------- |
| joseoliv | Product Owner | Coordinated tasks, timelines, ensured delivery milestones  |
| shrodrig | Tech Lead       | Architecture design, backend structure, Prisma integration |
| joao-rib | Project Manager   | UI/UX, React components, real-time updates                 |
| jcavadas | Frontend Lead       | WebSockets, chat system, Docker integration                |

---

## 📊 Project Management

### Organization

* Agile-inspired workflow
* Weekly planning and daily sync discussions

### Tools

* GitHub Issues for task tracking
* GitHub Projects for kanban board

### Communication

* Discord for daily communication
* GitHub PR reviews for collaboration

---

## 🧰 Technical Stack

### Frontend

* Next.js (App Router)
* React
* TailwindCSS

### Backend

* Node.js
* Next.js API Routes
* WebSockets (Socket.IO)

### Database

* PostgreSQL

### ORM

* Prisma

### DevOps

* Docker / Docker Compose
* Nginx (reverse proxy)

---

### 🧠 Technical Choices Justification

* **Next.js** → unified frontend/backend
* **Prisma** → type-safe DB access
* **PostgreSQL** → robust relational DB
* **Docker** → reproducible environment
* **WebSockets** → real-time gameplay/chat

---

## 🗄 Database Schema

### Main Tables

#### Account

* id (UUID)
* username (unique)
* email (unique)
* createdAt / updatedAt

#### Score

* id
* userId (FK)
* wins / losses / rating

#### Relationships

* Account → Scores (1:N)
* Account → OAuthAccounts (1:N)
* Account → RefreshTokens (1:N)

---

## 🚀 Features List

| Feature        | Description                         | Contributors   |
| -------------- | ----------------------------------- | -------------- |
| Chess Game     | Real-time 2-player chess            | joseoliv, jcavadas |
| Chat System    | Live messaging between players      | jcavadas         |
| Authentication | User login and session handling     | shrodrig         |
| Leaderboard    | Ranking system based on performance | joao-rib           |
| Docker Setup   | Full containerized environment      | jcavadas         |
| UI/UX          | Responsive design                   | joseoliv         |

---

## 🧩 Modules

| Module                | Type  | Points | Description             | Contributors |
| --------------------- | ----- | ------ | ----------------------- | ------------ |
| Web Application       | Major | 2      | Full-stack app          | All          |
| Real-time Interaction | Major | 2      | WebSocket gameplay/chat | jcavadas       |
| Authentication        | Major | 2      | Secure login system     | shrodrig       |
| Database Integration  | Major | 2      | Prisma + PostgreSQL     | shrodrig       |
| Dockerization         | Minor | 1      | Container setup         | jcavadas       |

---

## 👤 Individual Contributions

### joao-rib

* Managed project timeline and coordination
* Implemented leaderboard logic

### shrodrig

* Designed backend architecture
* Integrated Prisma and database schema
* Implemented authentication flows

### joseoliv

* Built frontend components
* Designed UI and user experience
* Integrated real-time updates in UI

### jcavadas

* Implemented WebSocket communication
* Built chat system
* Configured Docker and deployment

---

### Potential Improvements // TODO deixamos esta secção?

* CPU opponents (single-player mode)
* OAuth verification could be more robust
* More games could eventually be implemented in this framework

---

## Resources

### Documentation // TODO talvez alguma documentação sobre game logic?

No particular guide or technical documentation was consulted regarding the tools used for our Transcendence. This project relied more on our own respective hands-on experience with the tools and concepts presented, ample communication among team members, and extensive testing.

We did look up the rules for chess, though:
* [Inception - Basic Concepts](https://medium.com/@imyzf/inception-3979046d90a0)

### Regarding the use of AI

AI tools (such as ChatGPT) were used for:

* Delving into technical concepts (Next.js framework, Typescript language, API implementation)
* Debugging various issues (Docker optimization, API interaction, proofreading)

All generated content was read with a substantial grain of salt, heavily tested and reviewed, and adapted to better fit the context of this project.
