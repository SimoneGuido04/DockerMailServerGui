# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a UI mockup project for **DockerMailServerGui** — a web-based management dashboard for a self-hosted Docker mail server stack. The UI is called **"Obsidian Mail"** and each screen is a self-contained HTML file under `Mockup/`.

There is no build system, no backend, no package manager, and no tests. Every mockup is a standalone HTML file that runs directly in a browser.

## Mockup Screens

Each subfolder under `Mockup/` contains `code.html` (the implementation) and `screen.png` (a reference screenshot):

| Folder | Screen |
|---|---|
| `overview_dashboard` | Main health/telemetry dashboard |
| `mailboxes_domains` | Mail engine — mailboxes and domains management |
| `dns_logs` | DNS query log viewer |
| `fortress_security` | Security panel (firewall, blocklists) |
| `global_settings` | Global server configuration |
| `ssl_tls_certificates` | TLS certificate management |
| `system_logs_viewer` | Postfix/Dovecot log streaming |
| `command_palette` | Global command palette overlay |

## Design System ("Sentinel Slate" / "The Obsidian Interface")

The full specification is in `Mockup/sentinel_slate/DESIGN.md`. Key rules to follow when editing any mockup:

### Tech Stack (in every HTML file)
- **Tailwind CSS** loaded from CDN with `plugins=forms,container-queries`
- **Inter** (headlines, body, labels) + **Roboto Mono** (server data, IPs, hashes, paths) via Google Fonts
- **Material Symbols Outlined** icon font

### Tailwind Theme Tokens
The custom color tokens (defined identically in every file's `tailwind.config`) map to a Material You dark palette:

| Token | Hex | Usage |
|---|---|---|
| `surface` / `background` | `#0f1419` | Base background layer |
| `surface-container-low` | `#171c22` | Sidebar / large regions |
| `surface-container` | `#1b2026` | Standard cards |
| `surface-container-high` | `#252a30` | Elevated interactive elements |
| `surface-container-lowest` | `#0a0f14` | Inset / telemetry cells |
| `surface-variant` | `#30353b` | Glassmorphism base |
| `outline-variant` | `#414754` | Ghost borders (always at 10–20% opacity) |
| `secondary` | `#4edea3` | Safe / Active states |
| `tertiary` | `#ffb4ac` | Alert / Blocked states |
| `primary` / `surface-tint` | `#acc7ff` | CTAs, focus rings, chart strokes |
| `primary-container` | `#498fff` | Solid primary button backgrounds |

### Visual Rules (enforce these strictly)
- **No solid 1px borders** — use surface tier shifts or ghost borders (`outline-variant` at 10–20% opacity)
- **No pure black `#000000`** — always use `surface` token
- **No small offset shadows** — use large ambient glows (`0 24px 48px -12px rgba(0,0,0,0.5)`) or none
- **Glassmorphism cards**: `surface-variant` at 60% opacity + `backdrop-filter: blur(12px)`
- **Row separators in tables**: forbidden — use `spacing.4` vertical padding + hover background instead
- **Monospace font for all data**: IP addresses, log lines, hashes, file paths → `font-mono`
- **Status pills**: "Safe" = `secondary-container` bg + `secondary` dot; "Alert" = `tertiary-container` bg + `tertiary` dot
- **Spacing between major groups**: `gap-8` (2rem) or `gap-10` (2.5rem)
