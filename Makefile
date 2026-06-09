########## VARIABLES ##########

INFRA_DIR = infra/

D_COMPOSE_DEV = $(INFRA_DIR)docker-compose.dev.yml
D_COMPOSE = $(INFRA_DIR)docker-compose.yml

########## SECRETS ##########


########## RULES ##########

all:
	@docker compose -f $(D_COMPOSE) up -d --build

dev:
	@docker compose -f $(D_COMPOSE_DEV) up -d --build

down:
	@docker compose -f $(D_COMPOSE) down
# 	@docker compose -f $(D_COMPOSE_DEV) down

logs:
	@docker compose -f $(D_COMPOSE) logs -f
# 	@docker compose -f $(D_COMPOSE_DEV) logs -f

fclean: down
	@docker system prune -a -f --volumes

re: fclean all

.PHONY: all down fclean re dev logs