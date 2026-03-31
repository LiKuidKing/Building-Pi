#!/bin/bash
echo "[D.O.U.G] Pulling latest code..."
git pull origin main

echo "[D.O.U.G] Rebuilding and restarting Docker container..."
docker compose up --build -d

echo "[D.O.U.G] Dashboard updated successfully!"
