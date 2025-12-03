# Workflow การออกใบกำกับภาษี (Full Tax Invoice System)

เทคโนโลยีที่ใช้: PHP, Tailwind CSS, MariaDB

## 1. โครงสร้างฐานข้อมูลโดยสรุป

- ตาราง `issuers` : ข้อมูลบริษัทผู้ออกใบกำกับ (company_name, address, tax_id, tel, fax, logo_path, is_default)
- ตาราง `customers` : ข้อมูลลูกค้า (name, tax_id, address)
- ตาราง `invoices` : หัวใบกำกับภาษี
  - invoice_no, invoice_date, issuer_id, customer_id
  - description (In Payment of)
  - amount_vatable, amount_vat, amount_total, amount_text
  - payment_method (cash / credit_card / other), payment_detail
- ตาราง `invoice_items` (เผื่ออนาคต) : รายการสินค้า/บริการในแต่ละใบกำกับ

## 2. ขั้นตอนเตรียมระบบ (ครั้งแรก)

1. ติดตั้ง Web Server + PHP + MariaDB
2. สร้าง Database เช่น `tax_invoice`
3. สร้างตาราง `issuers`, `customers`, `invoices`, `invoice_items` ตามโครงด้านบน
4. เพิ่มข้อมูลบริษัทใน `issuers` อย่างน้อย 1 รายการ (กำหนด `is_default = 1`)
5. สร้างไฟล์หลักของโปรเจกต์:
   - `db.php` : เชื่อมต่อฐานข้อมูล
   - `functions.php` : ฟังก์ชัน `generateInvoiceNo`, `calcVat`, `amountToWords`
   - `customer_form.php` / `customer_list.php`
   - `invoice_create.php`
   - `invoice_print.php`
   - (option) `invoice_list.php`, `invoice_report.php`

## 3. Workflow ฝั่งผู้ใช้งาน

### 3.1 การจัดการลูกค้า

1. เปิดหน้า `customer_form.php`
2. กรอกข้อมูล: ชื่อ, Tax ID, ที่อยู่
3. กดบันทึก → INSERT ลงตาราง `customers`
4. ใช้หน้า `customer_list.php` สำหรับค้นหา/เลือกแก้ไข

### 3.2 การออกใบกำกับภาษี

1. เปิดหน้า `invoice_create.php`
2. ระบบดึงรายชื่อลูกค้าจาก `customers` ใส่ใน `<select>`
3. ผู้ใช้ระบุ:
   - วันที่ (`invoice_date`)
   - ลูกค้า (`customer_id`)
   - รายละเอียด In Payment of (`description`)
   - ยอดก่อน VAT (`amount_vatable`)
   - วิธีชำระเงิน (`payment_method`) และรายละเอียด (`payment_detail`)
4. เมื่อกดบันทึก (POST):
   - คำนวณ VAT 7% และยอดรวม (`amount_vat`, `amount_total`)
   - สร้างเลขที่ใบกำกับ (`invoice_no`) รูปแบบ `YYYYMM + running 3 หลัก`
   - แปลงยอดรวมเป็นข้อความ (`amount_text`)
   - INSERT ลงตาราง `invoices`
   - Redirect ไปหน้า `invoice_print.php?id=...`

### 3.3 การแสดง/พิมพ์ใบกำกับภาษี

1. `invoice_print.php` รับ `id` ทาง GET
2. JOIN ข้อมูลจาก `invoices`, `customers`, `issuers`
3. Render เป็นฟอร์มใบกำกับภาษีด้วย Tailwind CSS ให้ใกล้เคียงกับฟอร์มตัวอย่าง
4. ปรับ CSS สำหรับการพิมพ์ และเรียก `window.print()` หากต้องพิมพ์กระดาษ
5. (ระยะถัดไป) สามารถต่อกับ library PDF เช่น mPDF/DOMPDF

### 3.4 การค้นหาและรายงาน (ระยะถัดไป)

- หน้า `invoice_list.php`:
  - ฟิลเตอร์: วันที่, เลขที่ใบกำกับ, ลูกค้า
  - แสดงรายการ และลิงก์เข้า `invoice_print.php`
- หน้า `invoice_report.php`:
  - สรุปยอด VAT รายเดือน/ปี
  - Export CSV/Excel สำหรับฝ่ายบัญชี

## 4. โครงสร้างไฟล์แนะนำ

- `db.php`
- `functions.php`
- `customer_form.php`
- `customer_list.php` (optional)
- `invoice_create.php`
- `invoice_print.php`
- `invoice_list.php` (optional)
- โฟลเดอร์ `assets/` สำหรับ logo และไฟล์ static อื่น ๆ

ไฟล์นี้ใช้เป็นภาพรวม Workflow สำหรับทีม Dev/IT และทีมบัญชีเพื่อเข้าใจขั้นตอนและขอบเขตระบบ