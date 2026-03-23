<h1 align="center">
  Obsidian Mail 🌌
</h1>

<p align="center">
  <strong>A modern, web-based management dashboard for a self-hosted Docker mail server stack.</strong>
</p>

<p align="center">
  <img alt="Angular" src="https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white">
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img alt="NestJS 11" src="https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
</p>

<p align="center">
  Built with the dark "Sentinel Slate" design system, providing a fast, secure, and beautiful interface for administrators.
</p>

---

## ✨ Features

- **Overview Dashboard**: Main health & telemetry metrics.
- **Mail Engine**: Mailbox and Domain management.
- **DNS Logs**: Real-time DNS query log viewer.
- **Fortress Security**: Firewall rules, Fail2Ban, and blocklists panel.
- **Global Settings**: Core mail server configuration.
- **SSL/TLS Certificates**: Auto-renew ACME/Let's Encrypt manager.
- **System Logs Viewer**: Streaming Postfix & Dovecot logs.
- **Command Palette**: Global action overlay for quick navigation.

## 📸 Screenshots

### Overview Dashboard
![Overview Dashboard](Mockup/overview_dashboard/screen.png)

### Mailboxes & Domains
![Mailboxes & Domains](Mockup/mailboxes_domains/screen.png)

### Global Settings
![Global Settings](Mockup/global_settings/screen.png)

### Security Panel
![Fortress Security](Mockup/fortress_security/screen.png)

### DNS Logs
![DNS Logs](Mockup/dns_logs/screen.png)

## 🚀 Quick Start (Local Development)

### 1. Environment Setup

Copy `.env.example` in the `obsidian-mail` directory to `.env` and configure your Zitadel OIDC client credentials:

```bash
cd obsidian-mail
cp .env.example .env
```

Open `.env` and set `FRONTEND_URL=http://localhost:4200` and the required Zitadel configuration.

Also, be sure to update `frontend/src/environments/environment.ts` with your Zitadel `clientId`.

### 2. Running with Docker Compose

To start the full stack (Frontend + Backend linked via Docker API):

```bash
docker compose up --build -d
```

- **Frontend** will be available at `http://localhost/` via Nginx.
- **Backend API** will be securely routed behind Nginx under `http://localhost/api/`.

### 3. Local Development (Without Docker for Frontend)
If you want to run the Angular Frontend locally with Hot Module Replacement:
```bash
# Start backend via docker or locally:
cd obsidian-mail/backend
npm install
npm run start:dev

# Start frontend:
cd ../frontend
npm install
npm start
```
The app will be served at `http://localhost:4200`.

## 🛠 Tech Stack

- **Frontend**: Angular 21, Tailwind CSS v4, RxJS, Zitadel OIDC Client.
- **Backend**: NestJS 11, TypeScript, Dockerode (to manage mail server containers), Passport JWT.
- **Infrastructure**: Docker Compose, Nginx.
- **Design System**: "Sentinel Slate" (Dark Mode Glassmorphism with custom Tailwind 4 themes).
