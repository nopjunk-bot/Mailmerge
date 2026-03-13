# Todolist - ระบบจดหมายเวียนแจ้งค่าเทอมค้างชำระ

## Phase 1: โครงสร้างพื้นฐาน
- [ ] 1.1 สร้างโปรเจค Next.js + ติดตั้ง dependencies
- [ ] 1.2 สร้าง Prisma Schema (User, Student, Semester, Payment, ImportBatch, Setting)
- [ ] 1.3 Run migration + Seed data (admin, semesters, settings)
- [ ] 1.4 Copy ฟอนต์ THSarabunNew.ttf ไป public/fonts/

## Phase 2: ระบบ Authentication
- [ ] 2.1 ตั้งค่า NextAuth.js (Credentials + JWT)
- [ ] 2.2 สร้าง Middleware protect routes
- [ ] 2.3 สร้างหน้า Login

## Phase 3: Dashboard & Layout
- [ ] 3.1 สร้าง Dashboard Layout (Sidebar + Header)
- [ ] 3.2 สร้างหน้า Dashboard (สถิติ + สรุปตามชั้น)

## Phase 4: นำเข้าข้อมูล Excel
- [ ] 4.1 สร้าง Excel Parser (แปลงจาก Python)
- [ ] 4.2 สร้าง API Import (/api/import)
- [ ] 4.3 สร้างหน้านำเข้าข้อมูล (Upload + Preview)

## Phase 5: จัดการนักเรียน
- [ ] 5.1 สร้าง API Students (/api/students)
- [ ] 5.2 สร้างหน้ารายชื่อนักเรียน (ตาราง + Filter ปีการศึกษา/ชั้น)

## Phase 6: สร้าง PDF จดหมายเวียน
- [ ] 6.1 สร้าง PDF Generator (pdfkit + THSarabunNew)
- [ ] 6.2 สร้าง API Generate PDF (/api/generate-pdf)
- [ ] 6.3 สร้างหน้าสร้างจดหมาย (เลือกปี + ชั้น + Download)

## Phase 7: ตั้งค่า
- [ ] 7.1 จัดการภาคเรียน (เพิ่ม/ลบ)
- [ ] 7.2 ตั้งค่าจดหมาย (ลายเซ็น Vercel Blob, ชื่อผู้ลงนาม, เนื้อหา)

## Phase 8: Git & Deploy
- [ ] 8.1 Init git + push to GitHub
- [ ] 8.2 สร้าง .env.example
