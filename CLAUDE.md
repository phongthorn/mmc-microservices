# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full Tax Invoice System - a Thai tax-compliant invoicing application built with native PHP, MariaDB, and Tailwind CSS. The system manages customers, issuers (companies), and tax invoices with automatic invoice numbering (YYYYMM-XXXX format) and VAT calculations.

## Development Environment

### Starting the Application

```bash
# Start all services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f app
```

**Endpoints:**
- Application: http://localhost:8080
- phpMyAdmin: http://localhost:8082 (credentials from .env)

### Database Access

```bash
# Access MariaDB shell
docker compose exec db mysql -u taxuser -p tax_invoice

# Import/modify schema
docker compose exec db mysql -u taxuser -p tax_invoice < schema.sql
```

Database credentials are in `.env` file (see `.env.example` for template).

## Architecture

### Database Schema

Four main tables with relationships:
- `issuers` → Company information (issuer of invoices). Must have one row with `is_default = 1`.
- `customers` → Customer records with Thai/English dual language support.
- `invoices` → Invoice headers with foreign keys to `issuer_id` and `customer_id`.
- `invoice_items` → **Currently unused**. Designed for line-item details but not implemented in UI.

Key constraint: The system requires at least one issuer with `is_default = 1` in the database.

### Core Files

**Backend:**
- [src/db.php](src/db.php) - PDO connection singleton (`getDb()`) and XSS helper (`h()`). Reads DB credentials from environment variables with Docker defaults.
- [src/functions.php](src/functions.php) - Business logic:
  - `generateInvoiceNo()` - Creates sequential invoice numbers (format: YYYYMM + 4-digit running number)
  - `calcVat()` - Calculates 7% VAT and total amount
  - `amountToWords()` / `amountToWordsThai()` - Converts numbers to English/Thai text
- [src/layout.php](src/layout.php) - Shared page layout/header
- [src/sidebar.php](src/sidebar.php) - Navigation sidebar component

**Application Pages:**
- [src/index.php](src/index.php) - Landing page (redirects to invoice list)
- [src/customer_form.php](src/customer_form.php) / [src/customer_list.php](src/customer_list.php) - Customer CRUD
- [src/invoice_create.php](src/invoice_create.php) - Invoice creation form. Hardcodes `issuer_id = 1`.
- [src/invoice_list.php](src/invoice_list.php) - Invoice listing with search/filters
- [src/invoice_edit.php](src/invoice_edit.php) - Invoice modification
- [src/invoice_print.php](src/invoice_print.php) - Print/PDF view with Thai/English language toggle (`?lang=en`)
- [src/users.php](src/users.php) - User management (if authentication is implemented)
- [src/settings.php](src/settings.php) - Application settings

### Code Style

**Current Implementation:**
- Procedural PHP with strict typing (`declare(strict_types=1)`)
- PDO prepared statements for all database queries (SQL injection protection)
- XSS protection via `h()` helper wrapping `htmlspecialchars()`
- Inline HTML mixed with PHP logic (no template separation)
- Tailwind CSS via CDN for styling

**Important Patterns:**
- Always use `getDb()` for database connections (singleton pattern)
- Always escape output with `h()` when displaying user data
- Invoice numbers are auto-generated; never manually set `invoice_no`
- Language switching is done via `?lang=en` query parameter (defaults to Thai)

## Known Issues & Limitations

### Security Gaps
1. **No CSRF protection** - Forms are vulnerable to cross-site request forgery attacks
2. **No authentication/authorization** - All pages are publicly accessible
3. **Basic input validation** - Only checks for required fields, not format/type validation

### Functional Gaps
1. **invoice_items table is unused** - The schema supports line items, but the UI only accepts a single `description` text field
2. **Hardcoded issuer_id = 1** - [src/invoice_create.php:43](src/invoice_create.php#L43) always uses issuer ID 1 instead of the default issuer
3. **Translation strings in code** - Language arrays are hardcoded in [src/invoice_print.php:35-57](src/invoice_print.php#L35-L57) instead of separate language files
4. **No PDF generation** - Invoice printing relies on browser print dialog

### Data Assumptions
- VAT rate is fixed at 7% in `calcVat()` function
- Invoice number format is YYYYMM-XXXX (year+month + 4-digit sequence)
- Currency is Thai Baht (THB) only

## Common Tasks

### Adding a New Invoice
1. Ensure at least one customer exists in `customers` table
2. Navigate to [src/invoice_create.php](src/invoice_create.php)
3. System auto-generates invoice number and calculates VAT
4. Redirects to [src/invoice_print.php](src/invoice_print.php) after creation

### Modifying Database Schema
1. Edit [docker/db/init.sql](docker/db/init.sql) for clean setup
2. For existing databases, write migration SQL
3. Run: `docker compose down -v && docker compose up -d` (destroys data) OR manually execute migration

### Enabling Line Items (invoice_items)
To implement the unused `invoice_items` functionality:
1. Modify [src/invoice_create.php](src/invoice_create.php) to accept multiple item rows (description, qty, unit_price)
2. Insert each item into `invoice_items` table after creating invoice
3. Update [src/invoice_print.php](src/invoice_print.php) to query and display items table
4. Recalculate `amount_vatable` as sum of all item amounts

### Language Support
The system supports Thai (default) and English via:
- Database: Dual columns (`company_name` / `company_name_en`, `address` / `address_en`)
- Display: URL parameter `?lang=en` in [src/invoice_print.php](src/invoice_print.php)
- Fallback: English fields fall back to Thai if empty

## Reference Documentation

See [workflow.md](workflow.md) for detailed Thai-language workflow documentation and [code_review.md](code_review.md) for architectural analysis and improvement recommendations.
