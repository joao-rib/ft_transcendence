#SHELL := /bin/bash

COMPOSE := docker compose
ENV_FILE := .env
COMPOSE_FILE := docker-compose.yml
DC := $(COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE)

help:
	@echo "Targets disponíveis:"
	@echo "  make up             - build + sobe todos os serviços"
	@echo "  make build          - build das imagens"
	@echo "  make down           - para e remove containers/network"
	@echo "  make logs           - mostra logs em tempo real"
	@echo "  make ps             - lista status dos serviços"
	@echo "  make clean          - down com remoção de órfãos"
	@echo "  make fclean         - clean + remove volumes e imagens locais"
	@echo "  make re             - recria tudo do zero"

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