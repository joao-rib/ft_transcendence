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

### Setup - Starting the App

Simply open up a browser of your choice and type the following into the address bar:

```text
http://localhost:8080
```

And that's all we need to get started!

## Project Structure

### Features // TODO esclarecer OAuth

* **Chess** - Playable chess board in real time, between 2 users
* **Chat** - Messaging system between the 2 active players
* **Leaderboard** - Scores of registered users, as per the chess scoring system
* **Secure Authentication** - Passwords are adequately hashed, and never visible.
* **OAuth** - Authentication can also be made via Google account

### Modules // TODO

| Module                | Type  | Points | Description             | Contributors |
| --------------------- | ----- | ------ | ----------------------- | ------------ |
| Web Application       | Major | 2      | Full-stack app          | All          |
| Real-time Interaction | Major | 2      | WebSocket gameplay/chat | jcavadas       |
| Authentication        | Major | 2      | Secure login system     | shrodrig       |
| Database Integration  | Major | 2      | Prisma + PostgreSQL     | shrodrig       |
| Dockerization         | Minor | 1      | Container setup         | jcavadas       |

### The Database // TODO vale a pena meter info sobre todas as tables?

Once the Prisma database is set up, we can access it with the Prisma application itself, via the following command:

```bash
npx prisma studio
```
Alternatively, it can also be accessed directly with the terminal, though this is a more cumbersome option:

```bash
docker exec -it transcendence-db-1 psql -U changemeuser -d changemedb
```

We can then see the tables that were built for the project:

**Account** - The primary table, meant for keeping primary info regarding each individual user account

* id (UUID)
* username (unique)
* email (unique)
* passwordHash
* emailVerified
* createdAt
* updatedAt
* avatarUrl
* scores (relation - Score)
* oauthAccounts (relation - OAuthAccount)
* refreshTokens (relation - RefreshToken)

**Score** // TODO?

* id
* userId (FK)
* wins / losses / rating

**OAuth** // TODO?

* id
* userId (FK)
* wins / losses / rating

**RefreshToken** // TODO?

* id
* userId (FK)
* wins / losses / rating

## Project Development

### The Team

* joseoliv, the **Product Owner** - Coded the game and managed the end product, from what was feasible to the realistic deadlines.
* shrodrig, the **Tech Lead** - Defined the docker structure, defined the limits of the tools used in this project.
* jcavadas, the **Frontend Lead** -  Designed the frontend, and ensured its implementation with other moving parts.
* joao-rib, the **Product Manager** - Built the database, coordinated meeting timelines and team productivity.

### Individual Contributions

#### joseoliv

* Implemented WebSockets
* Built chat system
* Coded game logic and interface

#### shrodrig

* Configured Docker structure and deployment
* Designed backend architecture
* Implemented authentication flows

#### jcavadas

* Built frontend components
* Designed UI and user experience
* Implemented leaderboard logic

#### joao-rib

* Managed project timeline and coordination
* Defined Git-related workflow
* Integrated Prisma and database schema

### Technical Choices

Most technical choices in this project were made when evaluating how easy and/or accessible they were, and more importantly, how familiar the team meambers were with these tools.

* **Docker** - Light structure for a full-stack application project
* **Next.js** - Accessible framework for both backend and frontend
* **TailwindCSS** - Frontend-specific framework, it is fast and consistent
* **WebSockets** - Allows real-time user interactivity (game, chat) across stations
* **Prisma** - API that provides an ORM Database, quite easy to use
* **PostgreSQL** - Database framework, very secure and flexible

### Potential Improvements

* CPU opponents (single-player mode)
* OAuth verification could be more robust
* More games could eventually be implemented in this framework

## Resources

### Documentation

No particular guide or technical documentation was consulted regarding the tools used for our Transcendence. This project relied more on our own respective hands-on experience with the tools and concepts presented, ample communication among team members, advice from alumni, and extensive testing.

All chess-related assets were obtained from chess.com:
* [www.chess.com](https://www.chess.com)

### Regarding the use of AI

AI tools (such as ChatGPT) were used for:

* Delving into technical concepts (Next.js framework, Typescript language, API implementation)
* Debugging various issues (Docker optimization, API interaction, proofreading)

All generated content was read with a substantial grain of salt, heavily tested and reviewed, and adapted to better fit the context of this project.
