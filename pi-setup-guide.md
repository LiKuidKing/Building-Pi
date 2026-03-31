# D.O.U.G. Dashboard - Raspberry Pi Setup Guide

This document captures all the steps we took to get the "Device Orchestration for the Utility's Grid" (D.O.U.G.) dashboard running locally and deployed to your Raspberry Pi via Docker, along with instructions to run it in a locked-down Kiosk mode.

## 1. Development Environment (Windows PC)
The dashboard was built using **Vite + React** for modern styling and fast local development.
- The project is located in `C:\Users\dkadrmas\Documents\Building Pi` on the Windows PC.
- We utilize `npm run dev -- --host` to test the dashboard across the local network before pushing.
- We configured the local Git identity (`git config user.name "LiKuidKing"`).

### Docker Configuration Created
To prepare for the Raspberry Pi deployment, three files were added to the root of the project:
1. **`Dockerfile`**: Compiles the Vite build using `node:20-alpine` and serves the static files using an ultra-lightweight `nginx:alpine` image.
2. **`docker-compose.yml`**: Defines the `doug_dashboard` container, binds port `80:80`, and ensures it has `restart: always` so it boots on power cycle.
3. **`.dockerignore`**: Ignores `node_modules` and `.git` from the Docker image to keep the footprint small.

## 2. Pushing to GitHub
1. Initialized the Git repo locally.
2. Committed the codebase and Docker files.
3. Pushed to the remote GitHub repository (`https://github.com/LiKuidKing/Building-Pi.git`).

---

## 3. Raspberry Pi Environment (`ets`)

### Prerequisites & Cleanup
1. Ensure the Raspberry Pi is up to date and has Docker installed:
   ```bash
   sudo apt update
   sudo apt install git docker.io -y
   sudo usermod -aG docker ets
   ```

### Initial Deployment
1. Clone the repository into the home directory:
   ```bash
   cd /home/ets
   git clone https://github.com/LiKuidKing/Building-Pi.git
   ```
2. Navigate into the repo and start the container using the space-separated `docker compose` command:
   ```bash
   cd /home/ets/Building-Pi
   chmod +x pi-update.sh
   docker compose up --build -d
   ```

---

## 4. Automatic Kiosk Setup (Boot Sequence)

To make the Raspberry Pi act as a dedicated display monitor, we configure it to update the code automatically, start the container, and launch Chromium in full-screen mode on every reboot.

### Step A: The Startup Script
Create a bash script at `/home/ets/start-kiosk.sh`:
```bash
#!/bin/bash

# Navigate to the repo
cd /home/ets/Building-Pi

# Pull the latest code and rebuild the container
./pi-update.sh

# Give Docker a few seconds to spin up NGINX
sleep 5

# Launch Chromium in Kiosk Mode targeting the local Docker container
chromium-browser --kiosk --noerrdialogs --disable-infobars --incognito http://localhost
```
Make it executable: `chmod +x /home/ets/start-kiosk.sh`

### Step B: The Autostart Desktop Entry
To tell the Pi's desktop environment to run that script on boot, create the shortcut file at `~/.config/autostart/doug-kiosk.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=DOUG Kiosk
Exec=/bin/bash /home/ets/start-kiosk.sh
X-GNOME-Autostart-enabled=true
```

## 5. Maintenance
Anytime the source code changes on the Windows development PC:
1. `git commit -am "Update"` and `git push`
2. Reboot the Raspberry Pi. The autostart script will pull the new code, rebuild the container, and display the update automatically.
