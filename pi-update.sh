#!/bin/bash
echo "[D.O.U.G] Pulling latest code..."
git pull origin main

echo "[D.O.U.G] Rebuilding and restarting Docker container..."
if docker compose version > /dev/null 2>&1; then
    docker compose up --build -d
else
    # Fallback to older docker-compose with a dash
    docker-compose up --build -d
fi

echo "[D.O.U.G] Dashboard updated successfully!"
