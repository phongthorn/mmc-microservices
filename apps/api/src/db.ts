import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function getDb() {
  if (pool) {
    return new DbWrapper(pool);
  }

  // Credentials from .env (and docker-compose.yml)
  pool = mysql.createPool({
    host: 'localhost',
    user: 'taxuser',
    password: 'secret_pass',
    database: 'tax_invoice',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
  });

  // Test connection
  const connection = await pool.getConnection();
  connection.release();

  const wrapper = new DbWrapper(pool);
  await initDb(wrapper);
  return wrapper;
}

async function initDb(db: DbWrapper) {
  // Issuers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS issuers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      company_name_en VARCHAR(255),
      address TEXT NOT NULL,
      address_en TEXT,
      tax_id VARCHAR(50) NOT NULL,
      tel VARCHAR(50),
      fax VARCHAR(50),
      logo_path VARCHAR(255),
      is_default TINYINT(1) DEFAULT 0
    )
  `);

  // Customers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_en VARCHAR(255),
      tax_id VARCHAR(50),
      address TEXT,
      address_en TEXT,
      branch VARCHAR(50),
      email VARCHAR(255),
      tel VARCHAR(50)
    )
  `);

  // Invoices table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no VARCHAR(50) UNIQUE NOT NULL,
      invoice_date DATE NOT NULL,
      issuer_id INT NOT NULL,
      customer_id INT NOT NULL,
      description TEXT,
      amount_vatable DECIMAL(15, 2) NOT NULL,
      amount_vat DECIMAL(15, 2) NOT NULL,
      amount_total DECIMAL(15, 2) NOT NULL,
      amount_text VARCHAR(255),
      payment_method VARCHAR(50),
      payment_detail TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issuer_id) REFERENCES issuers(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Seed default issuer if not exists
  const issuer = await db.get('SELECT * FROM issuers WHERE is_default = 1');
  if (!issuer) {
    await db.run(`
      INSERT INTO issuers (company_name, address, tax_id, is_default)
      VALUES (?, ?, ?, 1)
    `, ['Default Company Co., Ltd.', '123 Default Road, Bangkok', '1234567890123']);
    console.log('Seeded default issuer');
  }
}

class DbWrapper {
  constructor(private pool: mysql.Pool) { }

  async get(sql: string, params: any[] = []) {
    const [rows] = await this.pool.execute(sql, params);
    return (rows as any[])[0];
  }

  async all(sql: string, params: any[] = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows as any[];
  }

  async run(sql: string, params: any[] = []) {
    const [result] = await this.pool.execute(sql, params);
    return { lastID: (result as any).insertId, changes: (result as any).affectedRows };
  }

  async exec(sql: string) {
    await this.pool.query(sql);
  }
}
