default:
    just --list

# Interactive setup: configure crypto pair and generate subscriptions
setup:
    @bash setup.sh

# Deploy: setup + start (one-command deployment)
deploy: setup up

# Start development environment with hot-reload
up:
    docker compose --profile development --file ./docker/compose.yml up scrapper-dev

# Stop all services
down:
    docker compose --file ./docker/compose.yml down

# Access shell in development container
shell:
    docker exec -it scrapper-noah-dev sh

# View logs from development container
logs:
    docker compose --file ./docker/compose.yml logs --follow scrapper-dev

# Rebuild development image
rebuild:
    docker compose --profile development --file ./docker/compose.yml build scrapper-dev
