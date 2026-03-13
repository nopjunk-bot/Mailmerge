#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
โปรแกรมสร้างจดหมายเวียนแจ้งค่าเทอมค้างชำระ
สำหรับโรงเรียนมาบตาพุดพันพิทยาคาร
Version: Windows GUI
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os
import threading

class PaymentLetterGenerator:
    def __init__(self, root):
        self.root = root
        self.root.title("โปรแกรมสร้างจดหมายเวียนแจ้งค่าเทอม - โรงเรียนมาบตาพุดพันพิทยาคาร")
        self.root.geometry("700x550")
        self.root.resizable(False, False)
        
        # ตัวแปรสำหรับเก็บ path
        self.excel_file = None
        self.signature_file = None
        self.font_file = None
        self.output_folder = None
        
        self.create_widgets()
        
    def create_widgets(self):
        # หัวข้อโปรแกรม
        title_frame = tk.Frame(self.root, bg="#2c3e50", height=80)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(
            title_frame,
            text="โปรแกรมสร้างจดหมายเวียนแจ้งค่าเทอมค้างชำระ",
            font=("Arial", 16, "bold"),
            bg="#2c3e50",
            fg="white"
        )
        title_label.pack(pady=25)
        
        # Main content frame
        main_frame = tk.Frame(self.root, padx=30, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 1. ไฟล์ Excel
        excel_frame = tk.LabelFrame(main_frame, text="1. เลือกไฟล์ Excel ข้อมูลนักเรียน", padx=10, pady=10)
        excel_frame.pack(fill=tk.X, pady=10)
        
        self.excel_label = tk.Label(excel_frame, text="ยังไม่ได้เลือกไฟล์", fg="gray")
        self.excel_label.pack(side=tk.LEFT, padx=5)
        
        excel_btn = tk.Button(
            excel_frame,
            text="เลือกไฟล์ Excel",
            command=self.select_excel,
            bg="#3498db",
            fg="white",
            padx=15,
            pady=5
        )
        excel_btn.pack(side=tk.RIGHT)
        
        # 2. ไฟล์ลายเซ็น
        sig_frame = tk.LabelFrame(main_frame, text="2. เลือกไฟล์ลายเซ็น (JPG/PNG)", padx=10, pady=10)
        sig_frame.pack(fill=tk.X, pady=10)
        
        self.sig_label = tk.Label(sig_frame, text="ยังไม่ได้เลือกไฟล์", fg="gray")
        self.sig_label.pack(side=tk.LEFT, padx=5)
        
        sig_btn = tk.Button(
            sig_frame,
            text="เลือกไฟล์ลายเซ็น",
            command=self.select_signature,
            bg="#3498db",
            fg="white",
            padx=15,
            pady=5
        )
        sig_btn.pack(side=tk.RIGHT)
        
        # 3. ไฟล์ฟอนต์
        font_frame = tk.LabelFrame(main_frame, text="3. เลือกไฟล์ฟอนต์ THSarabunNew.ttf", padx=10, pady=10)
        font_frame.pack(fill=tk.X, pady=10)
        
        self.font_label = tk.Label(font_frame, text="ยังไม่ได้เลือกไฟล์", fg="gray")
        self.font_label.pack(side=tk.LEFT, padx=5)
        
        font_btn = tk.Button(
            font_frame,
            text="เลือกไฟล์ฟอนต์",
            command=self.select_font,
            bg="#3498db",
            fg="white",
            padx=15,
            pady=5
        )
        font_btn.pack(side=tk.RIGHT)
        
        # 4. โฟลเดอร์บันทึก
        output_frame = tk.LabelFrame(main_frame, text="4. เลือกโฟลเดอร์บันทึกไฟล์ PDF", padx=10, pady=10)
        output_frame.pack(fill=tk.X, pady=10)
        
        self.output_label = tk.Label(output_frame, text="ยังไม่ได้เลือกโฟลเดอร์", fg="gray")
        self.output_label.pack(side=tk.LEFT, padx=5)
        
        output_btn = tk.Button(
            output_frame,
            text="เลือกโฟลเดอร์",
            command=self.select_output,
            bg="#3498db",
            fg="white",
            padx=15,
            pady=5
        )
        output_btn.pack(side=tk.RIGHT)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.pack(fill=tk.X, pady=10)
        
        # Status label
        self.status_label = tk.Label(main_frame, text="พร้อมใช้งาน", fg="green")
        self.status_label.pack(pady=5)
        
        # ปุ่มสร้างจดหมาย
        self.generate_btn = tk.Button(
            main_frame,
            text="สร้างจดหมายเวียน",
            command=self.generate_letters,
            bg="#27ae60",
            fg="white",
            font=("Arial", 12, "bold"),
            padx=30,
            pady=10
        )
        self.generate_btn.pack(pady=20)
        
    def select_excel(self):
        filename = filedialog.askopenfilename(
            title="เลือกไฟล์ Excel",
            filetypes=[("Excel files", "*.xlsx *.xls")]
        )
        if filename:
            self.excel_file = filename
            self.excel_label.config(text=os.path.basename(filename), fg="black")
            
    def select_signature(self):
        filename = filedialog.askopenfilename(
            title="เลือกไฟล์ลายเซ็น",
            filetypes=[("Image files", "*.jpg *.jpeg *.png")]
        )
        if filename:
            self.signature_file = filename
            self.sig_label.config(text=os.path.basename(filename), fg="black")
            
    def select_font(self):
        filename = filedialog.askopenfilename(
            title="เลือกไฟล์ฟอนต์",
            filetypes=[("Font files", "*.ttf")]
        )
        if filename:
            self.font_file = filename
            self.font_label.config(text=os.path.basename(filename), fg="black")
            
    def select_output(self):
        folder = filedialog.askdirectory(title="เลือกโฟลเดอร์บันทึกไฟล์")
        if folder:
            self.output_folder = folder
            self.output_label.config(text=folder, fg="black")
            
    def generate_letters(self):
        # ตรวจสอบว่าเลือกไฟล์ครบหรือยัง
        if not self.excel_file:
            messagebox.showerror("ข้อผิดพลาด", "กรุณาเลือกไฟล์ Excel")
            return
        if not self.signature_file:
            messagebox.showerror("ข้อผิดพลาด", "กรุณาเลือกไฟล์ลายเซ็น")
            return
        if not self.font_file:
            messagebox.showerror("ข้อผิดพลาด", "กรุณาเลือกไฟล์ฟอนต์")
            return
        if not self.output_folder:
            messagebox.showerror("ข้อผิดพลาด", "กรุณาเลือกโฟลเดอร์บันทึกไฟล์")
            return
            
        # เริ่มสร้างจดหมายใน thread แยก
        self.generate_btn.config(state=tk.DISABLED)
        self.progress.start()
        self.status_label.config(text="กำลังสร้างจดหมาย...", fg="orange")
        
        thread = threading.Thread(target=self.process_letters)
        thread.start()
        
    def process_letters(self):
        try:
            # อ่านข้อมูล
            students = self.read_excel_data(self.excel_file)
            
            if not students:
                self.root.after(0, lambda: messagebox.showinfo(
                    "ข้อมูล",
                    "ไม่พบนักเรียนที่มียอดค้างชำระในไฟล์นี้"
                ))
                self.root.after(0, self.reset_ui)
                return
            
            # สร้าง PDF
            output_file = os.path.join(
                self.output_folder,
                f"payment_letters_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            )
            
            self.create_pdf(students, output_file)
            
            # แจ้งเตือนเสร็จสิ้น
            self.root.after(0, lambda: messagebox.showinfo(
                "สำเร็จ!",
                f"สร้างจดหมายเรียบร้อย {len(students)} ฉบับ\n\nบันทึกที่: {output_file}"
            ))
            
            # เปิดโฟลเดอร์
            self.root.after(0, lambda: os.startfile(self.output_folder))
            
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror(
                "ข้อผิดพลาด",
                f"เกิดข้อผิดพลาด: {str(e)}"
            ))
        finally:
            self.root.after(0, self.reset_ui)
            
    def reset_ui(self):
        self.progress.stop()
        self.generate_btn.config(state=tk.NORMAL)
        self.status_label.config(text="พร้อมใช้งาน", fg="green")
        
    def read_excel_data(self, excel_file):
        """อ่านข้อมูลจาก Excel"""
        xl = pd.ExcelFile(excel_file)
        students_with_debt = []
        
        for sheet_name in xl.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
            
            # หาทุกแถวที่เป็นจุดเริ่มต้นของห้องเรียนแต่ละห้อง
            class_sections = []
            for idx, row in df.iterrows():
                if pd.notna(row[0]) and 'รายชื่อนักเรียนชั้น' in str(row[0]):
                    class_name_full = str(row[0])
                    class_name = None
                    
                    # ดึงชั้นเรียน เช่น ม.3/1
                    if 'มัธยมศึกษาปีที่' in class_name_full:
                        parts = class_name_full.split('มัธยมศึกษาปีที่')
                        if len(parts) > 1:
                            class_info = parts[1].strip().split()[0]
                            class_name = f"ม.{class_info}"
                    
                    if class_name:
                        class_sections.append({'row': idx, 'name': class_name})
            
            # ถ้าไม่พบห้องเรียน ข้าม sheet นี้
            if not class_sections:
                continue
            
            # ประมวลผลแต่ละห้องเรียน
            for i, section in enumerate(class_sections):
                class_name = section['name']
                start_row = section['row']
                
                # กำหนดแถวสุดท้ายของห้องนี้
                if i < len(class_sections) - 1:
                    end_row = class_sections[i + 1]['row']
                else:
                    end_row = len(df)
                
                # หาแถว header ของห้องนี้
                header_row = None
                for idx in range(start_row, min(start_row + 10, end_row)):
                    row = df.iloc[idx]
                    if pd.notna(row[0]) and str(row[0]).strip() == 'เลขที่':
                        header_row = idx
                        break
                
                if header_row is None:
                    continue
                
                # อ่านข้อมูลนักเรียนของห้องนี้
                for idx in range(header_row + 2, end_row):
                    row = df.iloc[idx]
                    
                    # ถ้าเจอห้องใหม่ ให้หยุด
                    if pd.notna(row[0]) and 'รายชื่อนักเรียนชั้น' in str(row[0]):
                        break
                    
                    if pd.isna(row[0]) or pd.isna(row[2]):
                        continue
                    
                    try:
                        student_no = int(row[0]) if pd.notna(row[0]) else None
                        student_id = str(row[1]) if pd.notna(row[1]) else ""
                        prefix = str(row[2]) if pd.notna(row[2]) else ""
                        first_name = str(row[3]) if pd.notna(row[3]) else ""
                        last_name = str(row[4]) if pd.notna(row[4]) else ""
                        
                        outstanding_payments = []
                        
                        # ตรวจสอบยอดค้างแต่ละภาคเรียน
                        for col_idx, term_id in [(5, '1/2566'), (6, '2/2566'), (7, '1/2567'), 
                                                  (8, '2/2567'), (9, '1/2568'), (10, '2/2568')]:
                            if pd.notna(row[col_idx]) and str(row[col_idx]).strip() != 'จ่ายแล้ว':
                                try:
                                    amount = float(str(row[col_idx]).strip())
                                    outstanding_payments.append({'term': term_id, 'amount': amount})
                                except:
                                    pass
                        
                        if outstanding_payments:
                            total = sum(payment['amount'] for payment in outstanding_payments)
                            
                            student_data = {
                                'student_no': student_no,
                                'student_id': student_id,
                                'prefix': prefix,
                                'first_name': first_name,
                                'last_name': last_name,
                                'class': class_name,
                                'outstanding_payments': outstanding_payments,
                                'total': total
                            }
                            students_with_debt.append(student_data)
                            
                    except:
                        continue
        
        return students_with_debt
    
    def create_pdf(self, students, output_file):
        """สร้างไฟล์ PDF"""
        # ลงทะเบียนฟอนต์
        pdfmetrics.registerFont(TTFont('THSarabunNew', self.font_file))
        font_name = 'THSarabunNew'
        
        # สร้าง PDF
        doc = SimpleDocTemplate(
            output_file,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        story = []
        
        for i, student in enumerate(students):
            # สร้างเนื้อหาจดหมาย
            letter_content = self.create_letter(student, font_name)
            story.extend(letter_content)
            
            if i < len(students) - 1:
                story.append(PageBreak())
        
        doc.build(story)
        
    def create_letter(self, student, font_name):
        """สร้างเนื้อหาจดหมายสำหรับนักเรียนหนึ่งคน"""
        styles = getSampleStyleSheet()
        story = []
        
        # สร้าง custom styles
        title_style = ParagraphStyle(
            'ThaiTitle',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=16,
            alignment=TA_CENTER,
            spaceAfter=12,
            leading=20
        )
        
        normal_style = ParagraphStyle(
            'ThaiNormal',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=14,
            alignment=TA_LEFT,
            spaceAfter=6,
            leading=18
        )
        
        student_info_style = ParagraphStyle(
            'StudentInfo',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=12,
            alignment=TA_RIGHT,
            spaceAfter=6,
            leading=16
        )
        
        # ชื่อนักเรียนที่มุมขวาบน
        student_name = f"{student['prefix']}{student['first_name']} {student['last_name']}"
        student_class = student['class']
        story.append(Paragraph(f"ชื่อ: {student_name}", student_info_style))
        story.append(Paragraph(f"ชั้น: {student_class}", student_info_style))
        story.append(Spacer(1, 0.3*cm))
        
        # หัวจดหมาย
        story.append(Paragraph("โรงเรียนมาบตาพุดพันพิทยาคาร", title_style))
        story.append(Paragraph("498 ต.เนินพระ อ.เมือง จ.ระยอง", title_style))
        story.append(Spacer(1, 0.5*cm))
        
        # เรื่อง
        story.append(Paragraph("เรื่อง ติดตามการชำระเงินค่าบำรุงการศึกษา", normal_style))
        story.append(Spacer(1, 0.3*cm))
        
        # ผู้รับจดหมาย
        recipient = f"เรียน ผู้ปกครองของ{student['prefix']}{student['first_name']} {student['last_name']} นักเรียนชั้น {student['class']}"
        story.append(Paragraph(recipient, normal_style))
        story.append(Spacer(1, 0.5*cm))
        
        # เนื้อหาจดหมาย
        content = """เนื่องด้วยขณะนี้เข้าสู่ช่วงปลายภาคเรียนที่ 2 ปีการศึกษา 2568 ซึ่งเป็นภาคเรียนสุดท้าย
ในการสำเร็จการศึกษาของนักเรียนชั้นมัธยมศึกษาปีที่ 3 และ ชั้นมัธยมศึกษาปีที่ 6 โรงเรียนจึงขอความ
อนุเคราะห์ท่านผู้ปกครองตรวจสอบและดำเนินการชำระเงินบำรุงการศึกษาที่ยังค้างอยู่ ให้แล้วเสร็จ ภายในวันที่ 
13 มีนาคม 2569 มียอดค้างชำระค่าบำรุงการศึกษาดังรายละเอียดต่อไปนี้"""
        story.append(Paragraph(content, normal_style))
        story.append(Spacer(1, 0.5*cm))
        
        # ตารางแสดงยอดค้างชำระ
        table_data = [['ภาคเรียน/ปีการศึกษา', 'ยอดชำระ']]
        for payment in student['outstanding_payments']:
            table_data.append([payment['term'], f"{payment['amount']:.0f}"])
        table_data.append(['รวม', f"{student['total']:.0f}"])
        
        table = Table(table_data, colWidths=[8*cm, 8*cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), font_name),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.5*cm))
        
        # ข้อความปิดท้าย
        closing = """จึงขอใคร่ความร่วมมือจากผู้ปกครองให้ชำระเงินค่าบำรุงการศึกษาตามยอดดังกล่าวที่ห้องการเงินโรงเรียน
มาบตาพุดพันพิทยาคาร ในวันและเวลาราชการ และขอภัยหากท่านชำระแล้ว โดยสามารถตรวจสอบยอดกับทาง
โรงเรียนได้ที่ เบอร์โทร 081-7232569"""
        story.append(Paragraph(closing, normal_style))
        story.append(Spacer(1, 1*cm))
        
        # ลายเซ็น
        signature_style = ParagraphStyle(
            'Signature',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=6,
            leading=18
        )
        
        story.append(Paragraph("ขอแสดงความนับถือ", signature_style))
        story.append(Spacer(1, 0.5*cm))
        
        # เพิ่มลายเซ็นรูปภาพ
        if self.signature_file and os.path.exists(self.signature_file):
            try:
                sig_img = Image(self.signature_file, width=4*cm, height=2*cm)
                sig_img.hAlign = 'CENTER'
                story.append(sig_img)
            except:
                story.append(Spacer(1, 1*cm))
        else:
            story.append(Spacer(1, 1*cm))
        
        story.append(Paragraph("(นางสาวจิรัตติกาญจน์ สุรีวรานนท์)", signature_style))
        story.append(Paragraph("รองผู้อำนวยการกลุ่มบริหารงบประมาณ", signature_style))
        story.append(Paragraph("โรงเรียนมาบตาพุดพันพิทยาคาร", signature_style))
        story.append(Spacer(1, 0.5*cm))
        
        # หมายเหตุ
        now = datetime.now()
        note = f"หมายเหตุ : ข้อมูลอัพเดต ณ วันที่ {now.day}/{now.month}/{now.year+543} เวลา {now.hour}.{now.minute:02d} น."
        story.append(Paragraph(note, normal_style))
        
        return story

def main():
    root = tk.Tk()
    app = PaymentLetterGenerator(root)
    root.mainloop()

if __name__ == "__main__":
    main()
