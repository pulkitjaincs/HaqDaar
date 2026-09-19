.PHONY: build deploy local

build:
	sam build --use-container

deploy:
	sam deploy --guided

local:
	sam local start-api

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev
