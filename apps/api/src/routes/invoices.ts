import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// List invoices
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const invoices = await db.all(`
      SELECT i.*, c.name as customer_name 
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      ORDER BY i.id DESC
    `);
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const invoice = await db.get(`
      SELECT i.*, 
             c.name as customer_name, c.address as customer_address, c.tax_id as customer_tax_id,
             iss.company_name as issuer_name, iss.address as issuer_address, iss.tax_id as issuer_tax_id
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN issuers iss ON i.issuer_id = iss.id
      WHERE i.id = ?
    `, [req.params.id]);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create invoice
router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { customer_id, invoice_date, description, amount_vatable, payment_method, payment_detail } = req.body;

        // Get default issuer
        const issuer = await db.get('SELECT id FROM issuers WHERE is_default = 1');
        if (!issuer) {
            return res.status(400).json({ error: 'No default issuer found' });
        }

        // Generate Invoice No (YYYYMM-XXXX)
        const dateObj = new Date(invoice_date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}${month}`;

        const lastInvoice = await db.get(
            'SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY invoice_no DESC LIMIT 1',
            [`${prefix}-%`]
        );

        let runningNo = 1;
        if (lastInvoice) {
            const parts = lastInvoice.invoice_no.split('-');
            if (parts.length === 2) {
                runningNo = parseInt(parts[1], 10) + 1;
            }
        }
        const invoice_no = `${prefix}-${String(runningNo).padStart(4, '0')}`;

        // Calculate VAT
        const amountVatableFloat = parseFloat(amount_vatable);
        const amount_vat = amountVatableFloat * 0.07;
        const amount_total = amountVatableFloat + amount_vat;

        // TODO: Implement amount_text (BahtText) if needed, or do it on frontend

        const result = await db.run(`
      INSERT INTO invoices (
        invoice_no, invoice_date, issuer_id, customer_id, description,
        amount_vatable, amount_vat, amount_total, payment_method, payment_detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            invoice_no, invoice_date, issuer.id, customer_id, description,
            amountVatableFloat, amount_vat, amount_total, payment_method, payment_detail
        ]);

        const newInvoice = await db.get('SELECT * FROM invoices WHERE id = ?', [result.lastID]);
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
