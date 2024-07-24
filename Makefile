COMPOSE_PATH = ./compose.yaml
COMPOSE = docker compose -f $(COMPOSE_PATH)

all: up

up:
	@$(COMPOSE) up --detach --build

start:
	@$(COMPOSE) start

stop:
	@$(COMPOSE) stop

down:
	@$(COMPOSE) down

clean:
	@make down
	@docker system prune -f
	@docker volume rm $$(docker volume ls -q)
	@docker rmi $$(docker images -q)

dev-config:
	python3 -m venv ./venv
	./venv/bin/pip3 install --upgrade pip
	./venv/bin/pip3 install -r ./requirements.dev --no-cache-dir
	./venv/bin/pre-commit install

dev-run:
	make dev-config
	./venv/bin/python3 ./apps/app-server/srcs/manage.py makemigrations --settings=config.settings.development
	./venv/bin/python3 ./apps/app-server/srcs/manage.py migrate --settings=config.settings.development
	./venv/bin/python3 ./apps/app-server/srcs/manage.py runserver --settings=config.settings.development
