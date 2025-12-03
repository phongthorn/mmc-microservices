# Code Review & Guidelines for Improvement

## 1. Project Overview
The project is a **Full Tax Invoice System** built with **PHP (Native)**, **MariaDB**, and **Tailwind CSS**. It is containerized using Docker. The system currently supports managing customers and issuers, and creating/printing tax invoices.

## 2. Architecture & Code Quality

### Strengths
- **Simplicity**: The codebase is small and easy to understand.
- **Modern Styling**: Uses Tailwind CSS via CDN, which is good for rapid prototyping.
- **Database Access**: Uses `PDO` for database interactions, which is the standard for security and portability.
- **Output Escaping**: Consistently uses a helper function `h()` to prevent XSS attacks.

### Weaknesses
- **Procedural Style**: The code is written in a procedural style, mixing business logic, database queries, and HTML presentation in the same files (e.g., `invoice_create.php`, `invoice_print.php`). This makes it harder to test and maintain as the project grows.
- **Hardcoded Values**: Some configuration and logic (like language strings in `invoice_print.php`) are hardcoded within the view files.
- **Unused Schema**: The `invoice_items` table exists in the database schema but is not utilized in the application. Invoices currently support only a single "Description" field.

## 3. Security

### Current Status
- **SQL Injection**: Protected against by using PDO prepared statements.
- **XSS**: Protected against by using `htmlspecialchars` via the `h()` helper.

### Missing Protections
- **CSRF (Cross-Site Request Forgery)**: There is no CSRF token implementation. Forms (like `invoice_create.php` and `customer_form.php`) are vulnerable to CSRF attacks.
- **Input Validation**: Validation is basic (checking for empty fields). Stricter validation (e.g., format checks for Tax IDs, numeric ranges) is recommended.

## 4. Functionality Gaps

- **Multiple Line Items**: The database has an `invoice_items` table, but the UI only allows a single text block for the description. This limits the utility of the invoice for detailed billing.
- **Language Handling**: The multi-language support (Thai/English) in `invoice_print.php` is implemented via a large array of strings within the file itself. This should be moved to a separate language file or service.
- **Thai Number Conversion**: The `amountToWordsThai` function logic is custom and complex. It should be unit-tested thoroughly to ensure edge cases (like 1,000,001 or 21) are handled correctly.

## 5. Recommendations & Guidelines

### Immediate Improvements (Low Effort, High Value)
1.  **Implement CSRF Protection**: Add a simple session-based CSRF token to all forms.
2.  **Separate Configuration**: Move database credentials and other settings to a dedicated config file that loads from `.env`, ensuring `db.php` is robust even without Docker environment variables.
3.  **Fix `invoice_items`**: Update `invoice_create.php` to allow adding multiple line items (Description, Qty, Unit Price) and save them to the `invoice_items` table. Update `invoice_print.php` to display this table.

### Structural Refactoring (Medium Effort)
1.  **Separation of Concerns**:
    -   Create a `templates/` directory for HTML views.
    -   Create `services/` or `classes/` for business logic (e.g., `InvoiceService`, `CustomerService`).
    -   Keep the root PHP files as "Controllers" that handle input, call services, and render templates.
2.  **Language Files**: Move the translation arrays out of `invoice_print.php` into `lang/th.php` and `lang/en.php`.

### UI/UX Enhancements
1.  **Dynamic Rows**: Use JavaScript to allow users to add/remove invoice item rows dynamically.
2.  **Print Styling**: Ensure the print view is perfect. The current CSS has some `@media print` rules, but testing with actual page breaks for long invoices is needed.

## 6. Proposed Roadmap
1.  **Phase 1**: Fix Security (CSRF) and enable Multiple Line Items.
2.  **Phase 2**: Refactor code structure (MVC-lite) and externalize translations.
3.  **Phase 3**: Advanced features (PDF generation, Reporting).
