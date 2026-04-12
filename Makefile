.PHONY: dev dev-frontend dev-backend install setup

# Lance les deux services avec Docker
dev:
	docker compose up

dev-build:
	docker compose up --build

down:
	docker compose down

# Développement local sans Docker
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

# Installation des dépendances
install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt

# Setup initial à partir des fichiers .example
setup:
	@if [ ! -f frontend/.env.local ]; then cp frontend/.env.local.example frontend/.env.local && echo "✓ frontend/.env.local créé"; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env && echo "✓ backend/.env créé"; fi
	@echo "→ Remplis les variables d'environnement avant de lancer le projet"
