#SHELL := /bin/bash

COMPOSE        := docker compose
ENV_FILE       := .env
COMPOSE_FILE   := docker-compose.yml
DC             := $(COMPOSE) -f $(COMPOSE_FILE)

help:
	@echo ""
	@echo "──── DOCKER (single workflow) ────────────────────────────────────────"
	@echo "  make up             - build + starts all services"
	@echo "  make build          - build images"
	@echo "  make down           - stops and removes containers/network"
	@echo "  make logs           - display live logs"
	@echo "  make ps             - list service status"
	@echo "  make clean          - down with orphan removal"
	@echo "  make fclean         - clean + remove volumes and local images"
	@echo "  make re             - recreate everything from scratch"
	@echo ""

all: up

build:
	$(DC) build

up:
	$(DC) up -d --build

down:
	$(DC) down

stop: down

restart: down up

logs:
	$(DC) logs -f --tail=200

ps:
	$(DC) ps

status: ps

pull:
	$(DC) pull

clean:
	$(DC) down --remove-orphans

fclean:
	$(DC) down --volumes --rmi all --remove-orphans
	docker system prune -af --volumes

re: fclean up

.PHONY: help all build up start down stop restart logs ps status pull clean fclean re
        