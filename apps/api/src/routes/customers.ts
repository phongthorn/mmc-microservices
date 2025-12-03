import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// List customers
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const customers = await db.all('SELECT * FROM customers ORDER BY id DESC');
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const customer = await db.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create customer
router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { name, name_en, tax_id, address, address_en, branch, email, tel } = req.body;

        const result = await db.run(`
      INSERT INTO customers (
        name, name_en, tax_id, address, address_en, branch, email, tel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, name_en, tax_id, address, address_en, branch, email, tel]);

        const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const { name, name_en, tax_id, address, address_en, branch, email, tel } = req.body;

        await db.run(`
      UPDATE customers SET
        name = ?, name_en = ?, tax_id = ?, address = ?, address_en = ?,
        branch = ?, email = ?, tel = ?
      WHERE id = ?
    `, [name, name_en, tax_id, address, address_en, branch, email, tel, req.params.id]);

        const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        res.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
