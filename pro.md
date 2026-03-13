# Todolist - ระบบจดหมายเวียนแจ้งค่าเทอมค้างชำระ

## Phase 1: โครงสร้างพื้นฐาน
- [x] 1.1 สร้างโปรเจค Next.js + ติดตั้ง dependencies
- [x] 1.2 สร้าง Prisma Schema (User, Student, Semester, Payment, ImportBatch, Setting)
- [x] 1.3 Run migration + Seed data (admin, semesters, settings)
- [x] 1.4 Copy ฟอนต์ THSarabunNew.ttf ไป public/fonts/

## Phase 2: ระบบ Authentication
- [x] 2.1 ตั้งค่า NextAuth.js (Credentials + JWT)
- [x] 2.2 สร้าง Middleware protect routes
- [x] 2.3 สร้างหน้า Login

## Phase 3: Dashboard & Layout
- [x] 3.1 สร้าง Dashboard Layout (Sidebar + Header)
- [x] 3.2 สร้างหน้า Dashboard (สถิติ + สรุปตามชั้น)

## Phase 4: นำเข้าข้อมูล Excel
- [x] 4.1 สร้าง Excel Parser (แปลงจาก Python)
- [x] 4.2 สร้าง API Import (/api/import)
- [x] 4.3 สร้างหน้านำเข้าข้อมูล (Upload + Preview)

## Phase 5: จัดการนักเรียน
- [x] 5.1 สร้าง API Students (/api/students)
- [x] 5.2 สร้างหน้ารายชื่อนักเรียน (ตาราง + Filter ปีการศึกษา/ชั้น)

## Phase 6: สร้าง PDF จดหมายเวียน
- [x] 6.1 สร้าง PDF Generator (pdfkit + THSarabunNew)
- [x] 6.2 สร้าง API Generate PDF (/api/generate-pdf)
- [x] 6.3 สร้างหน้าสร้างจดหมาย (เลือกปี + ชั้น + Download)

## Phase 7: ตั้งค่า
- [x] 7.1 จัดการภาคเรียน (เพิ่ม/ลบ)
- [x] 7.2 ตั้งค่าจดหมาย (ลายเซ็น Vercel Blob, ชื่อผู้ลงนาม, เนื้อหา)

## Phase 8: Git & Deploy
- [x] 8.1 Init git + push to GitHub
- [x] 8.2 สร้าง .env.example

## ข้อมูลการเข้าใช้งาน
- URL: http://localhost:3000
- Email: test@test.com
- Password: admin123

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM + Neon PostgreSQL
- NextAuth.js v5 (Credentials)
- pdfkit + THSarabunNew.ttf (PDF generation)
- xlsx (Excel parsing)
- Vercel Blob (ลายเซ็น)
