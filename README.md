# Full Tax Invoice System (Dockerized)

## Quick start
- Copy env: `cp .env.example .env` (already present).
- Bring up stack: `docker compose up -d`.
- App runs at `http://localhost:8080`, phpMyAdmin at `http://localhost:8081`.
- First start seeds tables via `docker/db/init.sql` with a default issuer; edit that file if you need different seed data before first run.

## Services
- `app`: PHP 8.2 + Apache, docroot mounted from `./src`.
- `db`: MariaDB 10.11 with persisted volume `db_data`.
- `phpmyadmin`: optional UI for DB.

## App notes
- Main entry redirects to `invoice_list.php`.
- Create customers (`customer_form.php`/`customer_list.php`) then invoices (`invoice_create.php` → `invoice_print.php`).
- VAT calc and invoice numbering (YYYYMM + 3 digits) live in `src/functions.php`; DB connection in `src/db.php` (defaults match docker compose env).
