########## VARIABLES ##########

INFRA_DIR = infra/
ENV_FILE = .env

D_COMPOSE_DEV = $(INFRA_DIR)docker-compose.dev.yml
D_COMPOSE = $(INFRA_DIR)docker-compose.yml

########## SECRETS ##########

$(ENV_FILE):
	@echo "POSTGRES_HOST=postgres" > $@
	@echo "POSTGRES_DB=pepdb" >> $@
	@echo "POSTGRES_USER=postgresadmin" >> $@
	@echo "POSTGRES_PASSWORD=$$(openssl rand -hex 24)" >> $@
	@echo "JWT_SECRET=$$(openssl rand -hex 32)" >> $@
	@echo "JWT_REFRESH_SECRET=$$(openssl rand -hex 32)" >> $@
	@echo "INTERNAL_API_KEY=$$(openssl rand -hex 32)" >> $@
	@echo "GF_SECURITY_ADMIN_USER=admin" >> $@
	@echo "GF_SECURITY_ADMIN_PASSWORD=$$(openssl rand -hex 16)" >> $@
	@echo "GF_SERVER_ROOT_URL=https://pep.localhost:8443/grafana/" >> $@
	@echo "GF_SERVER_SERVE_FROM_SUB_PATH=true" >> $@

########## RULES ##########

all: $(ENV_FILE)
	@docker compose -f $(D_COMPOSE) up -d --build

dev: $(ENV_FILE)
	@docker compose -f $(D_COMPOSE_DEV) up -d --build

down:
	@docker compose -f $(D_COMPOSE) down
# 	@docker compose -f $(D_COMPOSE_DEV) down

logs:
	@docker compose -f $(D_COMPOSE) logs -f
# 	@docker compose -f $(D_COMPOSE_DEV) logs -f

fclean: down
	@docker system prune -a -f

hclean: down fclean
	@docker volume prune -a -f 

re: fclean all

.PHONY: all down fclean hclean re dev logs
