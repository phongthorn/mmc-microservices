import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// Get default issuer
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const issuer = await db.get('SELECT * FROM issuers WHERE is_default = 1');
        if (!issuer) {
            return res.status(404).json({ error: 'Default issuer not found' });
        }
        res.json(issuer);
    } catch (error) {
        console.error('Error fetching issuer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update default issuer
router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { company_name, company_name_en, address, address_en, tax_id, tel, fax, logo_path } = req.body;

        // Check if default issuer exists
        const existing = await db.get('SELECT id FROM issuers WHERE is_default = 1');

        if (existing) {
            await db.run(`
        UPDATE issuers SET
          company_name = ?, company_name_en = ?, address = ?, address_en = ?,
          tax_id = ?, tel = ?, fax = ?, logo_path = ?
        WHERE id = ?
      `, [company_name, company_name_en, address, address_en, tax_id, tel, fax, logo_path, existing.id]);
        } else {
            await db.run(`
        INSERT INTO issuers (
          company_name, company_name_en, address, address_en,
          tax_id, tel, fax, logo_path, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [company_name, company_name_en, address, address_en, tax_id, tel, fax, logo_path]);
        }

        const updated = await db.get('SELECT * FROM issuers WHERE is_default = 1');
        res.json(updated);
    } catch (error) {
        console.error('Error updating issuer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
